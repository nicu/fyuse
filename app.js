var fyuse = document.getElementById('fyuse');
var frames = [];
var WIDTH = 272;

function loadFrame(index) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.src = 'frames/Frame' + (index+1) + '.png';
    image.onload = resolve;
    frames[index] = image;

    fyuse.appendChild(image);
  });
}

var initFyuse = function() {
  document.querySelector('.loading').remove();

  var frameCount = frames.length;
  var frameWidth = WIDTH / frameCount;

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

var promises = [];
for (var i = 0; i < 51; i++) {
  promises.push(loadFrame(i));
}

Promise.all(promises).then(initFyuse);