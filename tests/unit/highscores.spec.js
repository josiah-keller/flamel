import Highscores from "@/game/highscores";
import Constants from "@/game/constants";
import TestData from "./test-data";

// The persistence layer. jsdom supplies a real localStorage, so these tests
// exercise the actual storage path rather than a mock — which is also why they
// have to clear it between cases.
//
// STORAGE_KEY isn't exported, so storage is seeded and inspected through the
// module's own save/load wherever possible. The raw key only appears in the
// malformed-input tests, which by definition can't go through save().
const RAW_KEY = "flamel_data";

const { EASY, MEDIUM, HARD } = Constants.Difficulties;
const { entry, table } = TestData.Scores;

// The module's own limits, which it doesn't export.
const TOP_N = 10;
const MAX_ENTRIES = 100;

function seed(scores, extra = {}) {
  Highscores.save({ settings: { playerName: "" }, scores, boardsPlayed: 0, ...extra });
}

describe("high scores", () => {
  beforeEach(() => {
    // jsdom shares one localStorage across every test in the file, so without
    // this entries leak from one case into the next.
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("load", () => {
    it("returns empty defaults when nothing is stored", () => {
      expect(Highscores.load()).toEqual({
        settings: { playerName: "" },
        scores: [],
        boardsPlayed: 0,
      });
    });

    it("round trips through save", () => {
      const data = {
        settings: { playerName: "Flamel" },
        scores: [entry({ id: "a" })],
        boardsPlayed: 7,
      };
      Highscores.save(data);
      expect(Highscores.load()).toEqual(data);
    });

    it.each([
      ["unparseable JSON", "not json at all"],
      ["the literal null", "null"],
      ["a bare string", '"just a string"'],
      ["a number", "42"],
    ])("falls back to defaults on %s", (_label, raw) => {
      localStorage.setItem(RAW_KEY, raw);
      expect(Highscores.load()).toEqual({
        settings: { playerName: "" },
        scores: [],
        boardsPlayed: 0,
      });
    });

    it.each([
      ["a scores object", { scores: { nope: true } }],
      ["a scores string", { scores: "nope" }],
      ["a missing scores key", {}],
    ])("coerces %s to an empty array", (_label, stored) => {
      localStorage.setItem(RAW_KEY, JSON.stringify(stored));
      expect(Highscores.load().scores).toEqual([]);
    });

    it.each([
      ["a string", "12"],
      ["null", null],
      ["undefined", undefined],
    ])("coerces a boardsPlayed of %s to zero", (_label, boardsPlayed) => {
      localStorage.setItem(RAW_KEY, JSON.stringify({ boardsPlayed }));
      expect(Highscores.load().boardsPlayed).toBe(0);
    });

    it("passes a non-object settings value straight through", () => {
      // The guard is `parsed.settings || {playerName: ""}`, which only catches
      // a falsy value — any truthy nonsense is handed to callers as-is, and
      // getSettings().playerName then comes back undefined.
      localStorage.setItem(RAW_KEY, JSON.stringify({ settings: "a string" }));
      expect(Highscores.load().settings).toBe("a string");
      expect(Highscores.getSettings().playerName).toBeUndefined();
    });
  });

  describe("save", () => {
    // Simulates the ways a real browser refuses a write: a full quota, site
    // data blocked, Safari private mode.
    function breakStorage() {
      return jest.spyOn(localStorage.__proto__, "setItem").mockImplementation(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });
    }

    it("reports success", () => {
      expect(Highscores.save({ settings: {}, scores: [], boardsPlayed: 0 })).toBe(true);
    });

    it("contains a storage failure instead of throwing", () => {
      // save() should not throw because the exception would bubble up to
      // interrupt game logic
      breakStorage();
      expect(() => Highscores.save({ scores: [] })).not.toThrow();
      expect(Highscores.save({ scores: [] })).toBe(false);
    });

    it.each([
      ["addEntry", () => Highscores.addEntry(entry())],
      ["saveSettings", () => Highscores.saveSettings({ playerName: "x" })],
      ["incrementBoardsPlayed", () => Highscores.incrementBoardsPlayed()],
      ["resetBoardsPlayed", () => Highscores.resetBoardsPlayed()],
      ["resetAll", () => Highscores.resetAll()],
    ])("%s survives a storage failure", (_label, mutate) => {
      breakStorage();
      expect(mutate).not.toThrow();
    });

    it.each([
      ["saveSettings", () => Highscores.saveSettings({ playerName: "x" })],
      ["incrementBoardsPlayed", () => Highscores.incrementBoardsPlayed()],
      ["resetBoardsPlayed", () => Highscores.resetBoardsPlayed()],
      ["resetAll", () => Highscores.resetAll()],
    ])("%s reports the failure to its caller", (_label, mutate) => {
      // Nothing checks these yet, but a UI that wants to tell the player their
      // score couldn't be saved has something to check.
      breakStorage();
      expect(mutate()).toBe(false);
    });

    it("leaves the stored data untouched when a write fails", () => {
      seed([entry({ id: "kept" })], { boardsPlayed: 3 });
      breakStorage();
      Highscores.incrementBoardsPlayed();
      Highscores.saveSettings({ playerName: "nope" });
      jest.restoreAllMocks();
      const data = Highscores.load();
      expect(data.scores.map(e => e.id)).toEqual(["kept"]);
      expect(data.boardsPlayed).toBe(3);
      expect(data.settings.playerName).toBe("");
    });

    it("still reports the new entry from addEntry when the write fails", () => {
      breakStorage();
      const saved = Highscores.addEntry(entry({ id: "ghost" }));
      expect(saved.id).toBe("ghost");
      jest.restoreAllMocks();
      expect(Highscores.load().scores).toEqual([]);
    });
  });

  describe("getTopScores", () => {
    beforeEach(() => {
      seed([
        entry({ id: "e1", score: 300, difficulty: EASY }),
        entry({ id: "e2", score: 100, difficulty: EASY }),
        entry({ id: "e3", score: 500, difficulty: EASY }),
        entry({ id: "m1", score: 900, difficulty: MEDIUM }),
        entry({ id: "h1", score: 700, difficulty: HARD }),
      ]);
    });

    it("filters to one difficulty, highest first", () => {
      expect(Highscores.getTopScores(EASY).map(e => e.id)).toEqual(["e3", "e1", "e2"]);
    });

    it("returns every difficulty for an explicit null", () => {
      expect(Highscores.getTopScores(null).map(e => e.id))
        .toEqual(["m1", "h1", "e3", "e1", "e2"]);
    });

    it("returns nothing at all when the difficulty is omitted", () => {
      // Finding 6 in docs/game-module-findings.md: only an explicit null means
      // "all". A missing argument is undefined, which filters to entries whose
      // own difficulty is undefined — i.e. none of them.
      expect(Highscores.getTopScores()).toEqual([]);
      expect(Highscores.getTopScores(undefined)).toEqual([]);
    });

    it("honors an explicit limit", () => {
      expect(Highscores.getTopScores(EASY, 2).map(e => e.id)).toEqual(["e3", "e1"]);
    });

    it("defaults to the top ten", () => {
      seed(table(25, { difficulty: EASY }));
      expect(Highscores.getTopScores(EASY)).toHaveLength(TOP_N);
    });

    it("leaves the stored order untouched", () => {
      // getTopScores slices before sorting; sorting in place would silently
      // reorder what the next save writes back.
      const storedBefore = Highscores.load().scores.map(e => e.id);
      Highscores.getTopScores(null);
      expect(Highscores.load().scores.map(e => e.id)).toEqual(storedBefore);
    });

    it("returns an empty list for a difficulty with no entries", () => {
      seed([entry({ id: "e1", difficulty: EASY })]);
      expect(Highscores.getTopScores(HARD)).toEqual([]);
    });
  });

  describe("isNewHighScore", () => {
    it("accepts anything while the table is empty", () => {
      expect(Highscores.isNewHighScore(1, EASY)).toBe(true);
    });

    it("accepts anything while the table is short of ten", () => {
      seed(table(TOP_N - 1, { difficulty: EASY, score: 10000 }));
      // Even a score below every existing entry still makes the list, because
      // there's a free slot.
      expect(Highscores.isNewHighScore(1, EASY)).toBe(true);
    });

    it("compares against the tenth score once the table is full", () => {
      // table(10) scores run 1000 down to 100, so the cutoff is 100.
      seed(table(TOP_N, { difficulty: EASY }));
      expect(Highscores.isNewHighScore(101, EASY)).toBe(true);
      expect(Highscores.isNewHighScore(99, EASY)).toBe(false);
    });

    it("rejects a score that merely ties the tenth", () => {
      // The comparison is a strict `>`, so tying the bottom of the table isn't
      // a new high score.
      seed(table(TOP_N, { difficulty: EASY }));
      expect(Highscores.isNewHighScore(100, EASY)).toBe(false);
    });

    it("judges each difficulty separately", () => {
      seed(table(TOP_N, { difficulty: EASY }));
      // Hard has no entries, so even a tiny score qualifies there.
      expect(Highscores.isNewHighScore(1, HARD)).toBe(true);
      expect(Highscores.isNewHighScore(1, EASY)).toBe(false);
    });
  });

  describe("settings", () => {
    it("returns the default settings when nothing is stored", () => {
      expect(Highscores.getSettings()).toEqual({ playerName: "" });
    });

    it("merges over the existing settings rather than replacing them", () => {
      Highscores.saveSettings({ playerName: "Flamel" });
      Highscores.saveSettings({ someLaterSetting: true });
      expect(Highscores.getSettings()).toEqual({
        playerName: "Flamel",
        someLaterSetting: true,
      });
    });

    it("leaves the scores and boards played alone", () => {
      seed([entry({ id: "e1" })], { boardsPlayed: 4 });
      Highscores.saveSettings({ playerName: "Flamel" });
      const data = Highscores.load();
      expect(data.scores.map(e => e.id)).toEqual(["e1"]);
      expect(data.boardsPlayed).toBe(4);
    });
  });

  describe("addEntry", () => {
    it("stores the entry and returns it", () => {
      const saved = Highscores.addEntry(entry({ score: 4200 }));
      expect(Highscores.load().scores).toEqual([saved]);
      expect(saved.score).toBe(4200);
    });

    it("generates an id and a timestamp", () => {
      const saved = Highscores.addEntry(entry());
      // makeId is `${Date.now()}-${0..999}`.
      expect(saved.id).toMatch(/^\d+-\d+$/);
      expect(Number.isNaN(Date.parse(saved.date))).toBe(false);
    });

    it("lets the caller override the generated id and date", () => {
      // `...entry` is spread after the generated fields, so anything the caller
      // passes wins. Convenient for the eviction tests below, but it also means
      // a caller can quietly create a duplicate id.
      const saved = Highscores.addEntry(entry({ id: "mine", date: "2021-06-01T00:00:00.000Z" }));
      expect(saved.id).toBe("mine");
      expect(saved.date).toBe("2021-06-01T00:00:00.000Z");
    });

    it("appends to the entries already stored", () => {
      seed([entry({ id: "first" })]);
      Highscores.addEntry(entry({ id: "second" }));
      expect(Highscores.load().scores.map(e => e.id)).toEqual(["first", "second"]);
    });

    it("keeps entries that are not yet over the cap", () => {
      seed(table(MAX_ENTRIES - 1));
      Highscores.addEntry(entry({ id: "newest" }));
      expect(Highscores.load().scores).toHaveLength(MAX_ENTRIES);
    });
  });

  describe("eviction", () => {
    it("drops the oldest unprotected entry once over the cap", () => {
      // table() makes entry 0 both the oldest and the highest scoring, so the
      // first ten are protected by the top-ten view and eviction has to skip
      // past them to entry 10.
      seed(table(MAX_ENTRIES));
      Highscores.addEntry(entry({ id: "newest", score: 1 }));
      const ids = Highscores.load().scores.map(e => e.id);
      expect(ids).toHaveLength(MAX_ENTRIES);
      expect(ids).not.toContain("entry-10");
      expect(ids).toContain("entry-0");
      expect(ids).toContain("newest");
    });

    it("protects the top ten of every difficulty as well as the top ten overall", () => {
      const scores = TestData.Scores.tableAcrossDifficulties(MAX_ENTRIES);
      seed(scores);
      Highscores.addEntry(entry({ id: "newest", score: 1 }));
      const survivors = Highscores.load().scores.map(e => e.id);
      // The best ten of each difficulty must all still be there.
      [EASY, MEDIUM, HARD].forEach(difficulty => {
        scores
          .filter(e => e.difficulty === difficulty)
          .sort((a, b) => b.score - a.score)
          .slice(0, TOP_N)
          .forEach(e => expect(survivors).toContain(e.id));
      });
    });

    it("always gets back down to the cap when ids are well formed", () => {
      // At most 40 ids can be protected (ten per difficulty plus ten overall),
      // which is well under the 100-entry cap — so there are always enough
      // unprotected entries to remove and the table can't creep upward.
      seed(TestData.Scores.tableAcrossDifficulties(MAX_ENTRIES + 40));
      Highscores.addEntry(entry({ id: "newest", score: 1 }));
      expect(Highscores.load().scores).toHaveLength(MAX_ENTRIES);
    });

    it("throws away the new entry when the stored ones have no ids", () => {
      // Finding 2 in docs/game-module-findings.md. protectedIds builds a Set
      // of ids; id-less entries contribute a single `undefined`, and then
      // every other id-less entry matches it, so the entire stored table reads
      // as protected. The only entry eviction is willing to drop is the one
      // just added — so the score the player actually earned is the one that
      // disappears.
      seed(TestData.Scores.tableWithoutIds(MAX_ENTRIES));
      const saved = Highscores.addEntry(entry({ id: "newest", score: 1 }));
      const ids = Highscores.load().scores.map(e => e.id);
      expect(ids).toHaveLength(MAX_ENTRIES);
      expect(ids).not.toContain("newest");
      // addEntry hands back the entry it just discarded, with no indication
      // that it never made it to storage. Its one caller
      // (NewHighScorePrompt.vue) ignores the return value, so this is latent.
      expect(saved.id).toBe("newest");
    });

    it("evicts nothing when every entry shares one id", () => {
      // The same mechanism with a colliding id rather than a missing one:
      // protecting one entry protects all of its twins. makeId can collide for
      // two entries saved in the same millisecond.
      seed(TestData.Scores.tableWithDuplicateIds(MAX_ENTRIES));
      Highscores.addEntry(entry({ id: "duplicate", score: 1 }));
      expect(Highscores.load().scores).toHaveLength(MAX_ENTRIES + 1);
    });

    it("survives malformed dates without throwing", () => {
      // The sort comparator is `new Date(a.date) - new Date(b.date)`, which is
      // NaN for an unparseable date. That leaves the order unspecified, so this
      // only pins that eviction still happens and still removes the right
      // number of entries.
      seed(table(MAX_ENTRIES, { date: "not a date" }));
      expect(() => Highscores.addEntry(entry({ id: "newest", score: 1 }))).not.toThrow();
      expect(Highscores.load().scores).toHaveLength(MAX_ENTRIES);
    });
  });

  describe("boards played", () => {
    it("starts at zero", () => {
      expect(Highscores.getBoardsPlayed()).toBe(0);
    });

    it("increments from nothing stored", () => {
      // `(data.boardsPlayed || 0) + 1`, so a missing or zero value still
      // counts up rather than becoming NaN.
      Highscores.incrementBoardsPlayed();
      Highscores.incrementBoardsPlayed();
      expect(Highscores.getBoardsPlayed()).toBe(2);
    });

    it("resets to zero", () => {
      Highscores.incrementBoardsPlayed();
      Highscores.resetBoardsPlayed();
      expect(Highscores.getBoardsPlayed()).toBe(0);
    });

    it("leaves the scores alone when incrementing", () => {
      seed([entry({ id: "e1" })]);
      Highscores.incrementBoardsPlayed();
      expect(Highscores.load().scores.map(e => e.id)).toEqual(["e1"]);
    });
  });

  describe("resetAll", () => {
    it("wipes the scores and the board count but keeps the settings", () => {
      seed(table(5), { boardsPlayed: 12 });
      Highscores.saveSettings({ playerName: "Flamel" });
      Highscores.resetAll();
      expect(Highscores.load()).toEqual({
        settings: { playerName: "Flamel" },
        scores: [],
        boardsPlayed: 0,
      });
    });
  });
});
