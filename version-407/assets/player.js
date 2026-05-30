(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      var status = shell.querySelector('[data-status]');
      var source = shell.getAttribute('data-src');
      var hls = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function initialize() {
        if (initialized || !video || !source) {
          return;
        }
        initialized = true;
        setStatus('正在加载播放源...');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络错误，正在重新加载...');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体错误，正在恢复播放...');
              hls.recoverMediaError();
            } else {
              setStatus('播放源加载失败，请稍后重试');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('');
          });
        } else {
          setStatus('当前浏览器不支持 HLS 播放');
        }
      }

      function play() {
        initialize();
        if (!video) {
          return;
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            setStatus('请再次点击播放');
          });
        }
      }

      function toggle() {
        if (!video) {
          return;
        }
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
          shell.classList.add('playing');
          setStatus('');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
