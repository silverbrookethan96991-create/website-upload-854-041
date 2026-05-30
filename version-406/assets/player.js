(function () {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playerCover');
    if (!video || !cover) {
        return;
    }

    var src = video.getAttribute('data-v');
    var loaded = false;

    function loadStream() {
        if (loaded || !src) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function startPlay() {
        loadStream();
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    cover.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlay();
        }
    });
})();
