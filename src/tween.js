const LINEAR = function(t) { return t; };

const tween = {
  LINEAR,
  DEFAULT_OPTIONS: {
    easing: LINEAR,
    duration: 500, // ms
  },
  go(obj, values, opts) {
    const options = Object.assign({}, tween.DEFAULT_OPTIONS, opts || {});
    const start = new Date().getTime();
    const startingValues = {};
    for (const key of Object.keys(values)) {
      startingValues[key] = obj[key];
    }
    requestAnimationFrame(function tick() {
      const now = new Date().getTime(), t = options.easing((now - start) / options.duration);
      for (const key of Object.keys(startingValues)) {
        obj[key] = startingValues[key] + ((values[key] - startingValues[key]) * t);
      }
      if (now - start < options.duration) {
        requestAnimationFrame(tick);
      } else {
        for (const [key, value] of Object.entries(values)) {
          obj[key] = value;
        }
      }
    });
  },
};

export default tween;