
import { H as Hls } from "./hls-vendor.js";

export function setupPlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var started = false;
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;
    button.classList.add("hidden");
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          video.src = source;
          video.play().catch(function () {});
        }
      });
      return;
    }
    video.src = source;
    video.play().catch(function () {});
  }

  button.addEventListener("click", attach);
  video.addEventListener("click", function () {
    if (!started) {
      attach();
    }
  });
}
