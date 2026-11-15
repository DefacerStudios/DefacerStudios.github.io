// The 404 page's toy: your pointer (or finger) is a lantern. Shadows creep in from
// the dark and shrink away from the light; click or tap to flare and push them back.
(function () {
  "use strict";
  var canvas = document.getElementById("lantern");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1;
  var light = { x: 0, y: 0, r: 150, flare: 0 };
  var shades = [];
  var COLORS = ["#ff4d6d", "#7fd8ff", "#ffb347"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!light.x) { light.x = W * 0.72; light.y = H * 0.5; }
  }

  function spawn() {
    var side = Math.random() * 4 | 0;
    var x = side === 0 ? -40 : side === 1 ? W + 40 : Math.random() * W;
    var y = side === 2 ? -40 : side === 3 ? H + 40 : Math.random() * H;
    shades.push({ x: x, y: y, s: 14 + Math.random() * 14, v: 18 + Math.random() * 26, eye: COLORS[Math.random() * 3 | 0], t: Math.random() * 6 });
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    light.flare = Math.max(0, light.flare - dt * 1.6);
    var reach = light.r * (1 + light.flare * 1.4);
    // Light pool.
    var g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, reach);
    g.addColorStop(0, "rgba(255, 214, 140, 0.30)");
    g.addColorStop(0.5, "rgba(255, 179, 71, 0.10)");
    g.addColorStop(1, "rgba(255, 179, 71, 0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(light.x, light.y, reach, 0, Math.PI * 2); ctx.fill();
    // Shadows: drift toward the light, recoil and shrink inside it.
    for (var i = shades.length - 1; i >= 0; i--) {
      var s = shades[i];
      s.t += dt;
      var dx = light.x - s.x, dy = light.y - s.y, d = Math.hypot(dx, dy) || 1;
      var inLight = d < reach;
      var dir = inLight ? -2.4 : 1;
      s.x += dx / d * s.v * dir * dt;
      s.y += dy / d * s.v * dir * dt + Math.sin(s.t * 2) * 6 * dt;
      if (inLight) s.s -= dt * 9;
      if (s.s < 4 || s.x < -120 || s.x > W + 120 || s.y < -120 || s.y > H + 120) { shades.splice(i, 1); continue; }
      ctx.fillStyle = "rgba(22, 12, 26, 0.92)";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, Math.PI, 0); ctx.lineTo(s.x + s.s, s.y + s.s * 0.9);
      for (var k = 3; k >= 0; k--) ctx.arc(s.x - s.s + s.s * 0.5 * k + s.s * 0.25, s.y + s.s * 0.9, s.s * 0.25, 0, Math.PI);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = s.eye;
      ctx.fillRect(s.x - s.s * 0.5, s.y - s.s * 0.15, s.s * 0.32, s.s * 0.12);
      ctx.fillRect(s.x + s.s * 0.18, s.y - s.s * 0.15, s.s * 0.32, s.s * 0.12);
    }
    // The lantern.
    ctx.fillStyle = "#3b2a3a"; ctx.fillRect(light.x - 9, light.y - 15, 18, 4); ctx.fillRect(light.x - 9, light.y + 11, 18, 4);
    ctx.fillStyle = "#ffd27a"; ctx.fillRect(light.x - 7, light.y - 11, 14, 22);
    ctx.fillStyle = "#ff9a4a"; ctx.beginPath(); ctx.arc(light.x, light.y, 4 + light.flare * 3, 0, Math.PI * 2); ctx.fill();
  }

  function move(e) { var r = canvas.getBoundingClientRect(); light.x = e.clientX - r.left; light.y = e.clientY - r.top; }
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerdown", function (e) { move(e); light.flare = 1; });
  resize();
  for (var i = 0; i < 9; i++) spawn();

  if (reduce) { draw(0); return; }
  var last = performance.now(), acc = 0;
  (function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    acc += dt;
    if (acc > 0.6 && shades.length < 22) { acc = 0; spawn(); }
    draw(dt);
    requestAnimationFrame(frame);
  })(last);
})();
