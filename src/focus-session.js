/**
 * AurelyStudio — original action timer and generated ambient sounds.
 * Session state stays in memory. Keep root outside #app so navigation preserves it.
 * Audio is created only after an explicit sound-button gesture; no external media.
 *
 * API: open({id, title, minutes}), minimize(), close(), isRunning(),
 * refreshAppearance(), getState(), destroy(). onCompleteTask(id) must return
 * true only after the host has saved the user's explicit completion request.
 */
export function createFocusSession({ root, onNotice = () => {}, onCompleteTask, isCalm = () => false } = {}) {
  if (!root || !(root instanceof HTMLElement)) throw new TypeError('A focus-session root is required.');

  const durations = [5, 15, 30];
  const sounds = [
    { key: 'rain', name: 'Gentle Rain', detail: 'A soft, steady texture', smooth: .86, high: 350, low: 6100, rate: .13, depth: .08, base: .84, path: 'M2 18v-4m5 10V8m5 19V5m5 20V7m5 15V10m5 16V6m5 19V7m5 15V10m5 10v-8' },
    { key: 'ocean', name: 'Ocean Waves', detail: 'Slow, rolling swells', smooth: .075, high: 35, low: 1750, rate: .085, depth: .35, base: .52, path: 'M2 18C9 18 9 6 16 6s7 20 14 20 7-12 14-12' },
    { key: 'warm', name: 'Warm Noise', detail: 'An even, mellow hum', smooth: .025, high: 25, low: 900, rate: 0, depth: 0, base: .87, path: 'M2 17h4l3-5 4 10 4-12 4 15 4-14 4 10 3-5h8' },
    { key: 'wind', name: 'Soft Wind', detail: 'Airy, gentle movement', smooth: .19, high: 100, low: 3800, rate: .052, depth: .22, base: .60, path: 'M2 10h24c8 0 8-8 2-8M2 17h35c8 0 8 9 1 9M2 24h17' }
  ];
  const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const minimizeIcon = icon('<path d="M5 12h14"/>');
  const playIcon = icon('<path d="m9 5 10 7-10 7z"/>');
  const pauseIcon = icon('<path d="M8 5v14M16 5v14"/>');
  const stopIcon = icon('<rect x="6" y="6" width="12" height="12" rx="2"/>');
  const soundIcon = icon('<path d="m11 5-5 4H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>');
  const closeIcon = icon('<path d="m6 6 12 12M18 6 6 18"/>');
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let session = null;
  let pending = null;
  let expanded = true;
  let opener = null;
  let interval = null;
  let destroyed = false;
  let marking = false;
  let audioContext = null;
  let master = null;
  let voice = null;
  let soundKey = null;
  let soundState = 'off';
  let soundToken = 0;
  let volume = 30;
  let muted = false;
  let announcement = '';
  const disposalTimers = new Set();
  const voices = new Set();

  root.classList.add('focus-session');
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Action timer and ambient sounds');
  root.hidden = true;
  root.innerHTML = `
    <section class="focus-panel" aria-labelledby="focus-heading">
      <header class="focus-header">
        <div><span class="focus-eyebrow">ONE SMALL ACTION</span><h2 id="focus-heading">Your next step</h2></div>
        <button type="button" class="focus-icon-button" data-focus="minimize" aria-label="Minimize timer" title="Minimize timer">${minimizeIcon}</button>
      </header>
      <p class="focus-task-title"></p>
      <div class="focus-replace" hidden>
        <p>A session is already open. Replace it with <strong class="focus-pending-title"></strong>?</p>
        <div><button type="button" class="focus-secondary" data-focus="keep">Keep current session</button><button type="button" class="focus-primary" data-focus="replace">Replace session</button></div>
      </div>
      <div class="focus-countdown">
        <div class="focus-ring" aria-hidden="true"><span>${icon('<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2M9 2h6M12 2v4M17 6l2-2"/>')}</span></div>
        <div class="focus-clock-copy"><span class="focus-phase">Ready when you are</span><output class="focus-time" role="timer" aria-live="off">05:00</output><span class="focus-time-caption">Just one step, at your pace.</span></div>
      </div>
      <div class="focus-durations" role="group" aria-label="Session length">${durations.map(minutes => `<button type="button" data-focus-minutes="${minutes}" aria-pressed="false">${minutes}<span> min</span></button>`).join('')}</div>
      <div class="focus-timer-controls"><button type="button" class="focus-primary focus-start" data-focus="toggle">Start timer</button><button type="button" class="focus-secondary" data-focus="reset">Reset</button></div>
      <button type="button" class="focus-mark" data-focus="mark" hidden>Mark action done</button>
      <p class="focus-done-note" hidden>Action saved as done.</p>
      <section class="focus-ambience" aria-labelledby="focus-sounds-heading">
        <div class="focus-sounds-heading"><h3 id="focus-sounds-heading">Set the atmosphere</h3><span class="focus-optional">Optional</span></div>
        <div class="focus-sounds" role="group" aria-label="Generated ambient sounds">${sounds.map(sound => `<button type="button" class="focus-sound" data-focus-sound="${sound.key}" aria-pressed="false" aria-label="Play ${sound.name}"${AudioConstructor ? '' : ' disabled'}><svg class="focus-sound-wave" viewBox="0 0 46 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${sound.path}"/></svg><span><strong>${sound.name}</strong><small>${sound.detail}</small></span><span class="focus-sound-state" aria-hidden="true">${playIcon}</span></button>`).join('')}</div>
        <p class="focus-sound-status">${AudioConstructor ? 'Original generated ambience. Tap a sound to play.' : 'Sounds are unavailable in this browser. The timer still works.'}</p>
        <div class="focus-volume-row"><label for="focus-volume">Volume <output class="focus-volume-value">30%</output></label><input id="focus-volume" type="range" min="0" max="100" step="1" value="30" aria-label="Ambient sound volume"${AudioConstructor ? '' : ' disabled'}></div>
        <div class="focus-audio-controls"><button type="button" class="focus-secondary" data-focus="mute" aria-pressed="false" disabled>Mute sound</button><button type="button" class="focus-secondary" data-focus="sound-stop" disabled>Stop sound</button><span class="focus-equalizer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div>
      </section>
      <footer class="focus-footer"><span>One step today is enough.</span><button type="button" data-focus="close">End session</button></footer>
    </section>
    <div class="focus-dock" hidden>
      <button type="button" class="focus-dock-open" data-focus="expand" aria-label="Expand action timer"><span class="focus-dock-time">05:00</span><span class="focus-dock-copy"><strong class="focus-dock-title"></strong><small class="focus-dock-phase">Ready</small></span></button>
      <button type="button" class="focus-icon-button focus-dock-toggle" data-focus="toggle" aria-label="Start timer">${playIcon}</button>
      <button type="button" class="focus-icon-button focus-dock-sound" data-focus="sound-stop" aria-label="Stop ambient sound" title="Stop ambient sound" hidden>${soundIcon}</button>
      <button type="button" class="focus-icon-button" data-focus="close" aria-label="End session" title="End session">${closeIcon}</button>
    </div>
    <span class="focus-live" role="status" aria-live="polite" aria-atomic="true"></span>`;

  const refs = {
    panel: root.querySelector('.focus-panel'), dock: root.querySelector('.focus-dock'),
    title: root.querySelector('.focus-task-title'), pending: root.querySelector('.focus-replace'),
    pendingTitle: root.querySelector('.focus-pending-title'), phase: root.querySelector('.focus-phase'),
    time: root.querySelector('.focus-time'), ring: root.querySelector('.focus-ring'),
    start: root.querySelector('.focus-start'), reset: root.querySelector('[data-focus="reset"]'),
    mark: root.querySelector('[data-focus="mark"]'), done: root.querySelector('.focus-done-note'),
    soundStatus: root.querySelector('.focus-sound-status'), volume: root.querySelector('#focus-volume'),
    volumeValue: root.querySelector('.focus-volume-value'), mute: root.querySelector('[data-focus="mute"]'),
    stop: root.querySelector('.focus-audio-controls [data-focus="sound-stop"]'),
    dockTime: root.querySelector('.focus-dock-time'), dockTitle: root.querySelector('.focus-dock-title'),
    dockPhase: root.querySelector('.focus-dock-phase'), dockToggle: root.querySelector('.focus-dock-toggle'),
    dockSound: root.querySelector('.focus-dock-sound'), live: root.querySelector('.focus-live')
  };

  function refreshAppearance() {
    root.dataset.calm = String(Boolean(isCalm() || reducedMotion.matches));
  }
  function remaining() {
    return session?.mode === 'running' ? Math.max(0, session.deadline - Date.now()) : (session?.remainingMs || 0);
  }
  function formatTime(milliseconds) {
    const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function announce(message) {
    announcement = message;
    refs.live.textContent = message;
  }
  function update() {
    if (destroyed) return;
    refreshAppearance();
    root.dataset.expanded = String(expanded);
    root.dataset.sound = soundState;
    root.dataset.muted = String(muted || volume === 0);
    refs.panel.hidden = !expanded;
    refs.dock.hidden = expanded;
    if (session) {
      root.dataset.status = session.mode;
      const milliseconds = remaining();
      const formatted = formatTime(milliseconds);
      const phase = {ready:'Ready when you are',running:'One small action, in motion',paused:'Take a breath. Resume when ready.',complete:'You showed up. Well done.'}[session.mode];
      refs.title.textContent = session.title;
      refs.time.textContent = formatted;
      const seconds = Math.ceil(milliseconds / 1000);
      refs.time.setAttribute('aria-label', `${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`);
      refs.phase.textContent = phase;
      refs.ring.style.setProperty('--focus-progress', `${Math.min(100, Math.max(0, 100 * (1 - milliseconds / session.durationMs)))}%`);
      refs.start.textContent = session.mode === 'running' ? 'Pause timer' : session.mode === 'paused' ? 'Resume timer' : session.mode === 'complete' ? 'Start again' : 'Start timer';
      refs.reset.disabled = session.mode === 'ready' && session.remainingMs === session.durationMs;
      refs.mark.hidden = !session.id || typeof onCompleteTask !== 'function' || session.mode !== 'complete' || session.taskDone;
      refs.mark.disabled = marking;
      refs.mark.textContent = marking ? 'Saving…' : 'Mark action done';
      refs.done.hidden = !session.taskDone;
      root.querySelectorAll('[data-focus-minutes]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.focusMinutes) === session.minutes)));
      refs.dockTime.textContent = formatted;
      refs.dockTitle.textContent = session.title;
      refs.dockPhase.textContent = {ready:'Ready to start',running:'Timer running',paused:'Timer paused',complete:session.taskDone ? 'Action done' : 'Session complete'}[session.mode];
      refs.dockToggle.innerHTML = session.mode === 'running' ? pauseIcon : playIcon;
      refs.dockToggle.setAttribute('aria-label', refs.start.textContent);
    }
    refs.pending.hidden = !pending;
    refs.pendingTitle.textContent = pending?.title || '';
    const selected = sounds.find(sound => sound.key === soundKey);
    root.querySelectorAll('[data-focus-sound]').forEach(button => {
      const sound = sounds.find(item => item.key === button.dataset.focusSound);
      const active = button.dataset.focusSound === soundKey;
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active && soundState === 'playing' ? 'Stop' : active && soundState === 'paused' ? 'Resume' : 'Play'} ${sound.name}`);
      button.querySelector('.focus-sound-state').innerHTML = active && soundState === 'playing' ? stopIcon : playIcon;
    });
    if (AudioConstructor) refs.soundStatus.textContent = soundState === 'loading' ? 'Starting your sound…' : soundState === 'playing' ? `${selected?.name || 'Sound'} ${muted || volume === 0 ? 'is muted.' : 'is playing.'}` : soundState === 'paused' ? 'Sound paused by your browser. Tap the sound to resume.' : soundState === 'error' ? 'Sound could not start. Try again; your timer still works.' : 'Original generated ambience. Tap a sound to play.';
    refs.volumeValue.textContent = `${volume}%`;
    refs.mute.disabled = !soundKey;
    refs.stop.disabled = !soundKey;
    refs.mute.textContent = muted ? 'Unmute sound' : 'Mute sound';
    refs.mute.setAttribute('aria-pressed', String(muted));
    refs.dockSound.hidden = !soundKey;
  }
  function clearTick() {
    if (interval !== null) window.clearInterval(interval);
    interval = null;
  }
  function completeSession() {
    if (!session || session.mode !== 'running') return;
    session.mode = 'complete';
    session.remainingMs = 0;
    session.deadline = null;
    clearTick();
    stopSound();
    announce(`${session.minutes}-minute session complete. You can mark your action done when it is finished.`);
    onNotice('Your session is complete. Take a moment to notice your progress.');
    update();
  }
  function tick() {
    if (session?.mode === 'running' && remaining() <= 0) completeSession();
    else if (!document.hidden) update();
  }
  function toggleTimer() {
    if (!session) return;
    if (session.mode === 'running') {
      const milliseconds = remaining();
      if (!milliseconds) { completeSession(); return; }
      session.remainingMs = milliseconds;
      session.deadline = null;
      session.mode = 'paused';
      clearTick();
      scheduleSoundEnd();
      announce('Timer paused.');
    } else {
      if (session.mode === 'complete') session.remainingMs = session.durationMs;
      session.deadline = Date.now() + session.remainingMs;
      session.mode = 'running';
      clearTick();
      interval = window.setInterval(tick, 1000);
      scheduleSoundEnd();
      announce('Timer started.');
    }
    update();
  }
  function resetTimer() {
    if (!session) return;
    clearTick();
    session.mode = 'ready';
    session.remainingMs = session.durationMs;
    session.deadline = null;
    scheduleSoundEnd();
    announce('Timer reset.');
    update();
  }
  function makeSession(item = {}) {
    const minutes = durations.includes(Number(item.minutes)) ? Number(item.minutes) : 5;
    return { id: String(item.id || ''), title: String(item.title || 'One small action').trim().slice(0, 180) || 'One small action', minutes, durationMs: minutes * 60000, remainingMs: minutes * 60000, deadline: null, mode: 'ready', taskDone: false };
  }
  function loadSession(next) {
    clearTick();
    stopSound();
    session = next;
    pending = null;
    marking = false;
    expanded = true;
    root.hidden = false;
    update();
  }
  function open(item = {}) {
    if (destroyed) return;
    if (!root.contains(document.activeElement)) opener = document.activeElement;
    const next = makeSession(item);
    if (session && session.mode !== 'complete' && session.id === next.id && session.title === next.title && session.minutes === next.minutes) {
      expanded = true; root.hidden = false; pending = null; update();
    } else if (session && (session.mode === 'running' || session.mode === 'paused' || soundKey)) {
      pending = next; expanded = true; root.hidden = false; update();
    } else loadSession(next);
    if (!root.inert) (pending ? root.querySelector('[data-focus="keep"]') : refs.start).focus({preventScroll:true});
  }
  function minimize() {
    if (!session || destroyed) return;
    expanded = false;
    update();
    if (!root.inert) root.querySelector('[data-focus="expand"]').focus({preventScroll:true});
  }
  function restoreFocus() {
    if (opener?.isConnected && !opener.closest('[inert]')) opener.focus({preventScroll:true});
    else {
      const heading = document.querySelector('#app h1');
      if (heading && !heading.closest('[inert]')) {
        const hadTabindex = heading.hasAttribute('tabindex');
        if (!hadTabindex) { heading.tabIndex = -1; heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), {once:true}); }
        heading.focus({preventScroll:true});
      }
    }
  }
  function close() {
    const restore = root.contains(document.activeElement);
    clearTick();
    stopSound();
    session = null;
    pending = null;
    marking = false;
    root.hidden = true;
    if (restore) restoreFocus();
  }

  // Procedural noise and gentle envelopes. These are sound textures, not recordings
  // or medical / frequency therapies. No microphone, downloads or network access.
  function makeNoise(context, recipe) {
    const buffer = context.createBuffer(2, context.sampleRate * 8, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let sample = 0;
      for (let i = 0; i < data.length; i++) { sample += ((Math.random() * 2 - 1) - sample) * recipe.smooth; data[i] = sample; }
      const difference = data[data.length - 1] - data[0];
      let peak = .001;
      for (let i = 0; i < data.length; i++) { data[i] -= difference * (i / (data.length - 1)); peak = Math.max(peak, Math.abs(data[i])); }
      for (let i = 0; i < data.length; i++) data[i] = data[i] / peak * .72;
    }
    return buffer;
  }
  function buildVoice(context, recipe) {
    const source = context.createBufferSource();
    source.buffer = makeNoise(context, recipe);
    source.loop = true;
    const highpass = context.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = recipe.high; highpass.Q.value = .55;
    const lowpass = context.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = recipe.low; lowpass.Q.value = .55;
    const swell = context.createGain(); swell.gain.value = recipe.base;
    const fade = context.createGain(); fade.gain.value = 0;
    source.connect(highpass); highpass.connect(lowpass); lowpass.connect(swell); swell.connect(fade); fade.connect(master);
    const sources = [source];
    const nodes = [source, highpass, lowpass, swell, fade];
    if (recipe.rate) {
      const oscillator = context.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = recipe.rate;
      const depth = context.createGain(); depth.gain.value = recipe.depth;
      oscillator.connect(depth); depth.connect(swell.gain); oscillator.start();
      sources.push(oscillator); nodes.push(oscillator, depth);
    }
    source.start();
    const next = {context, fade, sources, nodes, disposed:false};
    voices.add(next);
    return next;
  }
  function disposeVoice(old) {
    if (!old || old.disposed) return;
    old.disposed = true;
    old.sources.forEach(source => { try { source.stop(); } catch {} });
    old.nodes.forEach(node => { try { node.disconnect(); } catch {} });
    voices.delete(old);
  }
  function fadeVoice(old, immediate = false) {
    if (!old || old.disposed) return;
    if (immediate || old.context.state === 'closed') { disposeVoice(old); return; }
    const now = old.context.currentTime;
    const parameter = old.fade.gain;
    try { parameter.cancelScheduledValues(now); parameter.setValueAtTime(parameter.value, now); parameter.linearRampToValueAtTime(0, now + .18); } catch { disposeVoice(old); return; }
    const timeout = window.setTimeout(() => { disposalTimers.delete(timeout); disposeVoice(old); }, 220);
    disposalTimers.add(timeout);
  }
  function setVolume() {
    if (!audioContext || !master || audioContext.state === 'closed') return;
    const parameter = master.gain;
    const now = audioContext.currentTime;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(parameter.value, now);
    parameter.setTargetAtTime(muted ? 0 : volume / 100 * .45, now, .035);
  }
  function scheduleSoundEnd() {
    if (!voice || voice.disposed || voice.context.state === 'closed') return;
    const now = voice.context.currentTime;
    const parameter = voice.fade.gain;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(parameter.value, now);
    if (session?.mode === 'running') {
      const end = now + remaining() / 1000;
      if (end <= now + .2) { parameter.linearRampToValueAtTime(0, Math.max(now + .02, end)); return; }
      parameter.linearRampToValueAtTime(1, now + .18);
      parameter.setValueAtTime(1, Math.max(now + .18, end - .2));
      parameter.linearRampToValueAtTime(0, end);
    } else parameter.linearRampToValueAtTime(1, now + .18);
  }
  function audioStateChanged() {
    if (!soundKey || soundState === 'loading' || destroyed) return;
    soundState = audioContext?.state === 'running' ? 'playing' : 'paused';
    update();
  }
  async function playSound(key) {
    const recipe = sounds.find(sound => sound.key === key);
    if (!recipe || !AudioConstructor || destroyed) return;
    if (key === soundKey && soundState === 'playing') { stopSound(); return; }
    const token = ++soundToken;
    soundKey = key;
    soundState = 'loading';
    update();
    try {
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioConstructor();
        master = audioContext.createGain(); master.gain.value = 0; master.connect(audioContext.destination);
        audioContext.addEventListener('statechange', audioStateChanged);
      }
      const context = audioContext;
      // resume is invoked in the original click handler's gesture, before awaiting.
      const resume = context.resume();
      let timeout;
      await Promise.race([resume, new Promise((_, reject) => { timeout = window.setTimeout(() => reject(new Error('Audio did not resume.')), 3000); })]).finally(() => window.clearTimeout(timeout));
      if (token !== soundToken || destroyed || audioContext !== context) return;
      if (context.state !== 'running') throw new Error('Audio is paused by this browser.');
      const old = voice;
      voice = buildVoice(context, recipe);
      fadeVoice(old);
      setVolume();
      scheduleSoundEnd();
      soundState = 'playing';
      announce(`${recipe.name} playing.`);
      update();
    } catch {
      if (token !== soundToken || destroyed) return;
      stopSound();
      soundState = 'error';
      announce('Sound could not start. You can still use the timer.');
      update();
    }
  }
  function stopSound({immediate = false, release = false} = {}) {
    ++soundToken;
    const old = voice;
    voice = null;
    soundKey = null;
    soundState = 'off';
    fadeVoice(old, immediate);
    if (release && audioContext) {
      disposalTimers.forEach(timeout => window.clearTimeout(timeout)); disposalTimers.clear();
      voices.forEach(disposeVoice);
      const context = audioContext;
      audioContext = null; master = null;
      context.removeEventListener('statechange', audioStateChanged);
      if (context.state !== 'closed') context.close().catch(() => {});
    } else if (audioContext && audioContext.state === 'running') {
      const context = audioContext;
      const token = soundToken;
      const timeout = window.setTimeout(() => {
        disposalTimers.delete(timeout);
        if (token === soundToken && !voice && context === audioContext && context.state === 'running') context.suspend().catch(() => {});
      }, 240);
      disposalTimers.add(timeout);
    }
    update();
  }
  async function markAction() {
    if (!session || !session.id || session.mode !== 'complete' || session.taskDone || marking || typeof onCompleteTask !== 'function') return;
    const current = session;
    marking = true; update();
    try {
      const saved = await onCompleteTask(current.id);
      if (session !== current || destroyed) return;
      if (saved === true) { current.taskDone = true; announce('Action saved as done.'); }
      else { announce('Action was not saved. You can try again.'); onNotice('The action could not be marked done. Please try again.', true); }
    } catch { if (session === current && !destroyed) { announce('Action was not saved. You can try again.'); onNotice('The action could not be marked done. Please try again.', true); } }
    finally { if (session === current) { marking = false; update(); } }
  }
  function handleClick(event) {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    event.stopPropagation();
    if (button.dataset.focusSound) { void playSound(button.dataset.focusSound); return; }
    if (button.dataset.focusMinutes) {
      if (!session || Number(button.dataset.focusMinutes) === session.minutes) return;
      open({id:session.id, title:session.title, minutes:button.dataset.focusMinutes}); return;
    }
    const action = button.dataset.focus;
    if (action === 'toggle') toggleTimer();
    else if (action === 'reset') resetTimer();
    else if (action === 'minimize') minimize();
    else if (action === 'expand') { expanded = true; update(); refs.start.focus({preventScroll:true}); }
    else if (action === 'close') close();
    else if (action === 'keep') { pending = null; update(); refs.start.focus({preventScroll:true}); }
    else if (action === 'replace' && pending) { loadSession(pending); refs.start.focus({preventScroll:true}); }
    else if (action === 'sound-stop') { stopSound(); announce('Ambient sound stopped.'); }
    else if (action === 'mute') { muted = !muted; setVolume(); update(); announce(muted ? 'Ambient sound muted.' : 'Ambient sound unmuted.'); }
    else if (action === 'mark') void markAction();
  }
  function handleInput(event) {
    if (event.target !== refs.volume) return;
    event.stopPropagation();
    volume = Math.min(100, Math.max(0, Number(refs.volume.value) || 0));
    setVolume(); update();
  }
  function handleKey(event) {
    if (event.key === 'Escape' && expanded && session) { event.preventDefault(); event.stopPropagation(); minimize(); }
  }
  function pageHide() { stopSound({immediate:true, release:true}); }
  function pageShow() { tick(); }
  function visible() { if (!document.hidden) tick(); }
  root.addEventListener('click', handleClick);
  root.addEventListener('input', handleInput);
  root.addEventListener('keydown', handleKey);
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  document.addEventListener('visibilitychange', visible);
  reducedMotion.addEventListener('change', refreshAppearance);
  refreshAppearance();

  return {
    open, minimize, close, refreshAppearance,
    isRunning: () => Boolean(session?.mode === 'running' && remaining() > 0),
    getState: () => ({taskId:session?.id || null, title:session?.title || null, minutes:session?.minutes || null, status:session?.mode || 'closed', remainingMs:remaining(), remainingSeconds:Math.ceil(remaining() / 1000), expanded, sound:soundKey, soundState, volume, muted, taskDone:Boolean(session?.taskDone), announcement}),
    destroy() {
      if (destroyed) return;
      close(); stopSound({immediate:true, release:true}); destroyed = true;
      root.removeEventListener('click', handleClick); root.removeEventListener('input', handleInput); root.removeEventListener('keydown', handleKey);
      window.removeEventListener('pagehide', pageHide); window.removeEventListener('pageshow', pageShow); document.removeEventListener('visibilitychange', visible);
      reducedMotion.removeEventListener('change', refreshAppearance);
      root.replaceChildren(); root.hidden = true;
    }
  };
}
