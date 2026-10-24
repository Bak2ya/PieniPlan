/* Workspace presentation only. Never edits drawing state, camera or history. */
(() => {
  'use strict';
  const module = window.PieniPlanModules = window.PieniPlanModules || {};
  module.workspaceChrome = { create };

  function create({ t, mode, navigate, closeOtherMenus, interactionBusy }) {
    const $ = id => document.getElementById(id);
    const shell = $('appShell'), rail = $('toolRail'), workspace = shell.querySelector('.workspace');
    const left = shell.querySelector('.topbar-left'), anchor = $('brandAnchor'), logo = $('homeBtn'), menu = $('brandMenu');
    const panel = $('workspaceInspector'), pin = $('inspectorPin'), handle = $('inspectorHandle');
    const title = $('documentTitle');
    const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } };
    const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
    let pinned = read('pieniplan-inspector-pinned', 'true') !== 'false';
    const choices = { open: ['hover', 'click'], close: ['auto', 'click'] };
    const preferenceKey = { open: 'pieniplan-inspector-open-method', close: 'pieniplan-inspector-close-method' };
    const preference = (kind, value) => choices[kind].includes(value) ? value : choices[kind][0];
    let openMethod = preference('open', read(preferenceKey.open, 'hover'));
    let closeMethod = preference('close', read(preferenceKey.close, 'auto'));
    const savedOpen = read('pieniplan-inspector-open', null);
    let preferredOpen = savedOpen === 'true' ? true : savedOpen === 'false' ? false : pinned;
    let open = preferredOpen, explicitHold = false, transientHover = false;
    let menuOpen = false, menuPinned = false, panelTimer = 0, menuTimer = 0, menuFocusTimer = 0, hoverTimer = 0;
    let pointerInside = false, handleInside = false, held = false, popupOwned = false;
    let handleHoverOpenedAt = 0;
    let toolbarAnimation = null;
    const expandedRail = document.createElement('div');
    expandedRail.id = 'expandedToolRail';
    expandedRail.className = 'tool-rail expanded-tool-rail';
    expandedRail.hidden = true;
    expandedRail.setAttribute('role', 'toolbar');
    expandedRail.setAttribute('aria-label', t('toolbar.expand'));
    workspace.prepend(expandedRail);
    const hover = matchMedia('(hover: hover)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const clearPanelTimer = () => { clearTimeout(panelTimer); panelTimer = 0; };
    const floatingPopup = () => document.querySelector('.layer-color-popover, .floor-action-menu, .component-palette, .constraint-palette, dialog[open], .dialog-backdrop:not([hidden])');
    const busy = () => panel.contains(document.activeElement) || held || (popupOwned && floatingPopup()) || interactionBusy?.();

    function panelVisible() { return pinned || open; }
    function preferences() { return { openMethod, closeMethod }; }
    function setPreferences({ openMethod: nextOpen = openMethod, closeMethod: nextClose = closeMethod } = {}) {
      openMethod = preference('open', nextOpen);
      closeMethod = preference('close', nextClose);
      write(preferenceKey.open, openMethod);
      write(preferenceKey.close, closeMethod);
      clearPanelTimer();
      if (closeMethod === 'auto') scheduleClose();
      return preferences();
    }
    function paintPanel() {
      shell.classList.toggle('inspector-autohide', !pinned);
      shell.classList.toggle('inspector-revealed', !pinned && open);
      handle.hidden = pinned;
      handle.setAttribute('aria-expanded', String(!pinned && open));
      const handleAction = !pinned && open ? 'workspace.hidePanel' : 'workspace.showPanel';
      handle.setAttribute('aria-label', t(handleAction));
      handle.title = t(handleAction);
      pin.setAttribute('aria-pressed', String(pinned));
      pin.setAttribute('aria-label', t(pinned ? 'workspace.autoHide' : 'workspace.pinPanel'));
      pin.title = t(pinned ? 'workspace.autoHide' : 'workspace.pinPanel');
      panel.inert = !pinned && !open;
      panel.setAttribute('aria-hidden', String(!pinned && !open));
    }
    function rememberOpen(value) {
      preferredOpen = value;
      write('pieniplan-inspector-open', String(value));
    }
    function reveal({ focus = false, explicit = false, persist = false, transient = false } = {}) {
      clearPanelTimer();
      if (explicit) { explicitHold = !pointerInside; transientHover = false; }
      if (persist || explicit) rememberOpen(true);
      if (!pinned && !open) {
        open = true;
        transientHover = transient && !explicit;
        paintPanel();
        // Reconcile pending layer selection only once the inspector becomes usable.
        panel.dispatchEvent(new CustomEvent('pieniplan:inspector-shown', { bubbles: false }));
      }
      if (focus) { panel.getBoundingClientRect(); pin.focus({ preventScroll: true }); }
    }
    function close({ persist = true, focus = false } = {}) {
      if (pinned) return;
      clearPanelTimer();
      open = false; explicitHold = false; transientHover = false;
      if (persist) rememberOpen(false);
      paintPanel();
      if (focus) handle.focus({ preventScroll: true });
    }
    function scheduleClose() {
      clearPanelTimer();
      if (pinned || explicitHold || closeMethod !== 'auto' || pointerInside || handleInside || busy()) return;
      panelTimer = setTimeout(() => {
        if (!pinned && !explicitHold && closeMethod === 'auto' && !pointerInside && !handleInside && !busy()) close({ persist: !transientHover });
      }, 360);
    }
    function setPinned(value) {
      clearPanelTimer();
      const wasVisible = panelVisible();
      pinned = Boolean(value);
      // Pin changes dismissal policy only. Unpin keeps the same visible panel.
      open = pinned || wasVisible;
      explicitHold = !pinned && open && !pointerInside;
      transientHover = false;
      rememberOpen(open);
      write('pieniplan-inspector-pinned', String(pinned));
      paintPanel();
      if (!wasVisible && panelVisible()) panel.dispatchEvent(new CustomEvent('pieniplan:inspector-shown'));
    }
    function paintMenu() {
      logo.setAttribute('aria-label', t('workspace.appMenu'));
      logo.title = t('workspace.appMenu');
      for (const item of menu.querySelectorAll('[data-workspace-destination]')) {
        const selected = item.dataset.workspaceDestination === mode();
        if (item.getAttribute('role') === 'menuitemradio') item.setAttribute('aria-checked', String(selected));
      }
    }
    function setMenu(value, { focus = false, restore = false, pinned = false } = {}) {
      clearTimeout(menuTimer); clearTimeout(hoverTimer); clearTimeout(menuFocusTimer);
      menuOpen = Boolean(value); menuPinned=menuOpen&&pinned;
      anchor.dataset.menuState=menuOpen?(menuPinned?'pinned':'hover'):'closed';
      if (menuOpen) { closeOtherMenus?.(); paintMenu(); }
      anchor.classList.toggle('menu-open', menuOpen);
      logo.setAttribute('aria-expanded', String(menuOpen));
      menu.setAttribute('aria-hidden', String(!menuOpen)); menu.inert = !menuOpen;
      if (focus && menuOpen) { menu.getBoundingClientRect(); menu.querySelector('button[aria-checked="true"]')?.focus({ preventScroll: true }); }
      if (restore) logo.focus({ preventScroll: true });
    }
    function scheduleMenuClose() {
      clearTimeout(hoverTimer); clearTimeout(menuTimer);
      menuTimer = setTimeout(() => {
        if (!menuPinned && !anchor.matches(':hover') && !anchor.contains(document.activeElement)) setMenu(false);
      }, 240);
    }
    logo.addEventListener('click', () => setMenu(!menuPinned, {pinned:!menuPinned}));
    anchor.addEventListener('pointerenter', event => {
      clearTimeout(menuTimer);
      if (hover.matches && event.pointerType !== 'touch' && !menuOpen) hoverTimer = setTimeout(() => setMenu(true), 150);
    });
    anchor.addEventListener('pointerleave', scheduleMenuClose);
    anchor.addEventListener('focusout', event => {
      // Focusout can run before the browser installs the new activeElement.
      // Closing here would make the menu inert before a pointer click reaches
      // its own item. Retain internal focus moves and inspect external ones
      // only after the browser has completed that focus transition.
      if (anchor.contains(event.relatedTarget)) return;
      clearTimeout(menuFocusTimer);
      menuFocusTimer = setTimeout(() => {
        if (!anchor.contains(document.activeElement)) setMenu(false);
      }, 0);
    });
    // Capture so menu keys never become CAD commands or cancel a live drawing.
    anchor.addEventListener('keydown', event => {
      if (!['Enter', ' ', 'Escape', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) return;
      if (event.key === 'Tab') { setMenu(false); return; }
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, { restore: true }); return; }
      if (event.target === logo && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); setMenu(true, { focus: true, pinned: true }); return;
      }
      const items = [...menu.querySelectorAll('button')];
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next].focus();
      }
    });
    menu.addEventListener('click', event => {
      const target = event.target.closest('[data-workspace-destination]');
      if (!target) return;
      setMenu(false, { restore: true }); navigate(target.dataset.workspaceDestination); paintMenu();
    });
    document.addEventListener('pointerdown', event => {
      if (!anchor.contains(event.target)) setMenu(false);
      if (panel.contains(event.target)) { held = true; popupOwned = true; clearPanelTimer(); }
      else if (!handle.contains(event.target) && !floatingPopup()?.contains(event.target)) {
        explicitHold = false; popupOwned = false; scheduleClose();
      }
    }, true);
    document.addEventListener('pointerup', () => { held = false; queueMicrotask(scheduleClose); }, true);
    document.addEventListener('pointercancel', () => { held = false; queueMicrotask(scheduleClose); }, true);
    document.addEventListener('keydown', event => {
      if (menuOpen && event.key === 'Escape') {
        event.preventDefault(); event.stopImmediatePropagation();
        setMenu(false, { restore: true });
      }
    }, true);
    document.addEventListener('focusin', () => {
      if (panel.contains(document.activeElement)) clearPanelTimer(); else scheduleClose();
    });
    panel.addEventListener('focusout', () => queueMicrotask(scheduleClose));
    panel.addEventListener('pointerenter', () => { pointerInside = true; explicitHold = false; reveal(); });
    panel.addEventListener('pointerleave', () => { pointerInside = false; scheduleClose(); });
    handle.addEventListener('pointerenter', event => {
      handleInside = true;
      if (openMethod === 'hover' && event.pointerType !== 'touch' && hover.matches && !pinned && !open) {
        handleHoverOpenedAt = Date.now();
        reveal({ transient: true });
      }
    });
    handle.addEventListener('pointerleave', () => { handleInside = false; scheduleClose(); });
    handle.addEventListener('click', event => {
      if (pinned) return;
      // Keyboard activation focuses the pin for accessibility. A pointer click
      // must not leave focus on the pin or auto-close would never run on exit.
      if (!open) { reveal({ focus: event.detail === 0, explicit: true }); return; }
      // Hover may open/move the handle before a click intended to open it lands.
      // Do not immediately reverse that same gesture. Later clicks on > close it.
      if (openMethod === 'hover' && Date.now() - handleHoverOpenedAt < 450) { clearPanelTimer(); return; }
      // In auto-hide mode the chevron closes without changing the pin preference.
      close({ focus: true });
    });
    pin.addEventListener('click', () => setPinned(!pinned));
    // Retain a property/name edit's focus when using chrome with a pointer.
    for (const button of [pin, $('toolbarExpandBtn')]) button.addEventListener('mousedown', event => event.preventDefault());
    for (const button of [pin, handle, $('toolbarExpandBtn')]) button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
    });
    // Closed external popovers may not emit focusout on the inspector itself.
    const popupObserver = new MutationObserver(() => { if (popupOwned && !floatingPopup()) { popupOwned = false; scheduleClose(); } });
    popupObserver.observe(document.body, { childList: true, subtree: true });

    function measureTitle() {
      const text = title.querySelector('.document-title-text');
      if (!text) return;
      const clipped = title.clientWidth > 0 && text.scrollWidth > title.clientWidth + 1;
      title.classList.toggle('title-clipped', clipped);
      title.title = clipped ? text.textContent : '';
      title.setAttribute('aria-label', text.textContent);
      title.style.setProperty('--title-travel', `${Math.max(0, text.scrollWidth - title.clientWidth)}px`);
      title.style.setProperty('--title-duration', `${Math.max(5, (text.scrollWidth - title.clientWidth) / 30)}s`);
    }
    const titleObserver = new ResizeObserver(measureTitle);
    titleObserver.observe(title);
    new MutationObserver(measureTitle).observe(title, { childList: true, subtree: true, characterData: true });
    const measureRail = () => workspace.style.setProperty('--workspace-ribbon-height', `${expandedRail.hidden ? 0 : expandedRail.getBoundingClientRect().height}px`);
    new ResizeObserver(measureRail).observe(expandedRail);
    function applyToolbar(expanded, { animate = false } = {}) {
      const focus = document.activeElement;
      // Compact remains the fixed layout anchor. Extra tools are a separate overlay.
      if (rail.parentElement !== left) {
        left.append(rail);
        if (focus && document.contains(focus) && document.activeElement !== focus) focus.focus({ preventScroll: true });
      }
      shell.classList.toggle('toolbar-expanded', expanded);
      expandedRail.hidden = !expanded;
      if (animate && !reduced.matches) {
        toolbarAnimation?.cancel();
        // Animate only tool content; never transform the drawing surface.
        toolbarAnimation = expandedRail.animate([{ opacity: .3, translate: '0 -5px' }, { opacity: 1, translate: '0 0' }], { duration: 170, easing: 'ease-out' });
      }
      measureRail(); measureTitle(); paintMenu(); paintPanel();
    }
    function saveTab(tab) { write('pieniplan-inspector-tab', tab); }
    function restoreTab() {
      const tab = read('pieniplan-inspector-tab', 'primary');
      const button = [...panel.querySelectorAll('[data-tab]')].find(el => el.dataset.tab === tab && !el.hidden);
      return button ? tab : 'primary';
    }
    paintPanel(); paintMenu();
    return { applyToolbar, refresh: () => { paintMenu(); paintPanel(); measureTitle(); },
      setPinned, reveal, close, scheduleClose, setMenu, saveTab, restoreTab,
      preferences, setPreferences, panelVisible,
      status: () => ({ pinned, open, preferredOpen, explicitHold, menuOpen, menuPinned, ...preferences() }) };
  }
})();
