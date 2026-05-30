
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(card) {
    return [
      card.dataset.title || "",
      card.dataset.year || "",
      card.dataset.region || "",
      card.dataset.genre || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    });
    if (index < 0) {
      index = 0;
    }
    function show(nextIndex) {
      slides[index].classList.remove("active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("active");
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".movie-list"));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector(".filter-input");
    var select = document.querySelector(".sort-select");
    var cards = lists.reduce(function (all, list) {
      return all.concat(Array.prototype.slice.call(list.children));
    }, []);
    cards.forEach(function (card, i) {
      card.dataset.order = String(i);
    });
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        card.classList.toggle("hidden-card", q && textOf(card).indexOf(q) === -1);
      });
      if (!select) {
        return;
      }
      lists.forEach(function (list) {
        var local = Array.prototype.slice.call(list.children);
        local.sort(function (a, b) {
          if (select.value === "year") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (select.value === "title") {
            return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
          }
          if (select.value === "views") {
            var av = Number((a.textContent.match(/([0-9.]+)万?热度/) || [0, 0])[1]);
            var bv = Number((b.textContent.match(/([0-9.]+)万?热度/) || [0, 0])[1]);
            return bv - av;
          }
          return Number(a.dataset.order) - Number(b.dataset.order);
        }).forEach(function (card) {
          list.appendChild(card);
        });
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function initSearchPage() {
    var target = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    if (!target || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }
    var keyword = q.trim().toLowerCase();
    var data = window.MOVIES.filter(function (movie) {
      if (!keyword) {
        return true;
      }
      return [movie.title, movie.region, movie.year, movie.genre, movie.category, movie.tags].join(" ").toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    target.innerHTML = data.map(function (movie) {
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster\" href=\"" + movie.href + "\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\">",
        "<span class=\"poster-badge\">" + movie.category + "</span>",
        "<span class=\"poster-time\">" + movie.duration + "</span>",
        "</a>",
        "<div class=\"card-body\">",
        "<h3><a href=\"" + movie.href + "\">" + movie.title + "</a></h3>",
        "<p>" + movie.desc + "</p>",
        "<div class=\"card-meta\"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.genre + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
