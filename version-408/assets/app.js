
(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
    let active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  const lists = Array.from(document.querySelectorAll(".searchable-list"));

  lists.forEach(function (list) {
    const scope = list.closest("main") || document;
    const input = scope.querySelector(".filter-input");
    const year = scope.querySelector(".filter-year");
    const category = scope.querySelector(".filter-category");
    const cards = Array.from(list.querySelectorAll(".movie-card"));

    function applyFilter() {
      const q = input ? input.value.trim().toLowerCase() : "";
      const selectedYear = year ? year.value : "";
      const selectedCategory = category ? category.value : "";

      cards.forEach(function (card) {
        const text = card.getAttribute("data-text") || "";
        const title = card.getAttribute("data-title") || "";
        const cardYear = card.getAttribute("data-year") || "";
        const cardCategory = card.getAttribute("data-category") || "";
        const matchQuery = !q || text.includes(q) || title.includes(q);
        const matchYear = !selectedYear || cardYear === selectedYear;
        const matchCategory = !selectedCategory || cardCategory === selectedCategory;
        card.hidden = !(matchQuery && matchYear && matchCategory);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (year) {
      year.addEventListener("change", applyFilter);
    }
    if (category) {
      category.addEventListener("change", applyFilter);
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && input) {
      input.value = q;
      applyFilter();
    }
  });
})();
