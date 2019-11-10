export default {
  BOARD_WIDTH: 9,
  BOARD_HEIGHT: 8,
  START_SPACE_ROW: 3,
  START_SPACE_COL: 4,

  SPECIAL_COLOR: "black",
  WILD_SHAPE: "W",
  BOMB_SHAPE: "%",

  RUNE_SHAPES: "ABCDEFGHIJKLMNOPQRSTUV".split(""),
  RUNE_COLORS: [
    "red", "blue", "magenta", "green",
    "yellow", "cyan", "orange", "white", "gray",
  ],

  Probabilities: {
    // Determined empirically by watching a few YouTube videos; may not be accurate
    DRAW_WILD: 0.025,
    DRAW_BOMB: 0.015,
  },
  ScoreValues: {
    // Observed from a small sample of YouTube videos; didn't observe every possible scenario
    // To be multiplied by a factor for the difficulty setting
    SINGLE_ADJACENT: 5,
    DOUBLE_ADJACENT: 15,
    TRIPLE_ADJACENT: 30,
    QUAD_ADJACENT: 60, // a guess
    GOLD_SINGLE_ADJACENT: 1,
    GOLD_DOUBLE_ADJACENT: 2,
    GOLD_TRIPLE_ADJACENT: 3, // a guess
    GOLD_QUAD_ADJACENT: 4, // a guess
    CLEAR_ROW: 50,
    GOLD_CLEAR_ROW: 5,
  },
  LevelThresholds: {
    // Map a level number (index) to a length for the subset of the RUNE_SHAPES/RUNE_COLORS arrays to be drawn from
    // Sourced from this document; info seems plausible: https://everything.explained.today/Alchemy_(video_game)/
    SHAPE_THRESHOLDS: [
      0,  // no level 0
      5,  // level 1
      5,  // level 2 (a new color is added instead)
      6,  // level 3
      7,  // level 4
      8,  // level 5
      8,  // level 6 (new color)
      9,  // level 7
      10, // level 8
      11, // level 9
      11, // level 10 (new color)
      12, // level 11
      13, // level 12
      14, // level 13
      14, // level 14 (new color)
      15, // level 15
      16, // level 16
      17, // level 17
      17, // level 18 (new color)
      18, // level 19
      19, // level 20
      20, // level 21
      20, // level 22 (nothing added)
      21, // level 23
      22, // level 24
    ],
    COLOR_THRESHOLDS: [
      0, // no level 0
      4, // level 1
      5, // level 2
      5, // level 3
      5, // level 4
      5, // level 5
      6, // level 6
      6, // level 7
      6, // level 8
      6, // level 9
      7, // level 10
      7, // level 11
      7, // level 12
      7, // level 13
      8, // level 14
      8, // level 15
      8, // level 16
      8, // level 17
      9, // level 18
    ]
  }
};