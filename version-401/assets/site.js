(function () {
    function select(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = select('[data-menu-button]');
        var panel = select('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        selectAll('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = select('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                var target = form.getAttribute('data-search-url') || 'search.html';
                if (value) {
                    window.location.href = target + '?q=' + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHero() {
        var carousel = select('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function normalize(text) {
        return (text || '').toString().toLowerCase();
    }

    function initCardFilters() {
        selectAll('[data-filter-input]').forEach(function (input) {
            var target = input.getAttribute('data-target');
            var grid = target ? select(target) : null;
            var sortSelect = target ? select('[data-sort-target="' + target + '"]') : null;
            if (!grid) {
                return;
            }
            var cards = selectAll('[data-title]', grid);
            function apply() {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var source = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year'));
                    card.style.display = source.indexOf(keyword) >= 0 ? '' : 'none';
                });
            }
            function sortCards() {
                if (!sortSelect) {
                    return;
                }
                var mode = sortSelect.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === 'year') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    if (mode === 'title') {
                        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
                    }
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
            input.addEventListener('input', apply);
            if (sortSelect) {
                sortSelect.addEventListener('change', function () {
                    sortCards();
                    apply();
                });
            }
            sortCards();
        });
    }

    function escapeHtml(value) {
        return (value || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function initSearchPage() {
        var container = select('[data-search-results]');
        if (!container || !window.SEARCH_MOVIES) {
            return;
        }
        var input = select('[data-search-page-input]');
        var query = getSearchQuery();
        if (input) {
            input.value = query;
        }
        function render(keyword) {
            var key = normalize(keyword);
            var results = window.SEARCH_MOVIES.filter(function (item) {
                var source = normalize(item.title + ' ' + item.desc + ' ' + item.category + ' ' + item.region + ' ' + item.year + ' ' + item.tags);
                return !key || source.indexOf(key) >= 0;
            }).slice(0, 160);
            if (!results.length) {
                container.innerHTML = '<div class="search-empty">未找到匹配内容，换一个关键词再试试。</div>';
                return;
            }
            container.innerHTML = results.map(function (item) {
                return '<article class="movie-card">'
                    + '<a class="poster-link" href="' + escapeHtml(item.url) + '">'
                    + '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
                    + '<span class="duration">' + escapeHtml(item.duration) + '</span>'
                    + '<span class="card-play">▶</span>'
                    + '</a>'
                    + '<div class="movie-card-body">'
                    + '<div class="card-meta"><a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>'
                    + '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>'
                    + '<p>' + escapeHtml(item.desc) + '</p>'
                    + '<div class="card-foot"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.views) + '热度</span></div>'
                    + '</div>'
                    + '</article>';
            }).join('');
        }
        render(query);
        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }

    window.attachMoviePlayer = function (source) {
        var video = select('[data-player]');
        var cover = select('[data-player-cover]');
        var playButton = select('[data-player-play]');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var shouldPlay = false;
        var hlsInstance = null;
        function attemptPlay() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    if (shouldPlay) {
                        attemptPlay();
                    }
                }, { once: true });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (shouldPlay) {
                        attemptPlay();
                    }
                });
                return;
            }
            video.src = source;
        }
        function start(event) {
            if (event) {
                event.preventDefault();
            }
            shouldPlay = true;
            loadVideo();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            attemptPlay();
        }
        function toggleFromVideo() {
            if (video.paused) {
                start();
            }
        }
        if (playButton) {
            playButton.addEventListener('click', start);
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', toggleFromVideo);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initCardFilters();
        initSearchPage();
    });
})();
