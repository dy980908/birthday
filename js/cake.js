(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const topButton = document.getElementById("topButton");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const toggleTopButton = () => {
    if (!topButton) return;
    topButton.classList.toggle("is-visible", window.scrollY > 520);
  };

  window.addEventListener("scroll", toggleTopButton, { passive: true });
  toggleTopButton();

  topButton?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
})();
