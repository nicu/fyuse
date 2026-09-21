(function () {
  "use strict";

  var TILT_INVERT = true;
  var FRAME_COUNT = 51;
  var TILT_RANGE = 30; // degrees of tilt (left/right) that maps to the full frame range
  var EASE = 0.18; // 0..1, higher = snappier animation toward the target frame
  var SMOOTH_TILT = 0.25; // low-pass filter for the noisy gyroscope signal

  var fyuse = document.getElementById("fyuse");
  var debug = document.getElementById("debug");
  var loadingEl = document.querySelector(".loading");
  var tiltButton = document.getElementById("enable-tilt");

  var frames = [];
  var currentFrame = 0; // float, what is being shown (animated)
  var targetFrame = 0; // integer, where we are heading
  var shownIndex = -1;
  var rafId = null;
  var smoothedTilt = null;
  var loaded = 0;

  // ---------- Loading ----------

  function loadFrame(index) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.decoding = "async";
      image.draggable = false;
      image.onload = function () {
        frames[index] = image;
        loaded++;
        if (loadingEl)
          loadingEl.textContent = "Loading " + loaded + "/" + FRAME_COUNT + "…";
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("Failed to load frame " + (index + 1)));
      };
      image.src = "frames/Frame" + (index + 1) + ".png";
    });
  }

  // ---------- Rendering ----------

  function showFrame(index) {
    if (index === shownIndex) return;
    if (shownIndex >= 0) frames[shownIndex].classList.remove("visible");
    frames[index].classList.add("visible");
    shownIndex = index;
  }

  function clampIndex(i) {
    return Math.max(0, Math.min(FRAME_COUNT - 1, i));
  }

  function setTarget(index) {
    targetFrame = clampIndex(Math.round(index));
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    var diff = targetFrame - currentFrame;

    if (Math.abs(diff) < 0.05) {
      currentFrame = targetFrame;
      showFrame(targetFrame);
      return; // settled; loop stops until next input
    }

    currentFrame += diff * EASE;
    showFrame(clampIndex(Math.round(currentFrame)));
    rafId = requestAnimationFrame(tick);
  }

  // ---------- Pointer (mouse + touch + pen) ----------

  function frameFromPointer(evt) {
    var rect = fyuse.getBoundingClientRect();
    if (rect.width === 0) return;
    var x = 1 - (evt.clientX - rect.left) / rect.width;
    setTarget(x * (FRAME_COUNT - 1));
  }

  function initPointer() {
    var dragging = false;

    fyuse.addEventListener("pointerdown", function (evt) {
      dragging = true;
      fyuse.setPointerCapture(evt.pointerId);
      frameFromPointer(evt);
    });

    fyuse.addEventListener("pointermove", function (evt) {
      // Mouse: react on hover. Touch/pen: only while pressing.
      if (evt.pointerType === "mouse" || dragging) frameFromPointer(evt);
    });

    function endDrag() {
      dragging = false;
    }
    fyuse.addEventListener("pointerup", endDrag);
    fyuse.addEventListener("pointercancel", endDrag);
  }

  // ---------- Device orientation (tilt) ----------

  function handleOrientation(event) {
    var tilt;
    var orientation =
      (screen.orientation && screen.orientation.angle) ||
      window.orientation ||
      0;

    // gamma = left/right tilt in portrait; in landscape the axes swap.
    if (orientation === 90) tilt = event.beta;
    else if (orientation === -90 || orientation === 270) tilt = -event.beta;
    else tilt = event.gamma;

    if (tilt === null || tilt === undefined || frames.length < FRAME_COUNT)
      return;

    smoothedTilt =
      smoothedTilt === null
        ? tilt
        : smoothedTilt + (tilt - smoothedTilt) * SMOOTH_TILT;

    if (TILT_INVERT) smoothedTilt = -smoothedTilt;

    var t = (smoothedTilt + TILT_RANGE) / (2 * TILT_RANGE); // -RANGE..+RANGE -> 0..1
    t = Math.max(0, Math.min(1, t));
    setTarget(t * (FRAME_COUNT - 1));

    debug.textContent =
      "Tilt: " + smoothedTilt.toFixed(1) + "°, frame: " + targetFrame;
  }

  function startOrientation() {
    window.addEventListener("deviceorientation", handleOrientation, true);
    tiltButton.style.display = "none";
  }

  function initTilt() {
    if (!("DeviceOrientationEvent" in window)) return;

    // iOS 13+ requires an explicit permission request from a user gesture.
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      tiltButton.style.display = "block";
      tiltButton.addEventListener("click", function () {
        DeviceOrientationEvent.requestPermission()
          .then(function (state) {
            if (state === "granted") startOrientation();
            else
              debug.textContent =
                "Tilt permission denied. Drag the image instead.";
          })
          .catch(function (err) {
            debug.textContent = "Tilt unavailable: " + err.message;
          });
      });
    } else {
      startOrientation();
    }
  }

  // ---------- Init ----------

  function initFyuse() {
    if (loadingEl) loadingEl.remove();

    // Size the container from the first frame so it has real height
    // (absolutely positioned children give it none on their own).
    var first = frames[0];
    fyuse.style.aspectRatio = first.naturalWidth + " / " + first.naturalHeight;

    frames.forEach(function (img) {
      fyuse.appendChild(img);
    });

    currentFrame = targetFrame = Math.floor(FRAME_COUNT / 2);
    showFrame(targetFrame);

    initPointer();
    initTilt();
  }

  var promises = [];
  for (var i = 0; i < FRAME_COUNT; i++) promises.push(loadFrame(i));

  Promise.all(promises)
    .then(initFyuse)
    .catch(function (err) {
      console.error("Error initializing fyuse:", err);
      if (loadingEl)
        loadingEl.textContent =
          err.message +
          " — check that frames/Frame1.png … Frame" +
          FRAME_COUNT +
          ".png exist.";
    });
})();
