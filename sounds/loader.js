let Promise = require('bluebird');
let AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();

module.exports = (file) => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', file, true);
    xhr.send();
  })
  .then(res => {
    return new Promise((resolve, reject) => {
      context.decodeAudioData(res, resolve);
    })
    .then(buffer => {
      return {
        play: _ => {
          let source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.start(context.currentTime);
        }
      };
    });
  });
}
