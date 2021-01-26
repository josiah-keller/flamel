import Vue from "vue";

const DEFAULT_OPTIONS = {
  maxParticles: 4,
  minInterval: 3000,
  maxInterval: 4000,
  edgeSpillage: 0,
};

function randomInterval(min, max) {
  return min + (Math.random() * max - min);
}

Vue.directive("sparkle", {
  bind(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding.value || {});
    el.dataset.maxParticles = options.maxParticles;
    el.dataset.minInterval = options.minInterval;
    el.dataset.maxInterval = options.maxInterval;
    el.dataset.edgeSpillage = options.edgeSpillage;
    el.dataset.sparkleKill = false;

    if (! el.style.position) {
      el.style.position = "relative";
    }

    setTimeout(function sparkle() {
      const maxParticles = parseInt(el.dataset.maxParticles),
        minInterval = parseInt(el.dataset.minInterval),
        maxInterval = parseInt(el.dataset.maxInterval),
        edgeSpillage = parseInt(el.dataset.edgeSpillage),
        sparkleKill = el.dataset.sparkleKill === "true";

      const particleCount = el.querySelectorAll(".sparkle-particle").length;
      if (particleCount < maxParticles) {
        let newParticles = Math.floor(Math.round(randomInterval(0, maxParticles - particleCount)) / 2);
        while (newParticles--) {
          let particle = document.createElement("div");
          particle.setAttribute("class", "sparkle-particle");
          particle.style.left = `${randomInterval(-edgeSpillage, 100 + edgeSpillage)}%`;
          particle.style.top = `${randomInterval(-edgeSpillage, 100 + edgeSpillage)}%`;

          particle.addEventListener("animationend", function() {
            el.removeChild(particle);
          });

          el.appendChild(particle);
        }
      }
      if (! sparkleKill) setTimeout(sparkle, randomInterval(minInterval, maxInterval));
    }, randomInterval(options.minInterval, options.maxInterval));
  },
  update(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding || {});
    el.dataset.maxParticles = options.maxParticles;
    el.dataset.minInterval = options.minInterval;
    el.dataset.maxInterval = options.maxInterval;
    el.dataset.edgeSpillage = options.edgeSpillage;
  },
  unbind(el) {
    el.dataset.sparkleKill = true;
  },
});