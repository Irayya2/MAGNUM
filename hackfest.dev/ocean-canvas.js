/* ========================================================
   HACKFEST '26 — Cinematic Ocean Shader & Theme Engine
   ======================================================== */

(function () {
  'use strict';

  // 1. Create or select canvas
  let canvas = document.getElementById('ocean-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'ocean-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;display:block;';
    document.body.prepend(canvas);
  }

  // State management
  let isNight = localStorage.getItem('hackfest_theme') === 'night';
  if (localStorage.getItem('hackfest_theme') === null) {
    // Default to night mode for pirate theme, or current hour
    const hour = new Date().getHours();
    isNight = hour < 6 || hour >= 18;
  }

  function applyThemeClass(night) {
    if (night) {
      document.body.classList.add('night-mode');
      document.body.classList.remove('day-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.add('day-mode');
      document.body.classList.remove('night-mode');
      document.documentElement.classList.remove('dark');
    }
  }
  applyThemeClass(isNight);

  // 2. Create Floating Theme Toggle Button if not existing
  let themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (!themeToggleBtn) {
    themeToggleBtn = document.createElement('button');
    themeToggleBtn.id = 'theme-toggle-btn';
    themeToggleBtn.setAttribute('aria-label', 'Toggle Day / Night Mode');
    themeToggleBtn.className = 'theme-toggle-fixed';
    themeToggleBtn.innerHTML = `
      <div class="theme-toggle-icon-wrap">
        <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
        <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>
        </svg>
      </div>
    `;
    document.body.appendChild(themeToggleBtn);
  }

  // Style for Theme Toggle
  const toggleStyle = document.createElement('style');
  toggleStyle.textContent = `
    .theme-toggle-fixed {
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      z-index: 999;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      background: rgba(10, 15, 30, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(34, 211, 238, 0.2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease;
    }
    .theme-toggle-fixed:hover {
      transform: scale(1.12);
      background: rgba(15, 23, 42, 0.85);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(34, 211, 238, 0.4);
    }
    .theme-toggle-fixed:active {
      transform: scale(0.92);
    }
    .theme-toggle-icon-wrap {
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .theme-toggle-fixed .sun-icon,
    .theme-toggle-fixed .moon-icon {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .theme-toggle-fixed .sun-icon {
      color: #fbbf24;
      filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
    }
    .theme-toggle-fixed .moon-icon {
      color: #38bdf8;
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
    }
    body.night-mode .sun-icon {
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
    }
    body.night-mode .moon-icon {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    body.day-mode .sun-icon {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    body.day-mode .moon-icon {
      opacity: 0;
      transform: rotate(90deg) scale(0.5);
    }
  `;
  document.head.appendChild(toggleStyle);

  // 3. WebGL Shader Setup
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let targetIsNight = isNight ? 1.0 : 0.0;
  let currentIsNight = targetIsNight;
  let targetProgress = 0.0;
  let currentProgress = 0.0;
  let mouseX = 0.5, mouseY = 0.5;
  let targetMouseX = 0.5, targetMouseY = 0.5;

  themeToggleBtn.addEventListener('click', () => {
    isNight = !isNight;
    targetIsNight = isNight ? 1.0 : 0.0;
    localStorage.setItem('hackfest_theme', isNight ? 'night' : 'day');
    applyThemeClass(isNight);
    const wrap = themeToggleBtn.querySelector('.theme-toggle-icon-wrap');
    if (wrap) wrap.style.transform = `rotate(${isNight ? 180 : 0}deg)`;
  });

  window.addEventListener('scroll', () => {
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrolled = window.scrollY;
    // Map scroll progress smoothly: 0 at top -> 1.0 underwater
    targetProgress = Math.min(1.0, Math.max(0.0, (scrolled - 100) / (window.innerHeight * 0.8)));
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = e.clientY / window.innerHeight;
  }, { passive: true });

  if (!gl) {
    console.warn('WebGL not supported, falling back to Canvas 2D ocean animation');
    initFallback2DCanvas(canvas);
    return;
  }

  // Shaders
  const vsSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vUv.y = 1.0 - vUv.y; // Flip Y for WebGL texture coords
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision mediump float;
    varying vec2 vUv;

    uniform sampler2D tMapMorning;
    uniform sampler2D tMapNight;
    uniform sampler2D tMapUnderwater;
    uniform float uTime;
    uniform float uTransitionProgress;
    uniform float uIsNight;
    uniform vec2 uResolution;
    uniform vec2 uMediaResMorning;
    uniform vec2 uMediaResNight;
    uniform vec2 uMediaResUnderwater;
    uniform vec2 uMouse;

    // Helper for cover UVs
    vec2 getCoverUv(vec2 canvasRes, vec2 mediaRes, vec2 uv) {
      float sRatio = canvasRes.x / canvasRes.y;
      float iRatio = mediaRes.x / mediaRes.y;
      vec2 scale = vec2(1.0);
      if (sRatio > iRatio) {
        scale = vec2(1.0, iRatio / sRatio);
      } else {
        scale = vec2(sRatio / iRatio, 1.0);
      }
      return (uv - vec2(0.5)) * scale + vec2(0.5);
    }

    // Simple pseudo-random noise
    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u*u*(3.0-2.0*u);
      float res = mix(
        mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
        mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
      return res*res;
    }

    void main() {
      vec2 uv = vUv;

      // Mouse ripple effect
      float distToMouse = length(uv - uMouse);
      float mouseRipple = sin(distToMouse * 30.0 - uTime * 4.0) * exp(-distToMouse * 4.0) * 0.015;
      vec2 distortedUv = uv + vec2(mouseRipple);

      // Cover UVs
      vec2 uvMorning    = getCoverUv(uResolution, uMediaResMorning, distortedUv);
      vec2 uvNight      = getCoverUv(uResolution, uMediaResNight, distortedUv);
      vec2 uvUnderwater = getCoverUv(uResolution, uMediaResUnderwater, distortedUv);

      vec4 texMorning    = texture2D(tMapMorning, uvMorning);
      vec4 texNight      = texture2D(tMapNight, uvNight);
      vec4 texUnderwater = texture2D(tMapUnderwater, uvUnderwater);

      // Blend Morning & Night surface based on uIsNight
      vec4 surfaceColor = mix(texMorning, texNight, uIsNight);

      float progress = uTransitionProgress;
      vec4 finalColor;

      if (progress <= 0.0) {
        // Fully above water
        finalColor = surfaceColor;
      } else if (progress >= 1.0) {
        // Fully underwater
        vec4 tex2 = texUnderwater;
        tex2.rgb *= vec3(0.85, 0.95, 1.05); // Underwater teal tint

        if (uIsNight > 0.0) {
          vec3 nightTint = vec3(0.2, 0.35, 0.65);
          tex2.rgb = mix(tex2.rgb, tex2.rgb * nightTint * 1.6, uIsNight * 0.75);
        }

        float depth = smoothstep(0.0, 1.0, uv.y);
        finalColor = tex2;
        finalColor.rgb *= 1.0 - (depth * 0.25);
      } else {
        // In Transition - Wavy water surface line rising from footer to header
        float level = mix(1.1, -0.1, progress);
        float wave = sin(uv.x * 12.0 + uTime * 2.5) * 0.025;
        wave += sin(uv.x * 28.0 - uTime * 4.0) * 0.012;
        wave += noise(vec2(uv.x * 6.0, uTime * 0.8)) * 0.02;

        float surfaceY = level + wave;
        float mixVal = smoothstep(surfaceY - 0.015, surfaceY + 0.015, uv.y);

        // Water surface refraction distortion
        float distortStrength = smoothstep(0.12, 0.0, abs(uv.y - surfaceY)) * 0.04;
        vec2 refractUv = uvUnderwater + vec2(
          sin(uv.y * 40.0 + uTime * 3.0) * distortStrength,
          cos(uv.x * 40.0 + uTime * 3.0) * distortStrength
        );

        vec4 tex1 = surfaceColor;
        vec4 tex2 = texture2D(tMapUnderwater, refractUv);

        tex2.rgb *= vec3(0.85, 0.95, 1.05);
        if (uIsNight > 0.0) {
          vec3 nightTint = vec3(0.2, 0.35, 0.65);
          tex2.rgb = mix(tex2.rgb, tex2.rgb * nightTint * 1.6, uIsNight * 0.75);
        }

        // Add a bright water crest line at surface
        float crest = smoothstep(0.008, 0.0, abs(uv.y - surfaceY));
        vec3 crestColor = mix(vec3(1.0, 0.9, 0.7), vec3(0.4, 0.9, 1.0), uIsNight);

        finalColor = mix(tex1, tex2, clamp(mixVal, 0.0, 1.0));
        finalColor.rgb += crestColor * crest * 0.5;

        // Bottom depth darkness
        float depth = smoothstep(0.0, 1.0, uv.y);
        float darkStrength = smoothstep(0.7, 1.0, progress);
        finalColor.rgb *= 1.0 - (depth * 0.25 * darkStrength);
      }

      gl_FragColor = finalColor;
    }
  `;

  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Quad Geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]), gl.STATIC_DRAW);

  const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPositionLoc);
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uTransitionProgressLoc = gl.getUniformLocation(program, 'uTransitionProgress');
  const uIsNightLoc = gl.getUniformLocation(program, 'uIsNight');
  const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
  const uMediaResMorningLoc = gl.getUniformLocation(program, 'uMediaResMorning');
  const uMediaResNightLoc = gl.getUniformLocation(program, 'uMediaResNight');
  const uMediaResUnderwaterLoc = gl.getUniformLocation(program, 'uMediaResUnderwater');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const tMapMorningLoc = gl.getUniformLocation(program, 'tMapMorning');
  const tMapNightLoc = gl.getUniformLocation(program, 'tMapNight');
  const tMapUnderwaterLoc = gl.getUniformLocation(program, 'tMapUnderwater');

  // Load Textures
  function loadTexture(gl, url, unit, callback) {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Placeholder 1x1 pixel while loading
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 20, 35, 255]));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (callback) callback(img.width, img.height);
    };
    img.src = url;
    return tex;
  }

  // Relative image paths suitable for both site/ and root/
  const isSiteSubdir = window.location.pathname.includes('/site/');
  const basePath = isSiteSubdir ? 'assets/images/backgrounds/' : 'hackfest.dev/images/';

  let morningRes = [1920, 1080];
  let nightRes = [1920, 1080];
  let underwaterRes = [1920, 1080];

  loadTexture(gl, basePath + 'morningnew3.png', 0, (w, h) => { morningRes = [w, h]; });
  loadTexture(gl, basePath + 'night.jpg', 1, (w, h) => { nightRes = [w, h]; });
  loadTexture(gl, basePath + 'underwater.jpg', 2, (w, h) => { underwaterRes = [w, h]; });

  gl.uniform1i(tMapMorningLoc, 0);
  gl.uniform1i(tMapNightLoc, 1);
  gl.uniform1i(tMapUnderwaterLoc, 2);

  // Resize handler
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // Animation Loop
  let startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) * 0.001;

    // Smooth lerping of state variables
    currentIsNight += (targetIsNight - currentIsNight) * 0.06;
    currentProgress += (targetProgress - currentProgress) * 0.08;
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    gl.useProgram(program);

    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform1f(uTransitionProgressLoc, currentProgress);
    gl.uniform1f(uIsNightLoc, currentIsNight);
    gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    gl.uniform2f(uMediaResMorningLoc, morningRes[0], morningRes[1]);
    gl.uniform2f(uMediaResNightLoc, nightRes[0], nightRes[1]);
    gl.uniform2f(uMediaResUnderwaterLoc, underwaterRes[0], underwaterRes[1]);
    gl.uniform2f(uMouseLoc, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Fallback 2D Canvas Renderer if WebGL fails
  function initFallback2DCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgMorning = new Image();
    imgMorning.src = basePath + 'morningnew3.png';
    const imgNight = new Image();
    imgNight.src = basePath + 'night.jpg';

    function resize2d() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize2d);
    resize2d();

    function draw2d() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeImg = isNight ? imgNight : imgMorning;
      if (activeImg.complete) {
        ctx.drawImage(activeImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = isNight ? '#040d1a' : '#1a1005';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(draw2d);
    }
    draw2d();
  }

})();
