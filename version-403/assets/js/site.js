(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-local-search]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var active = "all";

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return (params.get("q") || "").trim();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = active === "all" || haystack.indexOf(active) !== -1;
        var show = matchQuery && matchFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      var initial = getQueryFromUrl();
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = (chip.getAttribute("data-filter-value") || "all").toLowerCase();
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var layer = player.querySelector("[data-play-layer]");
    var button = player.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-play");
    var started = false;
    var hls = null;

    function begin() {
      if (!stream) {
        return;
      }
      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
          video.load();
        }
        started = true;
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    if (layer) {
      layer.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
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
    initSearchForms();
    initFilters();
    initPlayer();
  });
})();
