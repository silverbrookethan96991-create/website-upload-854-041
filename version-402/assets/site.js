(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("is-open", !expanded);
      toggle.textContent = expanded ? "☰" : "×";
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var scope = document.querySelector(".filter-scope");
    var panel = document.querySelector(".movie-filter");
    if (!scope || !panel) {
      return;
    }
    var query = panel.querySelector("[data-filter-query]");
    var category = panel.querySelector("[data-filter-category]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (query) {
      query.value = initialQuery;
    }

    function includesType(cardType, selected) {
      if (!selected) {
        return true;
      }
      return cardType.indexOf(selected) !== -1;
    }

    function apply() {
      var q = query ? query.value.trim().toLowerCase() : "";
      var c = category ? category.value : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (c && cardCategory !== c) {
          matched = false;
        }
        if (y && cardYear !== y) {
          matched = false;
        }
        if (!includesType(cardType, t)) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [query, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayer() {
    var player = document.querySelector("[data-video-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-play]");
    var message = player.querySelector("[data-player-message]");
    var src = player.getAttribute("data-stream");
    var hls = null;
    var initialized = false;
    var pendingPlay = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    function bindSource() {
      if (initialized || !video || !src) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          if (pendingPlay) {
            playVideo();
          }
        });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(src);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            playVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("视频加载中，请稍后重试");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("视频恢复中，请稍后");
            hls.recoverMediaError();
          } else {
            setMessage("该视频暂时无法播放");
          }
        });
      } else {
        setMessage("该视频暂时无法播放");
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }
      bindSource();
      if (video.paused) {
        pendingPlay = true;
        player.classList.add("is-playing");
        playVideo();
      } else {
        pendingPlay = false;
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", togglePlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        togglePlay();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      pendingPlay = false;
      player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
