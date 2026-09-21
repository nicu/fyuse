var fyuse = document.getElementById('fyuse');
var debug = document.getElementById('debug');
var frames = [];
var WIDTH = 272;
var frameCount = 0;

function loadFrame(index) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.src = 'frames/Frame' + (index + 1) + '.png';
    image.onload = resolve;
    frames[index] = image;

    fyuse.appendChild(image);
  });
}

var initFyuse = function() {
  document.querySelector('.loading').remove();

  var frameCount = frames.length;
  var frameWidth = WIDTH / frameCount;

  if (frames.length > 0) {
    frames[0].classList.add('visible');
  }

  fyuse.addEventListener('mousemove', function(evt) {
    var prev = document.querySelector('#fyuse .visible');
    var frameIndex = Math.round(evt.offsetX / frameWidth);
    frameIndex = Math.max(0, Math.min(frames.length - 1, frameIndex));

    if (frames[frameIndex] && frames[frameIndex] !== prev) {
      if (prev) prev.classList.remove('visible');
      frames[frameIndex].classList.add('visible');
    }
  }, false);
};

window.addEventListener("deviceorientation", function(event) {
  var xValue = event.gamma;
  var frameCount = frames.length;
  if (frameCount === 0) return;

  var frameIndex = Math.round(((xValue + 90) / 180) * (frameCount - 1));
  frameIndex = Math.max(0, Math.min(frameCount - 1, frameIndex));

  debug.innerHTML = "Gamma: " + xValue.toFixed(2) + ", Index: " + frameIndex;

  var prev = document.querySelector('#fyuse .visible');
  if (frames[frameIndex] && frames[frameIndex] !== prev) {
    if (prev) prev.classList.remove('visible');
    frames[frameIndex].classList.add('visible');
  }
}, true);

var promises = [];
for (var i = 0; i < 51; i++) {
  promises.push(loadFrame(i));
}

Promise.all(promises).then(initFyuse);
