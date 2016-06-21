const SAMPLE_TIME = 0.1;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const fyuse = document.getElementById('fyuse');

let initFyuse = () => {
  document.querySelector('.loading').remove();
  
  let frames = document.querySelectorAll('#fyuse img');
  let frameCount = frames.length;
  let frameWidth = video.videoWidth / frameCount;
  
  document.querySelector('#fyuse img').classList.add('visible');
  
  fyuse.addEventListener('mousemove', (evt) => {
    let prev = document.querySelector('#fyuse .visible');
    let frameIndex = Math.round(evt.clientX / frameWidth);
    
    if ((frames[frameIndex] !== prev) && frames[frameIndex]) {
      prev && prev.classList.remove('visible');
      frames[frameIndex] && frames[frameIndex].classList.add('visible');
    }
  }, false);
};

let captureFrame = () => {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let dataUrl = canvas.toDataURL();
  
  let img = document.createElement('img');
  img.setAttribute('src', dataUrl);
  
  fyuse.appendChild(img);
}

video.addEventListener('loadeddata', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.style.width = video.videoWidth;
  canvas.style.height = video.videoHeight;
  
  captureFrame();
  
  video.currentTime += SAMPLE_TIME;
}, false);

video.addEventListener('seeked', () => {
  captureFrame();
  
  let currentTime = video.currentTime;
  currentTime += SAMPLE_TIME;
  
  if (currentTime <= video.duration) {
    video.currentTime = currentTime;
  }
  else {
    initFyuse();
  }
});