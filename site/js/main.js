(() => {
  "use strict";

  // Marca página carregada (útil pra CSS dependente de JS)
  window.addEventListener("load", () => {
    document.documentElement.classList.add("js");
    document.body.classList.add("loaded");
  });

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ===============================
     Rolagem suave para âncoras
     =============================== */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ===============================
     Header com estado ao rolar
     =============================== */
  const header = $("header") || $(".header") || $("#header");

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ===============================
     Menu mobile / hamburger
     =============================== */
  const menuBtn =
    $('[data-menu-toggle]') ||
    $(".menu-toggle") ||
    $("#menu-toggle") ||
    $(".hamburger") ||
    $(".btn-menu");

  const nav =
    $('[data-menu]') ||
    $("nav") ||
    $(".nav") ||
    $("#nav") ||
    $(".navbar");

  const OPEN_CLASS = "menu-open";
  const ACTIVE_CLASS = "active";

  const isOpen = () => document.body.classList.contains(OPEN_CLASS);

  const openMenu = () => {
    document.body.classList.add(OPEN_CLASS);
    nav && nav.classList.add(ACTIVE_CLASS);
    menuBtn && menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    document.body.classList.remove(OPEN_CLASS);
    nav && nav.classList.remove(ACTIVE_CLASS);
    menuBtn && menuBtn.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMenu();
    });
  }

  // Fecha menu ao clicar em link
  if (nav) {
    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && isOpen()) closeMenu();
    });
  }

  // Fecha menu com ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Fecha menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    if (
      (nav && nav.contains(e.target)) ||
      (menuBtn && menuBtn.contains(e.target))
    )
      return;
    closeMenu();
  });

  /* ===============================
     Link ativo no menu
     =============================== */
  const currentPage = location.pathname.split("/").pop() || "index.html";

  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    const clean = href.split("#")[0].split("?")[0];
    if (clean === currentPage) a.classList.add("is-current");
  });
})();
