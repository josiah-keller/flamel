import Constants from "@/game/constants";

// The two hand-captured boards below (LEVEL_1_MIDWAY, LEVEL_1_ONELEFT) are raw
// JSON. The purpose-built fixtures after them are written with the compact
// token grid understood by `board()`, so that the adjacency relationships each
// one exercises can be read at a glance. One token per cell:
//
//   "."    blank cell, not gold
//   "*"    blank cell, gold
//   "Ar"   rune with shape "A" and color red, gold
//   "Ar-"  the same rune, not gold
//
// The second character of a rune token is a color abbreviation; see COLORS.
const COLORS = {
  r: "red",
  b: "blue",
  m: "magenta",
  g: "green",
  y: "yellow",
  c: "cyan",
  o: "orange",
  w: "white",
  a: "gray",
  s: Constants.SPECIAL_COLOR,
};

function parseCell(token) {
  if (token === ".") return { shape: null, color: null, gold: false };
  if (token === "*") return { shape: null, color: null, gold: true };
  const gold = ! token.endsWith("-");
  const rune = gold ? token : token.slice(0, -1);
  const color = COLORS[rune[1]];
  if (rune.length !== 2 || ! color) {
    throw new Error(`Unrecognized board cell token: "${token}"`);
  }
  return { shape: rune[0], color, gold };
}

// Build a board fixture from BOARD_HEIGHT rows of whitespace-separated tokens.
// Mis-sized grids throw so that a typo in a fixture fails loudly rather than
// producing a subtly wrong board.
function board(rows) {
  const cells = rows.map(row => row.trim().split(/\s+/).map(parseCell));
  if (cells.length !== Constants.BOARD_HEIGHT) {
    throw new Error(`Board has ${cells.length} rows, expected ${Constants.BOARD_HEIGHT}`);
  }
  cells.forEach((row, rowIndex) => {
    if (row.length !== Constants.BOARD_WIDTH) {
      throw new Error(`Board row ${rowIndex} has ${row.length} cells, expected ${Constants.BOARD_WIDTH}`);
    }
  });
  return { cells };
}

// Build a board of uniform cells, then apply a map of "row,col" -> token
// overrides. Handy for the mostly-empty and mostly-gold fixtures.
function boardOf(token, overrides = {}) {
  const result = board(
    Array(Constants.BOARD_HEIGHT).fill(
      Array(Constants.BOARD_WIDTH).fill(token).join(" ")
    )
  );
  for (const [coords, override] of Object.entries(overrides)) {
    const [rowIndex, cellIndex] = coords.split(",").map(Number);
    result.cells[rowIndex][cellIndex] = parseCell(override);
  }
  return result;
}

export default {
  Runes: {
    WILD: { shape: Constants.WILD_SHAPE, color: Constants.SPECIAL_COLOR },
    BOMB: { shape: Constants.BOMB_SHAPE, color: Constants.SPECIAL_COLOR },
  },
  Boards: {
    LEVEL_1_MIDWAY: {
      cells: [[{"shape":"E","color":"red","gold":true},{"shape":"A","color":"red","gold":true},{"shape":"E","color":"red","gold":true},{"shape":"A","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"C","color":"blue","gold":true},{"shape":"C","color":"blue","gold":true},{"shape":"D","color":"blue","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":"E","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":null,"color":null,"gold":false},{"shape":"D","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"blue","gold":true},{"shape":"D","color":"blue","gold":true},{"shape":"C","color":"blue","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":"B","color":"magenta","gold":true},{"shape":"D","color":"magenta","gold":true},{"shape":null,"color":null,"gold":false},{"shape":"C","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"blue","gold":true},{"shape":"C","color":"blue","gold":true},{"shape":"E","color":"blue","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":"B","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"B","color":"blue","gold":true},{"shape":"B","color":"blue","gold":true},{"shape":"C","color":"blue","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":"E","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":"B","color":"green","gold":true},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":true},{"shape":"E","color":"blue","gold":true},{"shape":"B","color":"blue","gold":true},{"shape":"C","color":"blue","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":"B","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":true},{"shape":"E","color":"green","gold":true},{"shape":"B","color":"green","gold":true},{"shape":"C","color":"green","gold":true},{"shape":null,"color":null,"gold":false}],[{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"green","gold":true},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false}],[{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false},{"shape":null,"color":null,"gold":false}]],
    },
    LEVEL_1_ONELEFT: {
      cells: [[{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"red","gold":true},{"shape":"B","color":"red","gold":true},{"shape":"C","color":"red","gold":true},{"shape":"C","color":"green","gold":true},{"shape":"D","color":"green","gold":true},{"shape":"B","color":"green","gold":true}],[{"shape":"E","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"red","gold":true},{"shape":"C","color":"red","gold":true},{"shape":"C","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":"B","color":"magenta","gold":true},{"shape":"D","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":"C","color":"red","gold":true},{"shape":"A","color":"red","gold":true},{"shape":"B","color":"red","gold":true},{"shape":"D","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":"B","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"D","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":"E","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":"B","color":"green","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"D","color":"red","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":"B","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":"B","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"D","color":"blue","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":"B","color":"magenta","gold":true},{"shape":"E","color":"magenta","gold":true},{"shape":"C","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":"A","color":"blue","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true}],[{"shape":null,"color":null,"gold":false},{"shape":"D","color":"magenta","gold":true},{"shape":"A","color":"magenta","gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":null,"color":null,"gold":true},{"shape":"E","color":"blue","gold":true},{"shape":"B","color":"blue","gold":true},{"shape":null,"color":null,"gold":true}]],
    },

    // Five blank cells with 0, 1, 2, 3 and 4 populated neighbors respectively,
    // in well-separated clusters so they don't interfere with each other:
    //   (0,0) adjacency 0   (1,0) adjacency 1   (3,4) adjacency 2
    //   (5,2) adjacency 3   (6,6) adjacency 4 (and already gold)
    // The adjacency-3 and adjacency-4 clusters are single-colored (red and blue
    // respectively), so a rune of that color plays and a mismatched one doesn't.
    ADJACENCY_CORNERS: board([
      ".  .  .  .  .  .  .  .  .",
      ".  Ar .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  Br .  .  .  .  .",
      ".  .  Dr .  Cr .  .  .  .",
      ".  Er .  .  .  .  Bb .  .",
      ".  .  Ar .  .  Cb *  Db .",
      ".  .  .  .  .  .  Eb .  .",
    ]),

    // Row 0 needs only (0,4) to complete; column 4 stays open. The lone rune at
    // (1,0) keeps the board from going blank when the row clears.
    ONE_CELL_FROM_ROW_CLEAR: board([
      "Ar Br Cr Dr .  Er Ar Br Cr",
      "Ar .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
    ]),

    // Column 0 needs only (3,0) to complete; row 3 stays open. The rune at
    // (5,5) keeps the board from going blank when the column clears.
    ONE_CELL_FROM_COL_CLEAR: board([
      "Ar .  .  .  .  .  .  .  .",
      "Br .  .  .  .  .  .  .  .",
      "Cr .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      "Dr .  .  .  .  .  .  .  .",
      "Er .  .  .  .  Ab .  .  .",
      "Ar .  .  .  .  .  .  .  .",
      "Br .  .  .  .  .  .  .  .",
    ]),

    // (3,4) is the last cell of both row 3 and column 4, so placing there
    // clears two spans at once. (0,0) survives both clears.
    ONE_CELL_FROM_BOTH_CLEAR: board([
      "Ab .  .  .  Ar .  .  .  .",
      ".  .  .  .  Br .  .  .  .",
      ".  .  .  .  Cr .  .  .  .",
      "Ar Br Cr Dr .  Er Ar Br Cr",
      ".  .  .  .  Dr .  .  .  .",
      ".  .  .  .  Er .  .  .  .",
      ".  .  .  .  Ar .  .  .  .",
      ".  .  .  .  Br .  .  .  .",
    ]),

    // Row 0 is the only populated span, so completing it at (0,4) clears the
    // row and leaves the board entirely blank.
    ROW_CLEAR_EMPTIES_BOARD: board([
      "Ar Br Cr Dr .  Er Ar Br Cr",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
      ".  .  .  .  .  .  .  .  .",
    ]),

    // Every blank cell is hemmed in by three runes with mutually distinct
    // shapes *and* colors (A/red, B/blue, C/green). Satisfying all three at
    // once is impossible for any ordinary rune, so no move is legal — only a
    // Wild can play. Each row and column still has a blank, so the board is one
    // that could actually arise in play.
    NO_LEGAL_MOVES: board([
      "Bb Ar Cg Ar .  Bb Ar Cg Bb",
      "Cg .  Ar Bb Cg Cg .  Ar Cg",
      "Ar Bb Ar Cg Ar Bb Bb .  Ar",
      "Bb Cg .  Ar Bb Cg Ar Cg Ar",
      "Cg Ar Bb Cg Bb Ar Bb Cg . ",
      "Ar Bb Cg Bb Cg .  Ar Ar Bb",
      ".  Cg Ar Ar Ar Bb Cg Bb Ar",
      "Bb Ar Bb .  Cg Ar Bb Cg Bb",
    ]),

    ALL_GOLD: boardOf("*"),
    ALMOST_ALL_GOLD: boardOf("*", { "7,8": "." }),
    ALL_BLANK: boardOf("."),
    ALMOST_ALL_BLANK: boardOf(".", { "3,4": "Ws" }),

    // Wholly gold apart from (3,5), so placing a rune compatible with (3,4)
    // turns the board gold without emptying it.
    ONE_CELL_FROM_BOARD_CLEAR: boardOf("*", { "3,4": "Ar", "3,5": "." }),

    // Wholly gold, with row 3 one cell short. Completing it at (3,4) clears the
    // row, which leaves the board simultaneously all-gold *and* all-blank.
    ALL_GOLD_ROW_CLEAR: boardOf("*", {
      "3,0": "Ar", "3,1": "Br", "3,2": "Cr", "3,3": "Dr",
      "3,5": "Er", "3,6": "Ar", "3,7": "Br", "3,8": "Cr",
    }),

    // Wholly gold apart from the single rune at (3,4), so bombing that rune
    // also leaves the board all-gold *and* all-blank at once.
    ALL_GOLD_ONE_RUNE_LEFT: boardOf("*", { "3,4": "Ar" }),
  },
};