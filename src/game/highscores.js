const STORAGE_KEY = "flamel_data";
const MAX_ENTRIES = 100;
const TOP_N = 10;

const DIFFICULTIES = [0, 1, 2]; // must match Constants.Difficulties values

function defaultData() {
  return { settings: { playerName: "" }, scores: [], boardsPlayed: 0 };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultData();
    return {
      settings: parsed.settings || { playerName: "" },
      scores: Array.isArray(parsed.scores) ? parsed.scores : [],
      boardsPlayed: typeof parsed.boardsPlayed === "number" ? parsed.boardsPlayed : 0,
    };
  } catch (_) {
    return defaultData();
  }
}

function getBoardsPlayed() {
  return load().boardsPlayed;
}

function incrementBoardsPlayed() {
  const data = load();
  data.boardsPlayed = (data.boardsPlayed || 0) + 1;
  return save(data);
}

function resetBoardsPlayed() {
  const data = load();
  data.boardsPlayed = 0;
  return save(data);
}

function resetAll() {
  const data = load();
  return save({ settings: data.settings, scores: [], boardsPlayed: 0 });
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (_) {
    // suppress exceptions - a throw out of this function would break the
    // cleared-board transition rather than just losing a statistic.
    return false;
  }
}

// Returns entries sorted by score descending for a given difficulty.
// Pass null for difficulty to get all entries sorted by score.
function getTopScores(difficulty, limit = TOP_N) {
  const { scores } = load();
  const filtered = difficulty === null
    ? scores
    : scores.filter(e => e.difficulty === difficulty);
  return filtered
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function isNewHighScore(score, difficulty) {
  const top = getTopScores(difficulty, TOP_N);
  return top.length < TOP_N || score > top[top.length - 1].score;
}

function getSettings() {
  return load().settings;
}

function saveSettings(settings) {
  const data = load();
  data.settings = { ...data.settings, ...settings };
  return save(data);
}

// Generates a simple unique id.
function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Determines which entry ids are "protected" (appear in any top-10 view).
function protectedIds(scores) {
  const ids = new Set();
  // Helper for adding ID to the set. Guards against any malformed entry that
  // lacks an ID, to prevent buggy eviction.
  const addId = e => {
    if (e.id) ids.add(e.id);
  };
  // Top N per difficulty
  for (const diff of DIFFICULTIES) {
    const top = scores
      .filter(e => e.difficulty === diff)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N);
    top.forEach(addId);
  }
  // Top N overall
  scores
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .forEach(addId);
  return ids;
}

function evict(scores) {
  if (scores.length <= MAX_ENTRIES) return scores;
  const protected_ = protectedIds(scores);
  // Sort oldest-first so we remove the least relevant unprotected entries first
  const sorted = scores.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const result = [];
  let removed = 0;
  const toRemove = scores.length - MAX_ENTRIES;
  for (const entry of sorted) {
    if (removed < toRemove && !protected_.has(entry.id)) {
      removed++;
    } else {
      result.push(entry);
    }
  }
  return result;
}

function addEntry(entry) {
  const data = load();
  const newEntry = { id: makeId(), date: new Date().toISOString(), ...entry };
  data.scores = evict([...data.scores, newEntry]);
  // The entry is returned whether or not the write succeeded, and whether or
  // not eviction kept it — see finding 2 in docs/game-module-findings.md.
  save(data);
  return newEntry;
}

export default {
  load,
  save,
  getTopScores,
  isNewHighScore,
  getSettings,
  saveSettings,
  addEntry,
  getBoardsPlayed,
  incrementBoardsPlayed,
  resetBoardsPlayed,
  resetAll,
};
