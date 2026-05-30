(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 0) {
      var current = 0;
      var setSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setSlide(i);
        });
      });
      setInterval(function () {
        setSlide(current + 1);
      }, 5600);
    }

    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    var searchInput = document.querySelector("[data-filter-search]");
    if (searchInput && urlQuery) {
      searchInput.value = urlQuery;
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-search], [data-filter-year], [data-filter-region], [data-filter-category], [data-sort]"));
    if (filterInputs.length > 0) {
      var applyFilters = function () {
        var query = (document.querySelector("[data-filter-search]") || {}).value || "";
        var year = (document.querySelector("[data-filter-year]") || {}).value || "";
        var region = (document.querySelector("[data-filter-region]") || {}).value || "";
        var category = (document.querySelector("[data-filter-category]") || {}).value || "";
        var sortValue = (document.querySelector("[data-sort]") || {}).value || "default";
        query = query.trim().toLowerCase();

        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var visible = 0;
        cards.forEach(function (card) {
          var search = (card.dataset.search || "").toLowerCase();
          var ok = true;
          if (query && search.indexOf(query) === -1) {
            ok = false;
          }
          if (year && card.dataset.year !== year) {
            ok = false;
          }
          if (region && card.dataset.region !== region) {
            ok = false;
          }
          if (category && card.dataset.category !== category) {
            ok = false;
          }
          card.classList.toggle("hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        var containers = Array.prototype.slice.call(document.querySelectorAll("[data-sortable]"));
        containers.forEach(function (container) {
          var localCards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
          if (sortValue === "views") {
            localCards.sort(function (a, b) {
              return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            });
          } else if (sortValue === "year") {
            localCards.sort(function (a, b) {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
          } else if (sortValue === "title") {
            localCards.sort(function (a, b) {
              return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
            });
          } else {
            localCards.sort(function (a, b) {
              return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
            });
          }
          localCards.forEach(function (card) {
            container.appendChild(card);
          });
        });

        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      filterInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
        input.addEventListener("change", applyFilters);
      });
      applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var errorBox = shell.querySelector(".player-error");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;

      var showError = function () {
        if (errorBox) {
          errorBox.textContent = "当前视频暂时无法播放，请稍后重试。";
          errorBox.classList.add("is-visible");
        }
      };

      var loadVideo = function () {
        if (!video || !stream) {
          showError();
          return;
        }
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                showError();
              }
            });
          } else {
            showError();
            return;
          }
        }
        shell.classList.add("is-started");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.muted = true;
            video.play().catch(showError);
          });
        }
      };

      if (cover) {
        cover.addEventListener("click", loadVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            loadVideo();
          } else {
            video.pause();
          }
        });
      }
    });
  });
}());
