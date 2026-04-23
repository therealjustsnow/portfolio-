(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const scrollTopButton = document.querySelector("[data-scroll-top]");

  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      mobileMenu.hidden = true;
    };

    const openMenu = () => {
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close navigation menu");
      mobileMenu.hidden = false;
    };

    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenu.hidden) return;
      if (mobileMenu.contains(target) || menuButton.contains(target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  if (scrollTopButton) {
    const toggleScrollTop = () => {
      scrollTopButton.classList.toggle("is-visible", window.scrollY > 260);
    };

    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    toggleScrollTop();
  }

  const page = document.body.dataset.page;
  if (page !== "commands.html") return;

  const search = document.getElementById("command-search");
  const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
  const sections = Array.from(document.querySelectorAll(".command-section"));
  const cards = Array.from(document.querySelectorAll(".command-card"));
  let activeFilter = "All";

  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();
    cards.forEach((card) => {
      const cluster = card.dataset.cluster || "";
      const haystack = card.dataset.search || "";
      const matchesFilter = activeFilter === "All" || cluster === activeFilter;
      const matchesQuery = !query || haystack.includes(query);
      card.classList.toggle("is-hidden", !(matchesFilter && matchesQuery));
    });

    sections.forEach((section) => {
      const visible = section.querySelector(".command-card:not(.is-hidden)");
      section.classList.toggle("is-hidden", !visible);
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter || "All";
      chips.forEach((item) => item.classList.toggle("is-active", item === chip));
      apply();
    });
  });

  search?.addEventListener("input", apply);
  apply();
})();
