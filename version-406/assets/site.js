(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');
    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;

    function showHero(index) {
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

    if (slides.length) {
        if (prev) {
            prev.addEventListener('click', function () {
                showHero(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showHero(current + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        setInterval(function () {
            showHero(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
        if (!list) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var ok = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput || yearFilter) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (filterInput && query) {
            filterInput.value = query;
        }
        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
        applyFilter();
    }
})();
