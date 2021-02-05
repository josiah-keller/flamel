import Vue from "vue";

const DEFAULT_OPTIONS = {
  maxParticles: 4,
  minInterval: 3000,
  maxInterval: 4000,
};

function randomInterval(min, max) {
  return min + (Math.random() * max - min);
}

Vue.directive("glimmerTrail", {
  bind(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding.value || {});
    el.dataset.maxParticles = options.maxParticles;
    el.dataset.minInterval = options.minInterval;
    el.dataset.maxInterval = options.maxInterval;
    el.dataset.glimmerKill = false;

    setTimeout(function glimmer() {
      const maxParticles = parseInt(el.dataset.maxParticles),
        minInterval = parseInt(el.dataset.minInterval),
        maxInterval = parseInt(el.dataset.maxInterval),
        glimmerKill = el.dataset.glimmerKill === "true";

      const particleCount = el.querySelectorAll(".glimmer-particle").length;
      if (particleCount < maxParticles) {
        let particle = document.createElement("div");
        particle.setAttribute("class", "glimmer-particle");
        const boundingRect = el.getBoundingClientRect();
        particle.style.left = `${boundingRect.left + (boundingRect.right - boundingRect.left) / 2}px`;
        particle.style.top = `${boundingRect.top + (boundingRect.bottom - boundingRect.top) / 2}px`;

        particle.addEventListener("animationend", function() {
          el.removeChild(particle);
        });

        el.appendChild(particle);
      }
      if (! glimmerKill) setTimeout(glimmer, randomInterval(minInterval, maxInterval));
    }, randomInterval(options.minInterval, options.maxInterval));
  },
  update(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding.value || {});
    el.dataset.maxParticles = options.maxParticles;
    el.dataset.minInterval = options.minInterval;
    el.dataset.maxInterval = options.maxInterval;
  },
  unbind(el) {
    el.dataset.glimmerKill = true;
  }
});