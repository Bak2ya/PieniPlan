/* CAD command foundation: synchronous, DOM-free, capability-injected core. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const normalize = value => String(value ?? '').trim().toUpperCase();
  const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
  const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
  const numeric = text => numberPattern.test(text) && Number.isFinite(Number(text));
  const error = code => ({ ok: false, code });

  // Parse only; interpretation (distance vs angle) belongs to the current prompt.
  function parseInput(raw, { expect = 'point', base = null, direction = null, keywords = {} } = {}) {
    const text = String(raw ?? '').trim(), upper = normalize(text);
    if (!text) return { ok: true, kind: 'enter' };
    if (Object.hasOwn(keywords, upper)) return { ok: true, kind: 'keyword', value: keywords[upper] };
    if (expect === 'keyword') return error('unknown-keyword');
    if (expect === 'angle' || expect === 'distance' || expect === 'number') {
      if (!numeric(text)) return error('invalid-number');
      const value = Number(text);
      if (expect === 'distance' && value < 0) return error('negative-distance');
      return { ok: true, kind: expect, value };
    }
    if (expect !== 'point') return error('unsupported-input-kind');
    const relative = text.startsWith('@'), body = relative ? text.slice(1) : text;
    if (relative && !finitePoint(base)) return error('base-required');
    const origin = relative ? base : { x: 0, y: 0 };
    let point, parts;
    if (body.includes(',')) {
      parts = body.split(',').map(v => v.trim());
      if (parts.length !== 2 || !parts.every(numeric)) return error('invalid-coordinate');
      point = { x: origin.x + Number(parts[0]), y: origin.y + Number(parts[1]) };
    } else if (body.includes('<')) {
      parts = body.split('<').map(v => v.trim());
      if (parts.length !== 2 || !parts.every(numeric) || Number(parts[0]) < 0) return error('invalid-polar');
      const angle = Number(parts[1]) * Math.PI / 180, distance = Number(parts[0]);
      point = { x: origin.x + distance * Math.cos(angle), y: origin.y + distance * Math.sin(angle) };
    } else if (!relative && numeric(body)) {
      if (!finitePoint(base) || !finitePoint(direction) || Math.hypot(direction.x, direction.y) === 0) return error('direction-required');
      const distance = Number(body), length = Math.hypot(direction.x, direction.y);
      if (distance < 0) return error('negative-distance');
      point = { x: base.x + distance * direction.x / length, y: base.y + distance * direction.y / length };
    } else return error('invalid-coordinate');
    return finitePoint(point) ? { ok: true, kind: 'point', point, relative } : error('non-finite-point');
  }

  function createRegistry() {
    const definitions = new Map(), aliases = new Map();
    return Object.freeze({
      register(definition) {
        const id = normalize(definition.id);
        if (!id || typeof definition.create !== 'function') throw new TypeError('Command needs id and create');
        const names = [...new Set([id, ...(definition.aliases || []).map(normalize)])];
        if (names.some(name => !name || aliases.has(name))) throw new Error('Duplicate/empty command alias');
        const def = Object.freeze({ ...definition, id, aliases: Object.freeze(names) });
        definitions.set(id, def);
        names.forEach(name => aliases.set(name, id));
        return def;
      },
      resolve: raw => definitions.get(aliases.get(normalize(raw))) || null,
      list: () => [...definitions.values()]
    });
  }

  // capture/restore must include document AND history cursor. The host owns persistence.
  // Legacy callbacks already push one history entry; new callbacks use record(before).
  function createTransaction({ capture, restore, record = null }) {
    let busy = false;
    return Object.freeze({
      run(apply, { legacyOwnsHistory = false } = {}) {
        if (busy) throw new Error('Nested transaction');
        if (apply.constructor?.name === 'AsyncFunction') throw new TypeError('Async transactions are unsupported');
        if (!legacyOwnsHistory && typeof record !== 'function') {
          const failure = new Error('missing-history-recorder'); failure.code = 'missing-history-recorder'; throw failure;
        }
        busy = true;
        let before, captured = false;
        try {
          before = capture(); captured = true;
          const result = apply();
          if (result && typeof result.then === 'function') throw new Error('Async transactions are unsupported');
          if (result === false) { restore(before); return false; }
          if (!legacyOwnsHistory) record(before);
          return result;
        } catch (failure) {
          if (captured) restore(before);
          throw failure;
        } finally { busy = false; }
      }
    });
  }

  function createSession({ registry, context = () => ({}), transaction = null, maxHistory = 100 }) {
    if (!Number.isInteger(maxHistory) || maxHistory < 1) throw new TypeError('maxHistory must be a positive integer');
    let active = null, last = null, sequence = 0, busy = false;
    const history = [];
    function log(id, status, detail) {
      history.push(Object.freeze({ sequence: ++sequence, id, status, detail: detail || null }));
      if (history.length > maxHistory) history.shift();
    }
    function cancel(reason = 'cancel') {
      if (busy) return false;
      if (!active) return false;
      const old = active; active = null;
      try { old.command.cancel?.(reason); }
      catch (failure) { log(old.definition.id, 'failed', String(failure.message || failure)); return false; }
      log(old.definition.id, 'cancelled', reason);
      return true;
    }
    function fail(failure) {
      const old = active; active = null;
      let message = String(failure.message || failure);
      try { old?.command.cancel?.('failure'); } catch (cleanup) { message += '; cleanup: ' + String(cleanup.message || cleanup); }
      if (old) log(old.definition.id, 'failed', message);
      return { ok: false, code: 'command-failed', errorCode: failure.code || null, message: String(failure.message || failure) };
    }
    function commit(value) {
      if (!active || busy) return error('no-active-command');
      const old = active;
      // Persistent model commit and transient command finalization are deliberately separate.
      busy = true;
      try {
        if (old.command.commit.constructor?.name === 'AsyncFunction') throw new TypeError('Async commands are unsupported');
        const apply = () => old.command.commit(value);
        const result = old.definition.transactional
          ? transaction.run(apply, { legacyOwnsHistory: Boolean(old.definition.legacyOwnsHistory) }) : apply();
        if (result === false) { active = null; try { old.command.cancel?.('rejected'); } catch (_) {} log(old.definition.id,'rejected'); return {ok:false,code:'commit-rejected',value:result}; }
        active = null;
        let finalizeFailure = null;
        try { old.command.finalize?.('finished'); }
        catch (failure) { finalizeFailure = failure; }
        if (finalizeFailure) {
          log(old.definition.id, 'finalize-failed', String(finalizeFailure.message || finalizeFailure));
          return { ok: true, code: 'committed-finalize-failed', value: result, finalizeError: String(finalizeFailure.message || finalizeFailure) };
        }
        log(old.definition.id, 'committed');
        return { ok: true, code: 'committed', value: result };
      } catch (failure) { return fail(failure); }
      finally { busy = false; }
    }
    function start(raw) {
      if (busy) return error('busy');
      const definition = registry.resolve(raw), ctx = context();
      if (!definition) return error('unknown-command');
      if (definition.available && !definition.available(ctx)) return error('unavailable');
      if (definition.transactional && !transaction) return error('transaction-required');
      if (active && !cancel('superseded')) return error('cleanup-failed');
      try {
        const command = definition.create(ctx);
        if (!command || typeof command.commit !== 'function') throw new TypeError('Invalid command instance');
        active = { definition, command };
        if (definition.repeatable !== false) last = definition.id;
        log(definition.id, 'started');
        return command.immediate ? commit() : { ok: true, code: 'started' };
      } catch (failure) { if (!active) log(definition.id, 'failed', String(failure.message || failure)); return fail(failure); }
    }
    function dispatch(event) {
      if (busy) return error('busy');
      if (!active) return error('no-active-command');
      try {
        const result = active.command.input?.(event) || error('input-not-supported');
        return result.commit ? commit(result.value) : result;
      } catch (failure) { return fail(failure); }
    }
    function preview(event) {
      if (busy || !active) return error('no-active-command');
      try { return active.command.preview?.(event) || { ok: true }; }
      catch (failure) { return fail(failure); }
    }
    return Object.freeze({ start, dispatch, preview, commit, cancel,
      repeat: () => active ? error('command-active') : last ? start(last) : error('no-previous-command'),
      get activeId() { return active?.definition.id || null; },
      get lastCommand() { return last; },
      get view() { return active?.command.view?.() || null; },
      describe: () => active ? { id: active.definition.id, ...active.command.describe?.() } : { id: null, phase: 'idle' },
      getHistory: () => history.slice()
    });
  }
  root.commandFoundation = Object.freeze({ normalize, finitePoint, parseInput, createRegistry, createSession, createTransaction });
})();
