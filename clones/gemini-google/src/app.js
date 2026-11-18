/* Shared shell + interactions for every page.
   One place for the sidebar, the top bar, the settings popover and the menus;
   pages only ship their own main content. */

(function () {
  "use strict";

  var C = window.CONTENT;
  var page = document.body.dataset.page || "home";

  /* ------------------------------------------------------------- icon set */
  var ICONS = {
    pen: '<path d="M11 3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-5"/><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L20 21"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    video: '<rect x="3" y="6" width="12" height="12" rx="3"/><path d="M15 11l6-3v8l-6-3z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    note: '<path d="M6 3h8l4 4v14H6z"/><path d="M9 11h6M9 15h4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    filter: '<path d="M4 6h16l-6 7v6l-4-2v-4z"/>',
    dots: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    chev: '<path d="M6 9.5l6 5.5 6-5.5"/>',
    chevR: '<path d="M9.5 6l5.5 6-5.5 6"/>',
    down: '<path d="M12 3v11"/><path d="M8 10.5l4 4 4-4"/><path d="M4 18v1.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V18"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.2a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1.1z"/>',
    sparkles: '<path d="M12 3c.5 3.4 1.9 5 4.7 5.6-2.8.6-4.2 2.2-4.7 5.6-.5-3.4-1.9-5-4.7-5.6C10.1 8 11.5 6.4 12 3z" fill="currentColor" stroke="none"/><path d="M18 14c.3 1.9 1 2.8 2.6 3.1-1.6.3-2.3 1.2-2.6 3.1-.3-1.9-1-2.8-2.6-3.1 1.6-.3 2.3-1.2 2.6-3.1z" fill="currentColor" stroke="none"/>',
    corner: '<path d="M9 6H6a2 2 0 0 0-2 2v9"/><path d="M6 9l3-3M6 9l3 3"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 5v14M16 5v14M3 9.5h5M3 14.5h5M16 9.5h5M16 14.5h5"/>',
    paperclip: '<path d="M20 11.5l-7.6 7.6a5 5 0 0 1-7-7l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.6-2.6l7-7"/>',
    drive: '<path d="M9 3h6l6 11h-6z"/><path d="M9 3L3 14l3 5h6L9 3z" /><path d="M6 19h12l-3-5H9z"/>',
    music: '<circle cx="7" cy="17" r="2.6"/><circle cx="18" cy="15" r="2.6"/><path d="M9.6 17V7l11-2v10"/>',
    canvas: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 15l3-4 2.5 3L16 11l2 4z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    bulb: '<path d="M9 17h6"/><path d="M10 20h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 5.5A2.5 2.5 0 0 0 13.5 3H6a3 3 0 0 0-3 3v7.5A2.5 2.5 0 0 0 5.5 16"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/>',
    thumbUp: '<path d="M7 11v9H4v-9z"/><path d="M7 11l4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/>',
    thumbDown: '<path d="M17 13V4h3v9z"/><path d="M17 13l-4 8a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 4H17"/>',
    share: '<path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    upload: '<path d="M12 17V5"/><path d="M8 9l4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
    cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M3 4h2l2.4 10.5A2 2 0 0 0 9.4 16h8.4a2 2 0 0 0 2-1.6L21 8H6"/>',
    gem: '<path d="M12 3l7 5-7 13-7-13z"/><path d="M5 8h14"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11 7"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7L13 17"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    star: '<path d="M12 3l2.6 6.2 6.4.5-4.9 4.2 1.5 6.3L12 16.8 6.4 20.2l1.5-6.3L3 9.7l6.4-.5z"/>',
    window: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/>',
    rss: '<circle cx="6" cy="18" r="1.6"/><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 5a15 15 0 0 1 15 15"/>',
    feedback: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 0 1 8-11h2a8 8 0 0 1 8 6z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.7"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>'
  };

  function icon(name, size, cls) {
    var path = ICONS[name] || ICONS.dots;
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" width="' + (size || 20) +
      '" height="' + (size || 20) + '" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
  }

  /* ----------------------------------------------------------------- shell */
  function navItem(item, active) {
    return '<a class="side-row' + (active ? " is-current" : "") + '" href="' + item.href + '">' +
      '<span class="side-row__icon">' + icon(item.icon) + "</span>" +
      '<span class="side-row__label">' + item.label + "</span></a>";
  }

  function renderShell() {
    var host = document.getElementById("shell");
    if (!host) return;

    var history = C.history.items.map(function (h) {
      return '<a class="history-row" href="chat.html">' +
        '<span class="history-row__label">' + h.label + "</span>" +
        '<button class="icon-btn history-row__menu" type="button" aria-label="More options for ' +
        h.label + '">' + icon("dots", 18) + "</button></a>";
    }).join("");

    host.innerHTML =
      '<aside class="sidebar" id="sidebar" aria-label="Side navigation">' +
        '<div class="sidebar__top">' +
          '<a class="brand" href="index.html" aria-label="Home">' +
            '<span class="sparkle brand__mark" aria-hidden="true"></span>' +
            '<span class="brand__word">' + C.brand + "</span></a>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Search chats" id="nav-search">' + icon("search", 20) + "</button>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Close sidebar" id="nav-collapse">' + icon("panel", 20) + "</button>" +
          '<button class="icon-btn sidebar__close" type="button" aria-label="Close sidebar" id="nav-close">' + icon("close", 24) + "</button>" +
        "</div>" +
        '<nav class="nav">' + C.nav.map(function (n) { return navItem(n, n.id === page); }).join("") + "</nav>" +
        '<div class="side-section">' + C.notebooks.title + "</div>" +
        '<div class="nav nav--tight">' + C.notebooks.items.map(function (n) { return navItem(n, false); }).join("") + "</div>" +
        '<div class="side-section side-section--row"><span>' + C.history.title + "</span>" +
          '<button class="icon-btn icon-btn--xs" type="button" aria-label="Filter">' + icon("filter", 16) + "</button></div>" +
        '<div class="history">' + history + "</div>" +
        '<div class="side-account">' +
          '<button class="account-btn" type="button" id="account-open">' +
            '<span class="avatar">' + C.account.initials + "</span>" +
            '<span class="account-btn__name">' + C.account.name + "</span></button>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Settings" id="settings-open">' + icon("gear", 20) + "</button>" +
        "</div>" +
      "</aside>" +
      '<div class="scrim" id="scrim" hidden></div>' +
      '<button class="rail-open icon-btn" type="button" id="nav-rail-open" aria-label="Open sidebar">' + icon("menu", 24) + "</button>" +
      '<header class="topbar topbar--desktop">' +
        '<button class="pill pill--plain pill--sm" type="button">' + icon("down", 18) + "<span>" + C.topbar.getApp + "</span></button>" +
        '<button class="pill pill--accent pill--sm" type="button">' + C.topbar.upgrade + "</button>" +
        '<button class="icon-btn icon-btn--sm topbar__temp" type="button" aria-label="' + C.topbar.temporary + '">' + icon("dash", 20) + "</button>" +
      "</header>" +
      '<header class="topbar topbar--mobile">' +
        '<button class="icon-btn topbar__menu" type="button" aria-label="Main menu" id="nav-open" aria-controls="sidebar" aria-expanded="false">' + icon("menu", 24) + "</button>" +
        '<span class="topbar__brand">' + C.brand + "</span>" +
        '<button class="topbar__mode" type="button"><span class="topbar__mode-label">' + C.home.model + "</span>" + icon("chev", 18, "chev") + "</button>" +
        '<button class="pill pill--accent pill--sm topbar__signin" type="button">' + C.topbar.upgrade + "</button>" +
      "</header>" +
      settingsMarkup() +
      searchMarkup();

    document.getElementById("nav-collapse").addEventListener("click", function () {
      document.body.classList.toggle("nav-collapsed");
    });
    document.getElementById("nav-rail-open").addEventListener("click", function () {
      document.body.classList.remove("nav-collapsed");
      document.getElementById("nav-collapse").focus();
    });
    document.getElementById("settings-open").addEventListener("click", function () { setSettings(true); });
    document.getElementById("account-open").addEventListener("click", function () { setSettings(true); });
  }

  function settingsMarkup() {
    var rows = C.settings.sections.map(function (s) {
      return '<button class="menu-row' + (s.accent ? " menu-row--accent" : "") + '" type="button">' +
        icon(s.icon, 20) + "<span>" + s.label + "</span></button>";
    }).join("");
    var foot = C.settings.footer.map(function (s) {
      return '<button class="menu-row" type="button">' + icon(s.icon, 20) + "<span>" + s.label + "</span></button>";
    }).join("");
    return '<div class="sheet" id="settings-sheet" role="dialog" aria-label="Settings" hidden>' +
      '<div class="sheet__head"><span class="avatar avatar--sm">' + C.account.initials + "</span>" +
      '<span class="sheet__name">' + C.account.name + "</span></div>" +
      '<div class="sheet__scroll">' + rows + '<div class="menu-divider"></div>' + foot + "</div>" +
      '<div class="sheet__foot">' + C.settings.location + "</div></div>";
  }

  function searchMarkup() {
    var rows = C.history.items.map(function (h) {
      return '<a class="search-row" href="chat.html">' + icon("pen", 18) +
        "<span>" + h.label + "</span><em>" + (h.meta || "") + "</em></a>";
    }).join("");
    return '<div class="search-panel" id="search-panel" role="dialog" aria-label="Search chats" hidden>' +
      '<div class="search-panel__field">' + icon("search", 20) +
      '<input id="search-input" type="search" placeholder="' + C.search.placeholder + '" aria-label="Search chats">' +
      '<button class="icon-btn icon-btn--xs" type="button" aria-label="Close search" id="search-close">' + icon("close", 20) + "</button></div>" +
      '<div class="search-panel__title">' + C.search.recentsTitle + "</div>" +
      '<div class="search-panel__rows">' + rows + "</div></div>";
  }

  /* ------------------------------------------------------------ behaviours */
  function setSettings(open) {
    var sheet = document.getElementById("settings-sheet");
    var scrim = document.getElementById("scrim");
    sheet.hidden = !open;
    if (scrim) scrim.hidden = !open;
    if (open) {
      var first = sheet.querySelector("button");
      if (first) first.focus({ preventScroll: true });
    }
  }

  function setSearch(open) {
    var panel = document.getElementById("search-panel");
    if (!panel) return;
    panel.hidden = !open;
    if (open) document.getElementById("search-input").focus();
  }

  function setDrawer(open) {
    var sidebar = document.getElementById("sidebar");
    var scrim = document.getElementById("scrim");
    sidebar.classList.toggle("is-open", open);
    if (scrim) scrim.hidden = !open;
    var btn = document.getElementById("nav-open");
    if (btn) btn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  function wireCommon() {
    var scrim = document.getElementById("scrim");
    if (scrim) scrim.addEventListener("click", function () {
      setSettings(false); setDrawer(false); closeMenus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setSettings(false); setDrawer(false); setSearch(false); closeMenus(); }
    });
    var open = document.getElementById("nav-open");
    if (open) open.addEventListener("click", function () { setDrawer(true); });
    var close = document.getElementById("nav-close");
    if (close) close.addEventListener("click", function () { setDrawer(false); });
    var search = document.getElementById("nav-search");
    if (search) search.addEventListener("click", function () { setSearch(true); });
    var searchClose = document.getElementById("search-close");
    if (searchClose) searchClose.addEventListener("click", function () { setSearch(false); });

    document.querySelectorAll(".history-row__menu").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        openMenu(btn, [
          { label: "Pin chat", icon: "star" },
          { label: "Rename", icon: "edit" },
          { label: "Move to notebook", icon: "note" },
          { label: "Delete", icon: "close", danger: true }
        ]);
      });
    });
  }

  /* --------------------------------------------------------------- popovers */
  var currentMenu = null;
  function closeMenus() {
    if (currentMenu) { currentMenu.remove(); currentMenu = null; }
    document.querySelectorAll(".popover").forEach(function (p) { p.remove(); });
  }

  function openPopover(anchor, html, opts) {
    closeMenus();
    var box = document.createElement("div");
    box.className = "popover" + (opts && opts.wide ? " popover--wide" : "");
    box.setAttribute("role", "menu");
    box.innerHTML = html;
    document.body.appendChild(box);
    var r = anchor.getBoundingClientRect();
    var top = (opts && opts.above) ? r.top - box.offsetHeight - 8 : r.bottom + 8;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - box.offsetWidth - 8);
    box.style.top = Math.max(8, top) + "px";
    box.style.left = left + "px";
    currentMenu = box;
    return box;
  }

  function openMenu(anchor, rows) {
    var html = rows.map(function (row) {
      return '<button class="menu-row' + (row.danger ? " menu-row--danger" : "") + '" type="button">' +
        icon(row.icon, 18) + "<span>" + row.label + "</span></button>";
    }).join("");
    var box = openPopover(anchor, html);
    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { closeMenus(); });
    });
  }

  function modelMenu(anchor) {
    var rows = C.composer.models.map(function (m) {
      return '<button class="model-row' + (m.active ? " is-active" : "") + '" type="button">' +
        '<span class="model-row__mark">' + (m.active ? icon("check", 18) : icon(m.icon || "bulb", 18)) + "</span>" +
        '<span class="model-row__body"><span class="model-row__label">' + m.label + "</span>" +
        (m.hint ? '<span class="model-row__hint">' + m.hint + "</span>" : "") + "</span>" +
        (m.submenu ? icon("chevR", 18, "chev") : "") + "</button>";
    }).join("");
    var box = openPopover(anchor, rows + '<div class="menu-divider"></div><div class="menu-hint">Switch model (^⇧M)</div>', { above: true });
    box.querySelectorAll(".model-row").forEach(function (b, i) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".mode-picker__label, .mode-picker [data-model]").forEach(function (l) {
          l.textContent = C.composer.models[i].label;
        });
        closeMenus();
      });
    });
  }

  function toolsMenu(anchor) {
    var rows = C.composer.tools.map(function (t) {
      if (t.divider) return '<div class="menu-divider"></div>';
      return '<button class="menu-row" type="button">' + icon(t.icon, 20) + "<span>" + t.label + "</span>" +
        (t.locked ? '<span class="lock">' + icon("star", 14) + "</span>" : "") +
        (t.submenu ? icon("chevR", 18, "chev") : "") + "</button>";
    }).join("");
    openPopover(anchor, rows);
  }

  /* -------------------------------------------------------------- home page */
  function initHome() {
    var chips = document.querySelectorAll(".suggestion");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var q = chip.dataset.prompt || chip.textContent.trim();
        window.location.href = "chat.html?q=" + encodeURIComponent(q);
      });
      var dismiss = chip.querySelector(".suggestion__dismiss");
      if (dismiss) dismiss.addEventListener("click", function (e) {
        e.stopPropagation(); chip.remove();
      });
    });
    var modes = document.querySelectorAll(".segmented__item");
    modes.forEach(function (m) {
      m.addEventListener("click", function () {
        modes.forEach(function (x) { x.classList.remove("is-on"); });
        m.classList.add("is-on");
      });
    });
  }

  /* -------------------------------------------------------------- chat page */
  function initChat() {
    var q = new URLSearchParams(location.search).get("q");
    if (q) {
      appendTurn("user", q, true);
      setTimeout(function () {
        appendTurn("model", "Here's a first pass — tell me what to change and I'll refine it. (This clone has no model behind it; the reply is canned.)", false);
      }, 700);
    }
    var form = document.getElementById("chat-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chat-input");
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      appendTurn("user", text, false);
      setTimeout(function () {
        appendTurn("model", "Here's a first pass — tell me what to change and I'll refine it. (This clone has no model behind it; the reply is canned.)", false);
      }, 700);
    });
    var more = document.querySelectorAll(".turn__more");
    more.forEach(function (b) {
      b.addEventListener("click", function () {
        openMenu(b, [
          { label: "Share", icon: "share" },
          { label: "Export to Docs", icon: "note" },
          { label: "Report legal issue", icon: "feedback" }
        ]);
      });
    });
    document.querySelectorAll(".turn__action").forEach(function (b) {
      b.addEventListener("click", function () {
        b.classList.toggle("is-on");
      });
    });
  }

  function appendTurn(role, text, fromQuery) {
    var list = document.getElementById("turns");
    if (!list) return;
    var el = document.createElement("article");
    el.className = "turn turn--" + role;
    if (role === "user") {
      el.innerHTML = '<div class="turn__head"><span class="turn__label">You said</span>' +
        '<span class="turn__tools"><button class="icon-btn icon-btn--xs" type="button" aria-label="Copy prompt">' + icon("copy", 16) +
        '</button><button class="icon-btn icon-btn--xs" type="button" aria-label="Edit">' + icon("edit", 16) + "</button></span></div>" +
        '<p class="turn__text">' + escapeHtml(text) + "</p>";
    } else {
      el.innerHTML = '<div class="turn__head"><span class="turn__label">Gemini said</span></div>' +
        '<p class="turn__text">' + escapeHtml(text) + "</p>" +
        '<div class="turn__actions">' +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Copy">' + icon("copy", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Good response">' + icon("thumbUp", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Bad response">' + icon("thumbDown", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Share">' + icon("share", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__more" type="button" aria-label="More options">' + icon("dots", 18) + "</button>" +
        "</div>";
    }
    if (fromQuery) { list.innerHTML = ""; }
    list.appendChild(el);
    if (!fromQuery) {
      var more = el.querySelector(".turn__more");
      if (more) more.addEventListener("click", function () {
        openMenu(more, [{ label: "Share", icon: "share" }, { label: "Export to Docs", icon: "note" }]);
      });
      el.querySelectorAll(".turn__action").forEach(function (b) {
        b.addEventListener("click", function () { b.classList.toggle("is-on"); });
      });
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  /* ---------------------------------------------------- composer / menus */
  function wireComposer() {
    var pickers = document.querySelectorAll(".mode-picker");
    pickers.forEach(function (p) {
      p.addEventListener("click", function () { modelMenu(p); });
    });
    var tools = document.querySelectorAll(".composer__plus");
    tools.forEach(function (t) {
      t.addEventListener("click", function () { toolsMenu(t); });
    });
    var form = document.getElementById("home-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("prompt");
      var q = input.value.trim();
      window.location.href = "chat.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  /* ------------------------------------------------------------ page extras */
  function initImages() {
    document.querySelectorAll(".template").forEach(function (t) {
      t.addEventListener("click", function () {
        document.querySelectorAll(".template").forEach(function (x) { x.classList.remove("is-on"); });
        t.classList.add("is-on");
      });
    });
    document.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        c.parentElement.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-on"); });
        c.classList.add("is-on");
      });
    });
  }

  function initCustomize() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("is-on"); });
        tab.classList.add("is-on");
      });
    });
    document.querySelectorAll(".add-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.classList.toggle("is-on");
        b.setAttribute("aria-pressed", String(on));
        b.innerHTML = on ? icon("check", 20) : icon("plus", 20);
      });
    });
  }

  /* ------------------------------------------------------------------- boot */
  renderShell();
  wireCommon();
  wireComposer();
  if (page === "home") initHome();
  if (page === "chat") initChat();
  if (page === "images") initImages();
  if (page === "customize") initCustomize();

  // collapsed rail: reopen with the panel button in the top bar
  document.addEventListener("click", function (e) {
    if (e.target.closest(".popover") === null && !e.target.closest(".mode-picker") && !e.target.closest(".composer__plus") && !e.target.closest(".history-row__menu")) {
      closeMenus();
    }
  });
})();
