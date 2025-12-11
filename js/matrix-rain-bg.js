(function () {
  // === CONFIG: tweak these to control timing ===
  const FADE_IN_MS    = 3000;  // time to fade in
  const VISIBLE_MS    = 3000;  // time fully visible
  const FADE_OUT_MS   = 3000;  // time to fade out
  const PAUSE_MS      = 10000; // time with no rain before looping
  const FONT_SIZE     = 16;    // matrix character size
  const TRAIL_FADE    = 0.1;   // higher = faster trail fade

  // NEW: how much to slow the rain
  // 1 = original speed, 2 = ~half speed, 3 = ~one-third, etc.
  const SPEED_DIVIDER = 8;

  // Character set: numbers + Latin + a few katakana for Matrix vibe
  const CHARACTERS =
    'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-bg';
  canvas.className = 'matrix-bg-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  let width, height, columns, drops;
  let opacity = 0;
  let phase = 'fadeIn';
  let phaseStart = performance.now();

  // frame counter
  let frame = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    columns = Math.floor(width / FONT_SIZE);

    // start each stream at a random negative height
    drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * -50)
    );

    ctx.font = FONT_SIZE + 'px monospace';
  }

  window.addEventListener('resize', resize);
  resize();

  function updatePhase(now) {
    const elapsed = now - phaseStart;

    if (phase === 'fadeIn') {
      if (elapsed >= FADE_IN_MS) {
        opacity = 1;
        phase = 'visible';
        phaseStart = now;
      } else {
        opacity = elapsed / FADE_IN_MS;
      }
    } else if (phase === 'visible') {
      opacity = 1;
      if (elapsed >= VISIBLE_MS) {
        phase = 'fadeOut';
        phaseStart = now;
      }
    } else if (phase === 'fadeOut') {
      if (elapsed >= FADE_OUT_MS) {
        opacity = 0;
        phase = 'pause';
        phaseStart = now;
      } else {
        opacity = 1 - elapsed / FADE_OUT_MS;
      }
    } else if (phase === 'pause') {
      opacity = 0;
      if (elapsed >= PAUSE_MS) {
        phase = 'fadeIn';
        phaseStart = now;
      }
    }

    canvas.style.opacity = opacity.toFixed(3);
  }

  function draw(now) {
    frame++; // count frames
    updatePhase(now);

    // Detect MkDocs Material color scheme
    const scheme = document.documentElement.getAttribute('data-md-color-scheme');
    const isLight = scheme === 'default';

    // Only update/draw on every Nth frame to slow motion
    const shouldDrawThisFrame = (frame % SPEED_DIVIDER === 0);

    if (opacity > 0 && shouldDrawThisFrame) {
      // 🔹 In DARK MODE: keep your original background fade
      if (!isLight) {
        ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE})`;
        ctx.fillRect(0, 0, width, height);
      }
      // 🔹 In LIGHT MODE: do *nothing* to background — no black, no fade

      // Same glyph style as before
      ctx.fillStyle = '#00ff44';

      for (let i = 0; i < drops.length; i++) {
        const text = CHARACTERS.charAt(
          Math.floor(Math.random() * CHARACTERS.length)
        );
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;  // exact same increment as before
        }
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();