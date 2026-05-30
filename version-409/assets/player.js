(function () {
    function setupPlayer(player) {
        var video = player.querySelector('[data-player-video]');
        var playButton = player.querySelector('[data-play-button]');
        var status = player.querySelector('[data-player-status]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('点击视频区域继续播放');
                    player.classList.remove('playing');
                });
            }
        }

        function initHls() {
            if (initialized) {
                playVideo();
                return;
            }
            initialized = true;
            player.classList.add('ready');
            setStatus('正在加载播放源');
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源加载完成');
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络波动，正在重新加载');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体解码恢复中');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('播放源暂时无法打开');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('播放源加载完成');
                    playVideo();
                }, { once: true });
                video.load();
            } else {
                setStatus('当前浏览器不支持 HLS 播放');
            }
        }

        if (playButton) {
            playButton.addEventListener('click', initHls);
        }
        video.addEventListener('click', function () {
            if (!initialized || video.paused) {
                initHls();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('playing');
            setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('playing');
            if (initialized) {
                setStatus('已暂停');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
