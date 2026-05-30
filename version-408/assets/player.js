
(function () {
  const panels = Array.from(document.querySelectorAll(".player-panel"));

  panels.forEach(function (panel) {
    const video = panel.querySelector("video");
    const button = panel.querySelector(".player-start");
    let loaded = false;
    let hlsInstance = null;

    function attachSource() {
      const source = panel.getAttribute("data-video");

      if (!source || !video) {
        return;
      }

      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startPlayback() {
      attachSource();
      panel.classList.add("is-playing");
      video.controls = true;
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        panel.classList.add("is-playing");
      });
      video.addEventListener("error", function () {
        if (hlsInstance && window.Hls) {
          hlsInstance.destroy();
          hlsInstance = null;
          loaded = false;
        }
      });
    }
  });
})();
