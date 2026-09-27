/**
 * Local-first data layer for the AurelyStudio Manifestation & Action Planner.
 * Dates in records and day keys are device-local YYYY-MM-DD calendar dates.
 * This module has no UI dependencies and does not create sample user records.
 */

const APP_ID = 'aurelystudio-manifestation-action-planner';
const BACKUP_FORMAT = `${APP_ID}-backup`;
const STORAGE_KEY = `${APP_ID}:state:v1`;
// Keep the original storage key so existing browser data migrates in place.
const VERSION = 5;
const JOURNEY_LENGTH = 30;
const MS_PER_DAY = 86_400_000;
const ACTIVE_ACTION_PERIODS = ['today', 'week', 'month', 'later'];
const WRITING_FONTS = new Set(['nunito', 'lora', 'caveat', 'kalam', 'patrick', 'dancing', 'sacramento']);
const MENU_STYLES = new Set(['sidebar', 'compact', 'top']);

export { STORAGE_KEY };

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const asObject = value => isObject(value) ? value : {};
const asArray = value => Array.isArray(value) ? value : [];
const asText = value => typeof value === 'string' ? value : '';

function validLocalDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  // A saved calendar date must survive a change of time zone. Local midnight
  // may not exist (for example, 2011-12-30 in Pacific/Apia), but the historical
  // date is still valid and must not be discarded when importing a backup.
  const date = new Date(`${value}T00:00:00Z`);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validLocalTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** Device-local date, never a UTC slice of an ISO timestamp. */
export function localDate(date = new Date()) {
  if (validLocalDate(date)) return date;
  const value = date instanceof Date ? date : new Date(date);
  const safe = Number.isNaN(value.getTime()) ? new Date() : value;
  return `${safe.getFullYear()}-${String(safe.getMonth() + 1).padStart(2, '0')}-${String(safe.getDate()).padStart(2, '0')}`;
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const random = Math.random().toString(36).slice(2, 11);
  return `${Date.now().toString(36)}-${random}`;
}

export function createInitialState() {
  const now = new Date().toISOString();
  return {
    app: APP_ID,
    version: VERSION,
    createdAt: now,
    updatedAt: now,
    profile: { name: '' },
    theme: {
      preset: 'warm-sage',
      themeId: 'warm-sage',
      mainColor: '#53735c',
      accentColor: '#b88770',
      backgroundColor: '#fcf8f5',
      interfaceFont: 'system',
      headingFont: 'serif',
      handwritingFont: 'Caveat',
      handwritingScope: 'accents',
      writingFont: 'nunito',
      menuStyle: 'sidebar',
      nightMode: false,
      extraCalm: false,
    },
    manifestations: [],
    actions: [],
    days: {},
    visionBoard: [],
    journals: [],
    habits: [],
    evidence: [],
    weeklyReviews: [],
    monthlyReviews: [],
    futureSelf: {
      identity: '',
      dailyActions: '',
      stopDoing: '',
      environment: '',
      money: '',
      relationships: '',
      career: '',
      health: '',
      lifestyle: '',
      letter: '',
    },
    affirmations: [],
    logs369: [],
    techniqueSessions: [],
    journey: { startDate: '' },
  };
}

function normalizeMilestone(value) {
  const item = asObject(value);
  return {
    ...item,
    id: asText(item.id) || makeId(),
    title: asText(item.title),
    done: typeof item.done === 'boolean' ? item.done : item.status === 'completed',
    completedAt: asText(item.completedAt),
  };
}

function normalizeList(value, normalize) {
  const seen = new Set();
  return asArray(value).filter(isObject).map(item => {
    const record = normalize(item);
    // Repair damaged local IDs once so editing or deleting one record cannot
    // affect another. Backup validation rejects duplicate supplied IDs.
    while (seen.has(record.id)) record.id = makeId();
    seen.add(record.id);
    return record;
  });
}

function normalizeManifestation(value) {
  const item = asObject(value);
  return {
    ...item,
    id: asText(item.id) || makeId(),
    title: asText(item.title),
    want: asText(item.want),
    why: asText(item.why),
    targetDate: validLocalDate(item.targetDate) ? item.targetDate : '',
    measure: asText(item.measure),
    futureSelf: asText(item.futureSelf),
    category: asText(item.category),
    images: asArray(item.images),
    affirmations: asArray(item.affirmations),
    milestones: normalizeList(item.milestones, normalizeMilestone),
    status: item.status === 'completed' ? 'completed' : 'active',
  };
}

function normalizeAction(value) {
  const item = asObject(value);
  const savedPeriod = [...ACTIVE_ACTION_PERIODS, 'done'].includes(item.period) ? item.period : 'later';
  const previousPeriod = ACTIVE_ACTION_PERIODS.includes(item.previousPeriod)
    ? item.previousPeriod
    : ACTIVE_ACTION_PERIODS.includes(savedPeriod) ? savedPeriod : 'today';
  const done = typeof item.done === 'boolean'
    ? item.done
    : savedPeriod === 'done' || item.status === 'completed' || Boolean(item.completedAt);
  const period = done ? 'done' : savedPeriod === 'done' ? previousPeriod : savedPeriod;
  const priority = ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium';
  const energy = ['low', 'medium', 'high'].includes(item.energy) ? item.energy : 'medium';
  const minutes = Number(item.minutes);
  return {
    ...item,
    id: asText(item.id) || makeId(),
    title: asText(item.title),
    manifestationId: asText(item.manifestationId),
    period,
    previousPeriod,
    priority,
    deadline: validLocalDate(item.deadline) ? item.deadline : '',
    dueTime: validLocalTime(item.dueTime) ? item.dueTime : '',
    minutes: Number.isFinite(minutes) && minutes > 0 ? Math.max(1, Math.round(minutes)) : 5,
    energy,
    done,
    completedAt: asText(item.completedAt),
  };
}

function normalizeDay(value) {
  const day = asObject(value);
  const journey = asObject(day.journey);
  return {
    ...day,
    calendarNote: asText(day.calendarNote),
    intention: asText(day.intention),
    callingIn: asText(day.callingIn),
    smallAction: asText(day.smallAction),
    mood: asText(day.mood),
    energy: ['low', 'medium', 'high'].includes(day.energy) ? day.energy : '',
    morningAffirmation: asText(day.morningAffirmation),
    eveningReflection: asText(day.eveningReflection),
    journey: {
      ...journey,
      intention: asText(journey.intention),
      visualization: asText(journey.visualization),
      action: asText(journey.action),
      gratitude: asText(journey.gratitude),
      reflection: asText(journey.reflection),
      completed: journey.completed === true,
    },
  };
}

function normalizeDays(value) {
  const days = {};
  for (const [date, day] of Object.entries(asObject(value))) {
    if (validLocalDate(date) && isObject(day)) days[date] = normalizeDay(day);
  }
  return days;
}

function normalizeDateMap(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.filter(validLocalDate).map(date => [date, true]));
  }
  return Object.fromEntries(
    Object.entries(asObject(value)).filter(([date, completed]) => validLocalDate(date) && Boolean(completed))
      .map(([date]) => [date, true]),
  );
}

function normalizeRecord(value, fields = {}) {
  const item = asObject(value);
  const record = { ...item, id: asText(item.id) || makeId() };
  for (const [name, fallback] of Object.entries(fields)) {
    record[name] = typeof fallback === 'boolean' ? item[name] === true : asText(item[name]);
  }
  if ('date' in record && !validLocalDate(record.date)) record.date = '';
  if ('weekStart' in record && !validLocalDate(record.weekStart)) record.weekStart = '';
  return record;
}

function normalizeJournal(value) {
  const record = normalizeRecord(value, { date: '', type: '', title: '', body: '' });
  record.font = WRITING_FONTS.has(record.font) ? record.font : '';
  return record;
}

function normalizeHabit(value) {
  const item = asObject(value);
  return {
    ...normalizeRecord(item, { title: '' }),
    active: item.active !== false,
    completions: normalizeDateMap(item.completions),
  };
}

function normalizeAffirmation(value) {
  const item = asObject(value);
  return {
    ...normalizeRecord(item, { text: '', category: '', favorite: false }),
    completedDates: normalizeDateMap(item.completedDates),
  };
}

function normalizeTechniqueSession(value) {
  const item = asObject(value);
  const createdAt = asText(item.createdAt) || new Date().toISOString();
  return {
    ...item,
    id: asText(item.id) || makeId(),
    technique: asText(item.technique),
    date: validLocalDate(item.date) ? item.date : '',
    manifestationId: asText(item.manifestationId),
    fields: Object.fromEntries(
      Object.entries(asObject(item.fields)).map(([key, field]) => [key, asText(field)]),
    ),
    completed: item.completed === true,
    createdAt,
    updatedAt: asText(item.updatedAt) || createdAt,
  };
}

/** Merge a partial older state with defaults without losing unknown optional fields. */
function migrateState(value) {
  const source = asObject(value);
  const retained = { ...source };
  // The canonical sections below now own this data. Keeping stale legacy
  // copies would re-export damaged or outdated records alongside repaired data.
  for (const alias of ['goals', 'tasks', 'daily', 'vision', 'journalEntries', 'wins', 'method369', 'themePrefs']) delete retained[alias];
  const base = createInitialState();
  const profile = asObject(source.profile);
  const theme = asObject(source.theme ?? source.themePrefs);
  const futureSelf = asObject(source.futureSelf);
  const journey = asObject(source.journey);
  return {
    ...base,
    ...retained,
    app: APP_ID,
    version: VERSION,
    createdAt: asText(source.createdAt) || base.createdAt,
    updatedAt: asText(source.updatedAt) || base.updatedAt,
    profile: { ...base.profile, ...profile, name: asText(profile.name) },
    theme: {
      ...base.theme,
      ...theme,
      themeId: asText(theme.themeId) || asText(theme.preset) || base.theme.themeId,
      writingFont: WRITING_FONTS.has(theme.writingFont) ? theme.writingFont : base.theme.writingFont,
      menuStyle: MENU_STYLES.has(theme.menuStyle) ? theme.menuStyle : base.theme.menuStyle,
    },
    manifestations: normalizeList(source.manifestations ?? source.goals, normalizeManifestation),
    actions: normalizeList(source.actions ?? source.tasks, normalizeAction),
    days: normalizeDays(source.days ?? source.daily),
    visionBoard: normalizeList(source.visionBoard ?? source.vision, item => normalizeRecord(item, { title: '', category: '' })),
    journals: normalizeList(source.journals ?? source.journalEntries, normalizeJournal),
    habits: normalizeList(source.habits, normalizeHabit),
    evidence: normalizeList(source.evidence ?? source.wins, item => normalizeRecord(item, { date: '', title: '', note: '' })),
    weeklyReviews: normalizeList(source.weeklyReviews, item => normalizeRecord(item, { weekStart: '', movedForward: '', worked: '', blocked: '', releasing: '', nextWeek: '', firstAction: '' })),
    monthlyReviews: normalizeList(source.monthlyReviews, item => normalizeRecord(item, { month: '', biggestWin: '', whatChanged: '', adjustments: '', nextIntention: '' })),
    futureSelf: { ...base.futureSelf, ...futureSelf },
    affirmations: normalizeList(source.affirmations, normalizeAffirmation),
    logs369: normalizeList(source.logs369 ?? source.method369, item => normalizeRecord(item, { date: '', text: '' })),
    techniqueSessions: normalizeList(source.techniqueSessions, normalizeTechniqueSession),
    journey: { ...base.journey, ...journey, startDate: validLocalDate(journey.startDate) ? journey.startDate : '' },
  };
}

function getStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function loadState() {
  const storage = getStorage();
  if (!storage) return createInitialState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!isObject(parsed) || (parsed.app && parsed.app !== APP_ID)) return createInitialState();
    const state = migrateState(parsed);
    // Persist added defaults and IDs once so migrated records retain stable IDs.
    if (JSON.stringify(state) !== raw) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep the readable in-memory state. */ }
    }
    return state;
  } catch {
    // A damaged local value remains untouched for possible manual recovery.
    return createInitialState();
  }
}

export function saveState(state) {
  const storage = getStorage();
  if (!storage) throw new Error('Browser local storage is unavailable.');
  const normalized = migrateState(state);
  normalized.updatedAt = new Date().toISOString();
  storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function ordinal(date) {
  if (!validLocalDate(date)) return NaN;
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY);
}

function dateFromOrdinal(number) {
  return new Date(number * MS_PER_DAY).toISOString().slice(0, 10);
}

function checkedIn(day) {
  if (!isObject(day)) return false;
  const fields = ['calendarNote', 'intention', 'callingIn', 'smallAction', 'mood', 'energy', 'morningAffirmation', 'eveningReflection'];
  if (fields.some(name => asText(day[name]).trim())) return true;
  const journey = asObject(day.journey);
  return journey.completed === true || ['intention', 'visualization', 'action', 'gratitude', 'reflection']
    .some(name => asText(journey[name]).trim());
}

function isDone(item) {
  if (typeof item?.done === 'boolean') return item.done;
  return item?.status === 'completed' || item?.period === 'done';
}

function manifestationProgress(manifestation, actions) {
  if (manifestation.status === 'completed') return 100;
  const milestones = asArray(manifestation.milestones);
  const linkedActions = actions.filter(action => action.manifestationId === manifestation.id);
  const total = milestones.length + linkedActions.length;
  if (!total) return 0;
  const completed = milestones.filter(isDone).length + linkedActions.filter(isDone).length;
  return Math.round(completed / total * 100);
}

/** All percentages are derived from saved records; missing data yields 0. */
export function stats(state, date = new Date()) {
  const data = migrateState(state);
  const today = localDate(date);
  const todayOrdinal = ordinal(today);
  const manifestations = data.manifestations;
  const actions = data.actions;
  const activeHabits = data.habits.filter(habit => habit.active !== false);
  const projectProgress = Object.fromEntries(manifestations.map(item => [item.id, manifestationProgress(item, actions)]));
  const goalsPercent = manifestations.length
    ? Math.round(Object.values(projectProgress).reduce((sum, value) => sum + value, 0) / manifestations.length)
    : 0;
  const completedActions = actions.filter(isDone).length;
  const actionsPercent = actions.length ? Math.round(completedActions / actions.length * 100) : 0;

  const dayOfWeek = new Date(todayOrdinal * MS_PER_DAY).getUTCDay();
  const weekStartOrdinal = todayOrdinal - ((dayOfWeek + 6) % 7);
  let habitOpportunities = 0;
  let habitCompletions = 0;
  const habitWeekStreaks = {};
  for (const habit of activeHabits) {
    const created = habit.createdAt ? ordinal(localDate(habit.createdAt)) : weekStartOrdinal;
    const first = Math.max(weekStartOrdinal, Number.isFinite(created) ? created : weekStartOrdinal);
    for (let day = first; day <= todayOrdinal; day += 1) {
      habitOpportunities += 1;
      if (habit.completions[dateFromOrdinal(day)] === true) habitCompletions += 1;
    }
    let habitCursor = habit.completions[today] === true ? todayOrdinal : todayOrdinal - 1;
    let run = 0;
    while (habitCursor >= first && habit.completions[dateFromOrdinal(habitCursor)] === true) {
      run += 1;
      habitCursor -= 1;
    }
    habitWeekStreaks[habit.id] = run;
  }
  const habitsPercent = habitOpportunities ? Math.round(habitCompletions / habitOpportunities * 100) : 0;

  let streakDays = 0;
  let cursor = checkedIn(data.days[today]) ? todayOrdinal : todayOrdinal - 1;
  while (checkedIn(data.days[dateFromOrdinal(cursor)])) {
    streakDays += 1;
    cursor -= 1;
  }

  const start = ordinal(data.journey.startDate);
  const elapsed = Number.isFinite(start) ? todayOrdinal - start + 1 : 0;
  const journeyDay = elapsed > 0 ? Math.min(elapsed, JOURNEY_LENGTH) : 0;
  const journeyCompletedDays = Number.isFinite(start)
    ? Object.entries(data.days).filter(([day, entry]) => {
      const offset = ordinal(day) - start;
      return offset >= 0 && offset < JOURNEY_LENGTH && ordinal(day) <= todayOrdinal && entry.journey?.completed === true;
    }).length
    : 0;

  return {
    date: today,
    goalCount: manifestations.length,
    completedGoals: manifestations.filter(item => item.status === 'completed').length,
    goalsPercent,
    projectProgress,
    actionCount: actions.length,
    completedActions,
    actionsPercent,
    habitCount: activeHabits.length,
    habitCompletions,
    habitOpportunities,
    habitsPercent,
    habitWeekStreaks,
    streakDays,
    journeyDay,
    journeyCompletedDays,
    journeyTotalDays: JOURNEY_LENGTH,
    journeyPercent: Math.round(journeyCompletedDays / JOURNEY_LENGTH * 100),
    winsCount: data.evidence.length,
  };
}

export function exportBackup(state) {
  const normalized = migrateState(state);
  const payload = {
    format: BACKUP_FORMAT,
    formatVersion: VERSION,
    exportedAt: new Date().toISOString(),
    state: normalized,
  };
  return {
    filename: `aurelystudio-manifestation-action-planner-backup-${localDate()}.json`,
    mimeType: 'application/json',
    content: JSON.stringify(payload, null, 2),
  };
}

function duplicateRecordIds(records) {
  const seen = new Set();
  return records.some(record => {
    const id = asText(record?.id);
    if (!id) return false; // Older records receive a stable ID during migration.
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });
}

/** Parse/check a backup before replacing local data. Returns {ok, state, error}. */
export function validateBackup(value) {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { return { ok: false, state: null, error: 'The file is not valid JSON.' }; }
  }
  if (!isObject(parsed)) return { ok: false, state: null, error: 'The backup must contain an object.' };

  let candidate = parsed;
  if ('format' in parsed) {
    if (parsed.format !== BACKUP_FORMAT) return { ok: false, state: null, error: 'This backup belongs to a different app.' };
    if (Number(parsed.formatVersion) > VERSION) return { ok: false, state: null, error: 'This backup was made by a newer app version.' };
    candidate = parsed.state;
  }
  if (!isObject(candidate)) return { ok: false, state: null, error: 'The backup has no usable app data.' };
  if (candidate.app && candidate.app !== APP_ID) return { ok: false, state: null, error: 'This backup belongs to a different app.' };
  if (Number(candidate.version) > VERSION) return { ok: false, state: null, error: 'This backup was made by a newer app version.' };

  const dataFields = ['manifestations', 'goals', 'actions', 'tasks', 'days', 'daily', 'visionBoard', 'vision', 'journals', 'journalEntries', 'habits', 'evidence', 'wins', 'weeklyReviews', 'monthlyReviews', 'futureSelf', 'affirmations', 'logs369', 'method369', 'techniqueSessions', 'journey'];
  if (!dataFields.some(field => field in candidate)) {
    return { ok: false, state: null, error: 'This is not a Manifestation & Action Planner backup.' };
  }
  const arrays = ['manifestations', 'goals', 'actions', 'tasks', 'visionBoard', 'vision', 'journals', 'journalEntries', 'habits', 'evidence', 'wins', 'weeklyReviews', 'monthlyReviews', 'affirmations', 'logs369', 'method369', 'techniqueSessions'];
  if (arrays.some(field => field in candidate && !Array.isArray(candidate[field]))) {
    return { ok: false, state: null, error: 'A backup list has an invalid structure.' };
  }
  if (arrays.some(field => Array.isArray(candidate[field]) && candidate[field].some(item => !isObject(item)))) {
    return { ok: false, state: null, error: 'A backup record has an invalid structure.' };
  }
  if (arrays.some(field => Array.isArray(candidate[field]) && duplicateRecordIds(candidate[field]))) {
    return { ok: false, state: null, error: 'A backup contains duplicate record IDs.' };
  }
  for (const field of ['manifestations', 'goals']) {
    for (const item of asArray(candidate[field])) {
      if (['milestones', 'images', 'affirmations'].some(name => name in item && !Array.isArray(item[name])) ||
          asArray(item.milestones).some(milestone => !isObject(milestone))) {
        return { ok: false, state: null, error: 'A manifestation has an invalid structure.' };
      }
      if (duplicateRecordIds(asArray(item.milestones))) {
        return { ok: false, state: null, error: 'A manifestation contains duplicate milestone IDs.' };
      }
    }
  }
  if (Array.isArray(candidate.techniqueSessions) && candidate.techniqueSessions.some(item =>
    !isObject(item) || ('fields' in item && !isObject(item.fields)))) {
    return { ok: false, state: null, error: 'The technique sessions have an invalid structure.' };
  }
  const objects = ['profile', 'theme', 'themePrefs', 'days', 'daily', 'futureSelf', 'journey'];
  if (objects.some(field => field in candidate && !isObject(candidate[field]))) {
    return { ok: false, state: null, error: 'A backup section has an invalid structure.' };
  }
  for (const field of ['days', 'daily']) {
    if (Object.entries(asObject(candidate[field])).some(([date, day]) =>
      !validLocalDate(date) || !isObject(day) || ('journey' in day && !isObject(day.journey)))) {
      return { ok: false, state: null, error: 'A saved day has an invalid date or structure.' };
    }
  }
  // Reject invalid supplied dates instead of silently removing dated history.
  const datedLists = {
    manifestations: 'targetDate', goals: 'targetDate', actions: 'deadline', tasks: 'deadline',
    journals: 'date', journalEntries: 'date', evidence: 'date', wins: 'date',
    logs369: 'date', method369: 'date', techniqueSessions: 'date', weeklyReviews: 'weekStart',
  };
  for (const [field, dateField] of Object.entries(datedLists)) {
    if (asArray(candidate[field]).some(item => dateField in item && item[dateField] !== '' && !validLocalDate(item[dateField]))) {
      return { ok: false, state: null, error: 'A backup record has an invalid calendar date.' };
    }
  }
  const journey = asObject(candidate.journey);
  if ('startDate' in journey && journey.startDate !== '' && !validLocalDate(journey.startDate)) {
    return { ok: false, state: null, error: 'The journey has an invalid start date.' };
  }
  for (const [field, dateMap] of [['habits', 'completions'], ['affirmations', 'completedDates']]) {
    if (asArray(candidate[field]).some(item => {
      if (!(dateMap in item)) return false;
      const dates = item[dateMap];
      return Array.isArray(dates) ? dates.some(date => !validLocalDate(date))
        : !isObject(dates) || Object.keys(dates).some(date => !validLocalDate(date));
    })) {
      return { ok: false, state: null, error: 'A saved practice has an invalid date or structure.' };
    }
  }
  return { ok: true, state: migrateState(candidate), error: '' };
}
