/* Original AurelyStudio welcome. Names are saved by the host app, never here. */
export function createWelcome({root, getName, saveName, onVisitName, beforeOpen, onBlocking, isCalm}) {
  const title = root.querySelector('#welcome-title');
  const copy = root.querySelector('#welcome-copy');
  const form = root.querySelector('.welcome-name-form');
  const input = root.querySelector('#welcome-name');
  const error = root.querySelector('.welcome-error');
  const start = root.querySelector('.welcome-start');
  const visit = root.querySelector('.welcome-session');
  const returning = root.querySelector('.welcome-return');
  const skip = root.querySelector('.welcome-skip');
  const panel = root.querySelector('.welcome-panel');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const standalone = matchMedia('(display-mode: standalone)');
  const abort = new AbortController();
  let active = false;
  let first = false;
  let intro = false;
  const entranceMs = 4000;
  const departureMs = 360;
  let leaving = false;
  let saving = false;
  let returnTimer;
  let exitTimer;
  let startedAt = 0;
  let remaining = entranceMs - departureMs;
  let hiddenAt = document.hidden ? Date.now() : 0;
  let restoreTarget;
  let bodyOverflow;
  let rootScroll = 0;

  const calm = () => Boolean(isCalm?.() || motion.matches);
  const cleanName = value => String(value || '').trim();
  const validName = () => {
    const name = cleanName(input.value);
    if (!name || name.length > 40) {
      error.textContent = name ? 'Please use 40 characters or fewer.' : 'Add your first name or a nickname to begin.';
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus({preventScroll: true});
      return '';
    }
    input.removeAttribute('aria-invalid');
    return name;
  };
  function clearTimers() {
    clearTimeout(returnTimer);
    clearTimeout(exitTimer);
    returnTimer = exitTimer = undefined;
  }
  function focusInside() {
    if (!active || document.hidden) return;
    const target = intro ? panel : first && !matchMedia('(pointer: coarse)').matches ? input : first ? panel : skip;
    target.focus({preventScroll: true});
  }
  function finish() {
    if (!active) return;
    clearTimers();
    active = leaving = intro = false;
    root.dataset.phase = 'closed';
    root.hidden = true;
    root.classList.remove('is-leaving');
    document.body.style.overflow = bodyOverflow;
    onBlocking?.(false);
    if (!document.hidden) {
      const usableTarget = restoreTarget?.isConnected && restoreTarget !== document.body && restoreTarget !== document.documentElement && !restoreTarget.closest('[inert]');
      const target = usableTarget ? restoreTarget : [...document.querySelectorAll('#app .profile-button, #app .mobile-menu, #app a')].find(el => el.getClientRects().length);
      target?.focus({preventScroll: true});
    }
  }
  function close() {
    if (!active || first || leaving) return;
    clearTimers();
    leaving = true;
    root.classList.add('is-leaving');
    if (calm() || document.hidden) finish();
    else exitTimer = setTimeout(finish, departureMs);
  }
  function scheduleReturn() {
    clearTimeout(returnTimer);
    if (!active || (first && !intro) || leaving || document.hidden) return;
    startedAt = Date.now();
    returnTimer = setTimeout(intro ? showNameForm : close, remaining);
  }
  function showReturn(name, duration = entranceMs) {
    first = intro = false;
    root.dataset.phase = 'return';
    form.hidden = true;
    returning.hidden = false;
    root.classList.remove('is-loading', 'is-first');
    root.classList.add('is-returning');
    title.textContent = `Welcome back, ${name}.`;
    copy.textContent = 'Manifest it. Break it down. Take one step today.';
    returning.querySelector('[data-welcome-status]').textContent = 'Your space is ready.';
    remaining = calm() ? 650 : Math.max(0, duration - departureMs);
    root.style.setProperty('--welcome-return-ms', `${remaining}ms`);
    if (!document.hidden) skip.focus({preventScroll: true});
    scheduleReturn();
  }
  function showNameForm() {
    if (!active) return;
    intro = false;
    root.dataset.phase = 'name';
    root.classList.remove('is-loading');
    root.classList.add('is-first');
    title.textContent = 'A little intention.\nA new beginning.';
    copy.textContent = 'Let’s make this space yours. What should we call you?';
    form.hidden = false;
    returning.hidden = true;
    error.hidden = true;
    visit.hidden = true;
    input.value = '';
    input.removeAttribute('aria-invalid');
    focusInside();
  }
  function open() {
    if (active) return;
    beforeOpen?.();
    restoreTarget = document.activeElement;
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    active = true;
    leaving = intro = false;
    clearTimers();
    root.hidden = false;
    root.className = 'welcome-overlay';
    root.dataset.calm = String(calm());
    root.dataset.paused = String(document.hidden);
    root.scrollTop = 0;
    onBlocking?.(true);
    const name = cleanName(getName());
    first = !name;
    if (name) showReturn(name);
    else {
      intro = true;
      root.dataset.phase = 'intro';
      root.classList.add('is-loading');
      title.textContent = 'Your next chapter starts here.';
      copy.textContent = 'Manifest it. Break it down. Take one step today.';
      form.hidden = returning.hidden = true;
      remaining = calm() ? 0 : entranceMs;
      root.style.setProperty('--welcome-return-ms', `${remaining}ms`);
      focusInside();
      if (remaining === 0) showNameForm();
      else scheduleReturn();
    }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopPropagation();
    if (saving) return;
    const name = validName();
    if (!name) return;
    saving = true;
    start.disabled = true;
    start.textContent = 'Saving…';
    try {
      await saveName(name);
      title.textContent = `Your next chapter, ${name}.`;
      showReturn(name, 650);
      title.textContent = `Your next chapter, ${name}.`;
    } catch {
      error.textContent = 'Your browser couldn’t save your name. Try again, or continue for this visit.';
      error.hidden = false;
      visit.hidden = false;
      input.focus({preventScroll: true});
    } finally {
      saving = false;
      start.disabled = false;
      start.textContent = 'Enter my space';
    }
  }, {signal: abort.signal});
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    error.hidden = true;
    visit.hidden = true;
  }, {signal: abort.signal});
  visit.addEventListener('click', () => {
    const name = validName();
    if (!name || saving) return;
    onVisitName?.(name);
    showReturn(name, 650);
    returning.querySelector('[data-welcome-status]').textContent = 'Your name is set for this visit.';
  }, {signal: abort.signal});
  skip.addEventListener('click', close, {signal: abort.signal});
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Tab') {
      const controls = [...root.querySelectorAll('input, button, [tabindex="0"]')].filter(el => !el.disabled && !el.closest('[hidden]'));
      const firstControl = controls[0], lastControl = controls.at(-1);
      if (!firstControl) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && (document.activeElement === firstControl || !controls.includes(document.activeElement))) { event.preventDefault(); lastControl.focus(); }
      else if (!event.shiftKey && (document.activeElement === lastControl || !controls.includes(document.activeElement))) { event.preventDefault(); firstControl.focus(); }
    }
    if (event.key === 'Escape' || (!first && event.key === 'Enter')) {
      event.preventDefault();
      if (!first) close();
    }
    event.stopPropagation();
  }, {capture: true, signal: abort.signal});
  document.addEventListener('focusin', event => {
    if (active && !root.contains(event.target)) focusInside();
  }, {signal: abort.signal});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      rootScroll = root.scrollTop;
      root.dataset.paused = 'true';
      if (returnTimer) remaining = Math.max(0, remaining - (Date.now() - startedAt));
      clearTimers();
      if (leaving) finish();
    } else {
      const elapsed = hiddenAt ? Date.now() - hiddenAt : 0;
      hiddenAt = 0;
      root.dataset.paused = 'false';
      root.scrollTop = rootScroll;
      if (active) { scheduleReturn(); focusInside(); }
      else if (elapsed >= 30000 && (standalone.matches || navigator.standalone === true)) open();
    }
  }, {signal: abort.signal});
  window.addEventListener('pageshow', event => { if (event.persisted) { if (!active) open(); else { root.dataset.paused = String(document.hidden); scheduleReturn(); focusInside(); } } }, {signal: abort.signal});
  window.addEventListener('pagehide', () => {
    hiddenAt = Date.now();
    if (returnTimer) remaining = Math.max(0, remaining - (Date.now() - startedAt));
    clearTimers();
    if (leaving) finish();
  }, {signal: abort.signal});
  function updateMotion() {
    root.dataset.calm = String(calm());
    if (active && calm()) {
      if (intro) { clearTimeout(returnTimer); showNameForm(); }
      else if (!first) { remaining = Math.min(remaining, 650); scheduleReturn(); }
    }
  }
  motion.addEventListener('change', updateMotion, {signal: abort.signal});
  window.addEventListener('beforeprint', finish, {signal: abort.signal});
  open();
  return {
    open,
    isOpen: () => active,
    destroy() { finish(); abort.abort(); clearTimers(); }
  };
}
