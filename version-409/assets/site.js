(function () {
    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function start() {
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
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function setupFiltering() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector('[data-search-input]');
            var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
            var grid = scope.querySelector('[data-card-grid]') || document;
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-empty-state]');
            var activeType = 'all';

            function normalize(value) {
                return String(value || '').toLowerCase().replace(/\s+/g, '');
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var cardType = card.getAttribute('data-type') || '';
                    var typeMatch = activeType === 'all' || cardType.indexOf(activeType) !== -1;
                    var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
                    var visible = typeMatch && keywordMatch;
                    card.classList.toggle('hidden-by-filter', !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    activeType = button.getAttribute('data-filter-value') || 'all';
                    apply();
                });
            });
            if (buttons[0]) {
                buttons[0].classList.add('active');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHeroSlider();
        setupFiltering();
    });
})();
