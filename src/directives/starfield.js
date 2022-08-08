import Vue from "vue";

const DEFAULT_OPTIONS = {
  starCount: 20,
  twinkleMinInterval: 3000,
  twinkleMaxInterval: 6000,
  shooterMinInterval: 20000,
  shooterMaxInterval: 30000,
};

function randomInterval(min, max) {
  return min + (Math.random() * (max - min));
}

function addStar(parent, twinkleMinInterval, twinkleMaxInterval) {
  const twinkleInterval = randomInterval(twinkleMinInterval, twinkleMaxInterval);
  let star = document.createElement("div");
  star.classList.add("star-particle");
  star.style.left = `${randomInterval(0, 100)}%`;
  star.style.top = `${randomInterval(0, 100)}%`;
  star.style.animationDuration = `${twinkleInterval}ms`;
  parent.appendChild(star);
}

Vue.directive("starfield", {
  bind(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding.value || {});
    el.dataset.starCount = options.starCount;
    el.dataset.twinkleMinInterval = options.twinkleMinInterval;
    el.dataset.twinkleMaxInterval = options.twinkleMaxInterval;
    el.dataset.shooterMinInterval = options.shooterMinInterval;
    el.dataset.shooterMaxInterval = options.shooterMaxInterval;
    el.dataset.starfieldKill = false;

    if (! el.style.position) {
      el.style.position = "relative";
    }

    for (let i=0; i<options.starCount; i++) {
      addStar(el, options.twinkleMinInterval, options.twinkleMaxInterval);
    }

    setTimeout(function createShooter() {
      const shooterMinInterval = parseInt(el.dataset.shooterMinInterval),
        shooterMaxInterval = parseInt(el.dataset.shooterMaxInterval),
        starfieldKill = el.dataset.starfieldKill === "true";

      let shooter = document.createElement("div");
      shooter.classList.add("shooting-star-particle");
      shooter.style.left = `${randomInterval(50, 90)}%`;
      shooter.style.top = `${randomInterval(10, 45)}%`;

      shooter.addEventListener("animationend", function() {
        el.removeChild(shooter);
      });

      el.appendChild(shooter);

      if (! starfieldKill) setTimeout(createShooter, randomInterval(shooterMinInterval, shooterMaxInterval));
    }, randomInterval(options.shooterMinInterval, options.shooterMaxInterval));
  },
  update(el, binding) {
    const options = Object.assign({}, DEFAULT_OPTIONS, binding.value || {});
    el.dataset.starCount = options.starCount;
    el.dataset.twinkleMinInterval = options.twinkleMinInterval;
    el.dataset.twinkleMaxInterval = options.twinkleMaxInterval;
    el.dataset.shooterMinInterval = options.shooterMinInterval;
    el.dataset.shooterMaxInterval = options.shooterMaxInterval;
  },
  unbind(el) {
    el.dataset.shooterKill = true;
  },
});