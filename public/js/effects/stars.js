export function initStars() {
  const canvas = document.getElementById("starCanvas");
  const ctx = canvas.getContext("2d");

  function resizeStars() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  window.addEventListener("resize", resizeStars);
  resizeStars();

  const STAR_COUNT = 120;

  const stars = Array.from({ length: STAR_COUNT }, () => {
    const isGold = Math.random() < 0.06;

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,

      speed: Math.random() * 0.35 + 0.1,

      size: isGold ? Math.random() * 2.0 + 0.8 : Math.random() * 1.6 + 0.6,

      alpha: isGold ? Math.random() * 0.7 + 0.5 : Math.random() * 0.6 + 0.4,

      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.005,

      color: isGold ? "255,215,120" : "0,200,255",
    };
  });

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.y += s.speed;

      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }

      s.phase += s.twinkleSpeed;

      const a = s.alpha * (0.7 + Math.sin(s.phase) * 0.5);

      ctx.fillStyle = `rgba(${s.color}, ${a})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animateStars);
  }

  animateStars();
}
