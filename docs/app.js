(() => {
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
