var SAMPLE_TIME = 0.1;

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var fyuse = document.getElementById('fyuse');

var initFyuse = function() {
  document.querySelector('.loading').remove();
  document.querySelector('canvas').remove();

  var frames = document.querySelectorAll('#fyuse img');
  var frameCount = frames.length;
  var frameWidth = video.videoWidth / frameCount;

  document.querySelector('#fyuse img').classList.add('visible');

  fyuse.addEventListener('mousemove', function(evt) {
    var prev = document.querySelector('#fyuse .visible');
    var frameIndex = Math.round(evt.clientX / frameWidth);

    if ((frames[frameIndex] !== prev) && frames[frameIndex]) {
      prev && prev.classList.remove('visible');
      frames[frameIndex] && frames[frameIndex].classList.add('visible');
    }
  }, false);
};

var captureFrame = function() {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  var dataUrl = canvas.toDataURL();

  var img = document.createElement('img');
  img.setAttribute('src', dataUrl);

  fyuse.appendChild(img);
};

video.addEventListener('loadeddata', function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.style.width = video.videoWidth;
  canvas.style.height = video.videoHeight;

  captureFrame();

  video.currentTime += SAMPLE_TIME;
}, false);

video.addEventListener('seeked', function() {
  captureFrame();

  var currentTime = video.currentTime;
  currentTime += SAMPLE_TIME;

  if (currentTime <= video.duration) {
    video.currentTime = currentTime;
  }
  else {
    initFyuse();
  }
});