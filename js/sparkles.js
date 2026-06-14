document.addEventListener("DOMContentLoaded", () => {
  if (typeof tsParticles !== 'undefined') {
    tsParticles.load({
      id: "tsparticles-sparkles",
      options: {
        background: { color: { value: "transparent" } },
        fullScreen: { enable: false, zIndex: 1 },
        fpsLimit: 120,
        particles: {
          color: { value: "#8350e8" },
          move: { enable: true, direction: "none", speed: { min: 0.1, max: 1 }, straight: false },
          number: { value: 1200 },
          opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, sync: false, speed: 3 } },
          size: { value: { min: 0.4, max: 1 } },
        },
        detectRetina: true,
      }
    });
  }
});
