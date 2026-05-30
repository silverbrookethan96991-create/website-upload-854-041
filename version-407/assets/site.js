(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    filterPanels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll('[data-search-item]'));
      var input = panel.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      function fillSelect(select) {
        var key = select.getAttribute('data-filter-select');
        var values = [];
        items.forEach(function (item) {
          var value = item.getAttribute('data-' + key) || '';
          if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        values.sort().forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      selects.forEach(fillSelect);
      if (query && input) {
        input.value = query;
      }

      function apply() {
        var words = input ? input.value.trim().toLowerCase() : '';
        items.forEach(function (item) {
          var haystack = item.getAttribute('data-search') || '';
          var matched = !words || haystack.indexOf(words) !== -1;
          selects.forEach(function (select) {
            var key = select.getAttribute('data-filter-select');
            var value = select.value;
            if (value && item.getAttribute('data-' + key) !== value) {
              matched = false;
            }
          });
          item.classList.toggle('hidden', !matched);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  });
})();
