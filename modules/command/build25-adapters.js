/* Build25 compatibility ports. No document, DOM, Plan model or global app state access. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const core = root.commandFoundation;
  function install(registry, port) {
    const cad = context => context.mode === 'cad';
    registry.register({ id: 'U', aliases: ['UNDO'], available: cad,
      create: () => ({ immediate: true, commit: () => port.undo() }) });
    registry.register({ id: 'REDO', available: cad,
      create: () => ({ immediate: true, commit: () => port.redo() }) });
    registry.register({ id: 'RO', aliases: ['ROTATE'], available: ctx => cad(ctx) && Boolean(ctx.regionId),
      transactional: true, legacyOwnsHistory: true,
      create() {
        // This ephemeral draft is also the legacy renderer projection. Its Set is a
        // start-time working-set snapshot, including hidden layers as in Build25.
        const draft = port.beginRotation();
        if (!draft) throw new Error('Region rotation unavailable');
        function preview({ point, shift = false }) {
          if (!core.finitePoint(point)) return { ok: false, code: 'invalid-point' };
          if (!draft.base) return { ok: true };
          const p = port.snap(point);
          if (draft.phase === 'reference') draft.referencePoint = { ...p };
          else if (draft.phase === 'target') {
            let angle = Math.atan2(p.y - draft.base.y, p.x - draft.base.x) * 180 / Math.PI;
            if (shift) angle = Math.round(angle / 90) * 90;
            const length = Math.max(Math.hypot(p.x - draft.base.x, p.y - draft.base.y), 80 / port.zoom());
            draft.targetAngle = angle;
            draft.targetPoint = { x: draft.base.x + Math.cos(angle * Math.PI / 180) * length,
              y: draft.base.y + Math.sin(angle * Math.PI / 180) * length };
          }
          port.previewPoint(p);
          return { ok: true };
        }
        return {
          view: () => draft,
          describe: () => ({ phase: draft.phase, promptKey: draft.phase === 'base' ? 'command.rotateBase' : draft.phase === 'reference' ? 'command.rotateReference' : 'command.rotateTarget', input: draft.phase === 'target' ? ['point','angle','H','V'] : ['point'] }),
          preview,
          input(event) {
            if (event.type === 'text') {
              if (draft.phase !== 'target') return { ok: false, code: 'point-required' };
              const input = core.parseInput(event.text, { expect: 'angle',
                keywords: { H: 0, HORIZONTAL: 0, V: 90, VERTICAL: 90 } });
              // Preserve baseline Number() compatibility for historical numeric forms.
              const legacy = String(event.text ?? '').trim();
              const angle = input.ok && input.kind !== 'enter' ? input.value : legacy ? Number(legacy) : NaN;
              if (!Number.isFinite(angle)) return { ok: false, code: 'invalid-angle' };
              draft.targetAngle = angle;
              return { ok: true, commit: true };
            }
            if (event.type !== 'point' || !core.finitePoint(event.point)) return { ok: false, code: 'invalid-point' };
            const p = port.snap(event.point);
            if (draft.phase === 'base') {
              draft.base = { ...p }; draft.referencePoint = { ...p }; draft.phase = 'reference';
              port.prompt('command.rotateReference');
            } else if (draft.phase === 'reference') {
              if (Math.hypot(p.x - draft.base.x, p.y - draft.base.y) < 8 / port.zoom()) {
                port.prompt('command.rotateReferenceTooClose', 'error');
                return { ok: false, code: 'reference-too-close' };
              }
              draft.referencePoint = { ...p };
              draft.referenceAngle = Math.atan2(p.y - draft.base.y, p.x - draft.base.x) * 180 / Math.PI;
              draft.targetPoint = { ...p }; draft.targetAngle = draft.referenceAngle; draft.phase = 'target';
              port.prompt('command.rotateTarget');
            } else if (draft.phase === 'target') {
              preview(event); return { ok: true, commit: true };
            }
            return { ok: true };
          },
          commit(delta) {
            if (draft.phase !== 'target' || !core.finitePoint(draft.base) || !Number.isFinite(draft.referenceAngle) || !Number.isFinite(draft.targetAngle)) return false;
            if (!port.validRotation(draft)) { const failure = new Error('stale-context'); failure.code = 'stale-context'; throw failure; }
            return port.commitRotation(delta === undefined ? port.previewDelta(draft) : delta);
          },
          cancel(reason) { port.clearRotation(draft, reason); }
        };
      }
    });
  }
  root.build25CommandAdapters = Object.freeze({ install });
})();
