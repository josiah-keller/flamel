import Constants from "./constants";

/**
 * Given a difficulty level and an array mapping levels to values, return the
 * corresponding value, with higher levels clamped to the highest in the array.
 * @param {Array<Number>} thresholds 
 * @param {Number} level 
 */
function clamp(thresholds, level) {
  if (level >= thresholds.length) {
    level = thresholds.length - 1;
  }
  return thresholds[level];
}

/**
 * Given a pool of options and a "threshold" setting the soft ceiling of the
 * pool, choose one of the options at random and return it.
 * @param {Array<any>} pool 
 * @param {Number} threshold 
 */
function draw(pool, threshold) {
  return pool[Math.floor(Math.random() * threshold)];
}

/**
 * Given an array of fractional numbers representing probabilities of mutually
 * exclusive events, choose one at random and return its index in the array.
 * Return -1 if the probabilities do not add up to 1 or if none of the events
 * are chosen.
 * @param {Array<Number>} probabilities 
 */
function selectEvent(probabilities) {
  let floor = 0;
  let segments = probabilities.map(prob => {
    floor += prob;
    return floor;
  });

  let rand = Math.random();
  for (let i=0; i<segments.length; i++) {
    if (rand < segments[i]) {
      return i;
    }
  }
  return -1;
}

export default {
  /**
   * Randomly select a rune for the game. Can optionally not allow "special"
   * runes, namely wildcards and bombs.
   * @param {Number} level 
   * @param {Boolean} allowSpecials - defaults to true
   */
  generateRune(level, allowSpecials=true) {
    if (allowSpecials) {
      switch(
        selectEvent([
          Constants.Probabilities.DRAW_WILD,
          Constants.Probabilities.DRAW_BOMB,
        ])
      ) {
        case 0:
          // wildcard
          return {
            shape: Constants.WILD_SHAPE,
            color: Constants.SPECIAL_COLOR,
          };
        case 1:
          // bomb
          return {
            shape: Constants.BOMB_SHAPE,
            color: Constants.SPECIAL_COLOR,
          };
      }
    }
    let shapeThreshold = clamp(Constants.LevelThresholds.SHAPE_THRESHOLDS, level);
    let colorThreshold = clamp(Constants.LevelThresholds.COLOR_THRESHOLDS, level);
    return {
      shape: draw(Constants.RUNE_SHAPES, shapeThreshold),
      color: draw(Constants.RUNE_COLORS, colorThreshold),
    };
  }
};