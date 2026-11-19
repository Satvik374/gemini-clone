/* Application shell and behaviour, driven by the API in /backend.

   Load order: api.js -> content.js -> app.js. Every list on screen (history,
   models, suggestions, settings) comes from the server; nothing is hard-coded
   except labels and icons. */

(function () {
  "use strict";

  var C = window.CONTENT || {};
  var Api = window.Api;
  var page = document.body.dataset.page || "home";

  var state = {
    user: null,
    conversations: [],
    models: [],
    suggestions: [],
    settings: null,
    conversation: null,
    streaming: false
  };

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
    dots: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    chev: '<path d="M6 9.5l6 5.5 6-5.5"/>',
    chevR: '<path d="M9.5 6l5.5 6-5.5 6"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.2a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1.1z"/>',
    sparkles: '<path d="M12 3c.5 3.4 1.9 5 4.7 5.6-2.8.6-4.2 2.2-4.7 5.6-.5-3.4-1.9-5-4.7-5.6C10.1 8 11.5 6.4 12 3z" fill="currentColor" stroke="none"/><path d="M18 14c.3 1.9 1 2.8 2.6 3.1-1.6.3-2.3 1.2-2.6 3.1-.3-1.9-1-2.8-2.6-3.1 1.6-.3 2.3-1.2 2.6-3.1z" fill="currentColor" stroke="none"/>',
    corner: '<path d="M9 6H6a2 2 0 0 0-2 2v9"/><path d="M6 9l3-3M6 9l3 3"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 5v14M16 5v14M3 9.5h5M3 14.5h5M16 9.5h5M16 14.5h5"/>',
    paperclip: '<path d="M20 11.5l-7.6 7.6a5 5 0 0 1-7-7l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.6-2.6l7-7"/>',
    drive: '<path d="M9 3h6l6 11h-6z"/><path d="M9 3L3 14l3 5h6L9 3z"/><path d="M6 19h12l-3-5H9z"/>',
    music: '<circle cx="7" cy="17" r="2.6"/><circle cx="18" cy="15" r="2.6"/><path d="M9.6 17V7l11-2v10"/>',
    canvas: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 15l3-4 2.5 3L16 11l2 4z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    bulb: '<path d="M9 17h6"/><path d="M10 20h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 5.5A2.5 2.5 0 0 0 13.5 3H6a3 3 0 0 0-3 3v7.5A2.5 2.5 0 0 0 5.5 16"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/>',
    thumbUp: '<path d="M7 11v9H4v-9z"/><path d="M7 11l4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/>',
    thumbDown: '<path d="M17 13V4h3v9z"/><path d="M17 13l-4 8a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 4H17"/>',
    share: '<path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    star: '<path d="M12 3l2.6 6.2 6.4.5-4.9 4.2 1.5 6.3L12 16.8 6.4 20.2l1.5-6.3L3 9.7l6.4-.5z"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
    pin: '<path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/><path d="M12 14v7"/>'
  };

  function icon(name, size, cls) {
    var path = ICONS[name] || ICONS.dots;
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" width="' + (size || 20) +
      '" height="' + (size || 20) + '" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/);
    return ((parts[0] || "?")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }

  function toast(message) {
    var box = document.getElementById("toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast";
      box.className = "toast";
      box.setAttribute("role", "status");
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.add("is-on");
    clearTimeout(box._timer);
    box._timer = setTimeout(function () { box.classList.remove("is-on"); }, 3600);
  }

  /* ----------------------------------------------------------------- auth */
  var authMode = "signin";

  function showAuth() {
    if (document.getElementById("auth")) return;
    document.body.classList.add("is-locked");
    var el = document.createElement("div");
    el.className = "auth";
    el.id = "auth";
    el.innerHTML =
      '<div class="auth__card">' +
        '<span class="sparkle auth__mark" aria-hidden="true"></span>' +
        '<h1 class="auth__title" id="auth-title">Sign in</h1>' +
        '<p class="auth__sub">Your chats are stored by this app’s own backend.</p>' +
        '<form class="auth__form" id="auth-form" novalidate>' +
          '<label class="auth__field" id="auth-name-field" hidden><span>Name</span>' +
            '<input id="auth-name" type="text" autocomplete="name" placeholder="Your name"></label>' +
          '<label class="auth__field"><span>Email</span>' +
            '<input id="auth-email" type="email" autocomplete="username" required placeholder="you@example.com"></label>' +
          '<label class="auth__field"><span>Password</span>' +
            '<input id="auth-password" type="password" autocomplete="current-password" required placeholder="At least 8 characters"></label>' +
          '<p class="auth__error" id="auth-error" role="alert" hidden></p>' +
          '<button class="auth__submit" type="submit" id="auth-submit">Sign in</button>' +
        "</form>" +
        '<button class="auth__swap" type="button" id="auth-swap">Create an account instead</button>' +
        '<p class="auth__hint">Demo account: demo@example.com / demo-password-1</p>' +
      "</div>";
    document.body.appendChild(el);

    var form = document.getElementById("auth-form");
    var errorBox = document.getElementById("auth-error");
    var submit = document.getElementById("auth-submit");
    var swap = document.getElementById("auth-swap");

    swap.addEventListener("click", function () {
      authMode = authMode === "signin" ? "register" : "signin";
      var registering = authMode === "register";
      document.getElementById("auth-name-field").hidden = !registering;
      document.getElementById("auth-title").textContent = registering ? "Create an account" : "Sign in";
      submit.textContent = registering ? "Create account" : "Sign in";
      swap.textContent = registering ? "I already have an account" : "Create an account instead";
      document.getElementById("auth-password").setAttribute("autocomplete", registering ? "new-password" : "current-password");
      errorBox.hidden = true;
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      errorBox.hidden = true;
      var email = document.getElementById("auth-email").value.trim();
      var password = document.getElementById("auth-password").value;
      var name = document.getElementById("auth-name").value.trim();
      submit.disabled = true;
      try {
        var result = authMode === "register"
          ? await Api.register(email, password, name || email.split("@")[0])
          : await Api.signIn(email, password);
        Api.setToken(result.access_token);
        window.location.href = "index.html";
      } catch (error) {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
        submit.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------------- shell */
  function navItem(item) {
    return '<a class="side-row' + (item.id === page ? " is-current" : "") + '" href="' + item.href + '">' +
      '<span class="side-row__icon">' + icon(item.icon) + "</span>" +
      '<span class="side-row__label">' + item.label + "</span></a>";
  }

  function historyMarkup() {
    if (!state.conversations.length) {
      return '<p class="history-empty">No chats yet. Ask something to start one.</p>';
    }
    return state.conversations.map(function (convo) {
      var current = state.conversation && state.conversation.id === convo.id;
      return '<a class="history-row' + (current ? " is-current" : "") + '" href="chat.html?c=' +
        encodeURIComponent(convo.id) + '" data-id="' + convo.id + '">' +
        '<span class="history-row__label">' + escapeHtml(convo.title || "Untitled chat") + "</span>" +
        (convo.pinned ? '<span class="history-row__pin">' + icon("pin", 14) + "</span>" : "") +
        '<button class="icon-btn history-row__menu" type="button" aria-label="More options for ' +
        escapeHtml(convo.title || "Untitled chat") + '" data-id="' + convo.id + '">' + icon("dots", 18) +
        "</button></a>";
    }).join("");
  }

  function renderShell() {
    var host = document.getElementById("shell");
    if (!host) return;
    var user = state.user || { name: "Account", email: "" };

    host.innerHTML =
      '<aside class="sidebar" id="sidebar" aria-label="Side navigation">' +
        '<div class="sidebar__top">' +
          '<a class="brand" href="index.html" aria-label="Home">' +
            '<span class="sparkle brand__mark" aria-hidden="true"></span>' +
            '<span class="brand__word">' + (C.brand || "Gemini") + "</span></a>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Search chats" id="nav-search">' + icon("search", 20) + "</button>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Close sidebar" id="nav-collapse">' + icon("panel", 20) + "</button>" +
          '<button class="icon-btn sidebar__close" type="button" aria-label="Close sidebar" id="nav-close">' + icon("close", 24) + "</button>" +
        "</div>" +
        '<nav class="nav">' + (C.nav || []).map(navItem).join("") + "</nav>" +
        '<div class="side-section side-section--row"><span>' + ((C.history && C.history.title) || "History") + "</span>" +
          '<button class="icon-btn icon-btn--xs" type="button" aria-label="New chat" id="nav-new">' + icon("plus", 16) + "</button></div>" +
        '<div class="history" id="history">' + historyMarkup() + "</div>" +
        '<div class="side-account">' +
          '<button class="account-btn" type="button" id="account-open">' +
            '<span class="avatar">' + escapeHtml(initials(user.name)) + "</span>" +
            '<span class="account-btn__name">' + escapeHtml(user.name) + "</span></button>" +
          '<button class="icon-btn icon-btn--sm" type="button" aria-label="Settings" id="settings-open">' + icon("gear", 20) + "</button>" +
        "</div>" +
      "</aside>" +
      '<div class="scrim" id="scrim" hidden></div>' +
      '<button class="rail-open icon-btn" type="button" id="nav-rail-open" aria-label="Open sidebar">' + icon("menu", 24) + "</button>" +
      '<header class="topbar topbar--mobile">' +
        '<button class="icon-btn topbar__menu" type="button" aria-label="Main menu" id="nav-open" aria-controls="sidebar" aria-expanded="false">' + icon("menu", 24) + "</button>" +
        '<span class="topbar__brand">' + (C.brand || "Gemini") + "</span>" +
        '<button class="topbar__mode mode-picker" type="button" aria-label="Choose model"><span class="topbar__mode-label mode-picker__label">' +
          currentModelLabel() + "</span>" + icon("chev", 18, "chev") + "</button>" +
      "</header>" +
      settingsMarkup() +
      searchMarkup();

    wireShell();
  }

  function settingsMarkup() {
    var user = state.user || { name: "Account", email: "" };
    var theme = state.settings ? state.settings.theme : "system";
    var model = state.settings ? state.settings.default_model : "auto";
    var memory = state.settings ? state.settings.memory_enabled : true;
    var modelLabel = (state.models.filter(function (m) { return m.id === model; })[0] || {}).label || "Auto";

    var modelRows = state.models.map(function (m) {
      return '<button class="menu-row' + (m.id === model ? " is-on" : "") + '" type="button" data-model="' + m.id + '">' +
        icon(m.id === model ? "check" : "bulb", 18) + "<span>" + escapeHtml(m.label) + "</span>" +
        (m.locked ? '<em class="menu-row__value">Paid</em>' : "") + "</button>";
    }).join("");

    return '<div class="sheet" id="settings-sheet" role="dialog" aria-label="Settings" hidden>' +
      '<div class="sheet__head"><span class="avatar avatar--sm">' + escapeHtml(initials(user.name)) + "</span>" +
        '<span class="sheet__name">' + escapeHtml(user.name) + "</span>" +
        '<span class="sheet__mail">' + escapeHtml(user.email) + "</span></div>" +
      '<div class="sheet__scroll">' +
        '<div class="sheet__label">Model</div>' + modelRows +
        '<div class="menu-divider"></div>' +
        '<button class="menu-row" type="button" id="setting-theme">' + icon(theme === "dark" ? "moon" : "sun", 20) +
          "<span>Theme</span><em class=\"menu-row__value\">" + theme + "</em></button>" +
        '<button class="menu-row" type="button" id="setting-memory">' + icon("gauge", 20) +
          "<span>Memory</span><em class=\"menu-row__value\">" + (memory ? "On" : "Off") + "</em></button>" +
        '<div class="menu-divider"></div>' +
        '<button class="menu-row menu-row--danger" type="button" id="setting-signout">' + icon("logout", 20) +
          "<span>Sign out</span></button>" +
      "</div>" +
      '<div class="sheet__foot">Model in use: ' + escapeHtml(modelLabel) + "</div></div>";
  }

  function searchMarkup() {
    return '<div class="search-panel" id="search-panel" role="dialog" aria-label="Search chats" hidden>' +
      '<div class="search-panel__field">' + icon("search", 20) +
        '<input id="search-input" type="search" placeholder="' + ((C.search || {}).placeholder || "Search chats") + '" aria-label="Search chats">' +
        '<button class="icon-btn icon-btn--xs" type="button" aria-label="Close search" id="search-close">' + icon("close", 20) + "</button></div>" +
      '<div class="search-panel__title">' + ((C.search || {}).recentsTitle || "Recents") + "</div>" +
      '<div class="search-panel__rows" id="search-results"></div></div>';
  }

  function wireShell() {
    var collapse = document.getElementById("nav-collapse");
    if (collapse) collapse.addEventListener("click", function () { document.body.classList.toggle("nav-collapsed"); });
    var rail = document.getElementById("nav-rail-open");
    if (rail) rail.addEventListener("click", function () {
      document.body.classList.remove("nav-collapsed");
      document.getElementById("nav-collapse").focus();
    });
    document.getElementById("settings-open").addEventListener("click", function () { setSettings(true); });
    document.getElementById("account-open").addEventListener("click", function () { setSettings(true); });
    var newChat = document.getElementById("nav-new");
    if (newChat) newChat.addEventListener("click", function () { window.location.href = "index.html"; });
    wireSettings();
    wireShellControls();
  }

  function wireSettings() {
    var sheet = document.getElementById("settings-sheet");
    sheet.querySelectorAll("[data-model]").forEach(function (row) {
      row.addEventListener("click", async function () {
        try {
          state.settings = await Api.patchSettings({ default_model: row.dataset.model });
          setSettings(false);
          refreshSheet();
          updateModelLabel();
        } catch (error) { toast(error.message); }
      });
    });
    document.getElementById("setting-theme").addEventListener("click", async function () {
      var order = ["system", "light", "dark"];
      var next = order[(order.indexOf(state.settings.theme) + 1) % order.length];
      try {
        state.settings = await Api.patchSettings({ theme: next });
        applyTheme(next);
        setSettings(false);
        refreshSheet();
        toast("Theme: " + next);
      } catch (error) { toast(error.message); }
    });
    document.getElementById("setting-memory").addEventListener("click", async function () {
      try {
        state.settings = await Api.patchSettings({ memory_enabled: !state.settings.memory_enabled });
        setSettings(false);
        refreshSheet();
        toast("Memory " + (state.settings.memory_enabled ? "on" : "off"));
      } catch (error) { toast(error.message); }
    });
    document.getElementById("setting-signout").addEventListener("click", function () {
      Api.clearToken();
      window.location.href = "index.html";
    });
  }

  /* Re-render the shell in place, keeping the current scroll position. */
  /* Only the sheet changes when a setting is written, so replace just that
     node. Re-rendering the whole shell would strand the listeners bound to the
     sidebar, the mobile menu and the search field. */
  function refreshSheet() {
    var current = document.getElementById("settings-sheet");
    if (!current) return;
    current.outerHTML = settingsMarkup();
    wireSettings();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    var dark = theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("theme-dark", dark);
  }

  function currentModelLabel() {
    return (state.models.filter(function (m) {
      return state.settings && m.id === state.settings.default_model;
    })[0] || {}).label || "Auto";
  }

  function updateModelLabel() {
    var label = currentModelLabel();
    document.querySelectorAll(".mode-picker__label").forEach(function (node) { node.textContent = label; });
  }

  function setSettings(open) {
    var sheet = document.getElementById("settings-sheet");
    var scrim = document.getElementById("scrim");
    if (!sheet) return;
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
    if (open) {
      document.getElementById("search-input").focus();
      renderSearchResults(state.conversations.map(function (c) {
        return { conversation_id: c.id, title: c.title || "Untitled chat", snippet: "" };
      }));
    }
  }

  function setDrawer(open) {
    var sidebar = document.getElementById("sidebar");
    var scrim = document.getElementById("scrim");
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", open);
    if (scrim) scrim.hidden = !open;
    var btn = document.getElementById("nav-open");
    if (btn) btn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  function renderSearchResults(items) {
    var box = document.getElementById("search-results");
    if (!box) return;
    if (!items.length) {
      box.innerHTML = '<p class="search-empty">No chats found.</p>';
      return;
    }
    box.innerHTML = items.map(function (item) {
      return '<a class="search-row" href="chat.html?c=' + encodeURIComponent(item.conversation_id) + '">' +
        icon("pen", 18) + "<span>" + escapeHtml(item.title) + "</span>" +
        (item.snippet ? "<em>" + escapeHtml(item.snippet.slice(0, 60)) + "</em>" : "") + "</a>";
    }).join("");
  }

  /* ------------------------------------------------------------- popovers */
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
    var rect = anchor.getBoundingClientRect();
    var top = opts && opts.above ? rect.top - box.offsetHeight - 8 : rect.bottom + 8;
    var left = Math.min(Math.max(8, rect.left), window.innerWidth - box.offsetWidth - 8);
    box.style.top = Math.max(8, top) + "px";
    box.style.left = left + "px";
    currentMenu = box;
    return box;
  }

  function modelMenu(anchor) {
    var active = state.settings ? state.settings.default_model : "auto";
    var rows = state.models.map(function (model) {
      return '<button class="model-row' + (model.id === active ? " is-active" : "") + '" type="button" data-model="' +
        model.id + '"><span class="model-row__mark">' + icon(model.id === active ? "check" : "bulb", 18) + "</span>" +
        '<span class="model-row__body"><span class="model-row__label">' + escapeHtml(model.label) + "</span>" +
        (model.description ? '<span class="model-row__hint">' + escapeHtml(model.description) + "</span>" : "") +
        "</span>" + (model.locked ? '<span class="lock">Paid</span>' : "") + "</button>";
    }).join("");

    var box = openPopover(anchor, rows, { above: true });
    box.querySelectorAll("[data-model]").forEach(function (button) {
      button.addEventListener("click", async function () {
        try {
          state.settings = await Api.patchSettings({ default_model: button.dataset.model });
          updateModelLabel();
        } catch (error) {
          toast(error.message);
        }
        closeMenus();
      });
    });
  }

  function toolsMenu(anchor) {
    var rows = (C.composer && C.composer.tools ? C.composer.tools : []).map(function (tool) {
      if (tool.divider) return '<div class="menu-divider"></div>';
      return '<button class="menu-row" type="button" disabled>' + icon(tool.icon, 20) + "<span>" + tool.label + "</span>" +
        (tool.locked ? '<span class="lock">Paid</span>' : "") + "</button>";
    }).join("");
    openPopover(anchor, rows + '<div class="menu-hint">Uploads are not part of this backend yet.</div>');
  }

  function historyMenu(anchor, conversation) {
    var rows = [
      { label: conversation.pinned ? "Unpin chat" : "Pin chat", icon: "pin", action: "pin" },
      { label: "Rename", icon: "edit", action: "rename" },
      { label: "Delete", icon: "trash", danger: true, action: "delete" }
    ];
    var html = rows.map(function (row) {
      return '<button class="menu-row' + (row.danger ? " menu-row--danger" : "") + '" type="button" data-action="' +
        row.action + '">' + icon(row.icon, 18) + "<span>" + row.label + "</span></button>";
    }).join("");
    var box = openPopover(anchor, html);
    box.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.dataset.action;
        closeMenus();
        if (action === "pin") return togglePin(conversation);
        if (action === "rename") return startRename(conversation);
        if (action === "delete") return removeConversation(conversation);
      });
    });
  }

  async function togglePin(conversation) {
    try {
      await Api.patchConversation(conversation.id, { pinned: !conversation.pinned });
      await refreshConversations();
    } catch (error) { toast(error.message); }
  }

  function startRename(conversation) {
    var row = document.querySelector('.history-row[data-id="' + conversation.id + '"]');
    if (!row) return;
    var label = row.querySelector(".history-row__label");
    if (!label) return;
    var input = document.createElement("input");
    input.className = "history-rename";
    input.value = conversation.title || "";
    input.setAttribute("aria-label", "Rename chat");
    label.replaceWith(input);
    input.focus();
    input.select();
    var done = false;
    async function commit(save) {
      if (done) return;
      done = true;
      if (save) {
        var title = input.value.trim();
        if (title && title !== conversation.title) {
          try {
            await Api.patchConversation(conversation.id, { title: title });
            await refreshConversations();
            return;
          } catch (error) { toast(error.message); }
        }
      }
      if (state.conversation && state.conversation.id === conversation.id) renderTurns(state.conversation.messages);
      refreshHistoryOnly();
    }
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); commit(true); }
      if (event.key === "Escape") { event.preventDefault(); commit(false); }
    });
    input.addEventListener("blur", function () { commit(false); });
  }

  async function removeConversation(conversation) {
    try {
      await Api.deleteConversation(conversation.id);
      await refreshConversations();
      if (state.conversation && state.conversation.id === conversation.id) {
        window.location.href = "index.html";
      }
    } catch (error) { toast(error.message); }
  }

  async function refreshConversations() {
    try {
      var pageData = await Api.listConversations();
      state.conversations = pageData.items;
      refreshHistoryOnly();
    } catch (error) { toast(error.message); }
  }

  function refreshHistoryOnly() {
    var box = document.getElementById("history");
    if (box) box.innerHTML = historyMarkup();
  }

  /* ------------------------------------------------------------ behaviours */
  /* Element listeners live here because the shell is re-rendered after a
     settings change; binding them once in wireCommon would strand the new DOM. */
  var commonWired = false;

  function wireShellControls() {
    var scrim = document.getElementById("scrim");
    if (scrim) scrim.addEventListener("click", function () {
      setSettings(false); setDrawer(false); closeMenus();
    });
    var open = document.getElementById("nav-open");
    if (open) open.addEventListener("click", function () { setDrawer(true); });
    var close = document.getElementById("nav-close");
    if (close) close.addEventListener("click", function () { setDrawer(false); });
    var search = document.getElementById("nav-search");
    if (search) search.addEventListener("click", function () { setSearch(true); });
    var searchClose = document.getElementById("search-close");
    if (searchClose) searchClose.addEventListener("click", function () { setSearch(false); });

    var input = document.getElementById("search-input");
    if (input) {
      var timer = null;
      input.addEventListener("input", function () {
        var query = input.value.trim();
        clearTimeout(timer);
        if (!query) {
          renderSearchResults(state.conversations.map(function (c) {
            return { conversation_id: c.id, title: c.title || "Untitled chat", snippet: "" };
          }));
          return;
        }
        timer = setTimeout(async function () {
          try {
            var result = await Api.search(query);
            renderSearchResults(result.items);
          } catch (error) { toast(error.message); }
        }, 220);
      });
    }

    if (commonWired) return;
    commonWired = true;

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { setSettings(false); setDrawer(false); setSearch(false); closeMenus(); }
    });

    document.addEventListener("click", function (event) {
      var button = event.target.closest(".history-row__menu");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      var conversation = state.conversations.filter(function (c) { return c.id === button.dataset.id; })[0];
      if (conversation) historyMenu(button, conversation);
    });
  }

  /* -------------------------------------------------------------- home page */
  function initHome() {
    var list = document.querySelector(".suggestions");
    if (list && state.suggestions.length) {
      var icons = ["sparkles", "corner", "film"];
      list.innerHTML = state.suggestions.slice(0, 4).map(function (text, index) {
        return '<button class="suggestion" type="button" data-prompt="' + escapeHtml(text) + '">' +
          '<span class="suggestion__icon">' + icon(icons[index % icons.length], 20) + "</span>" +
          '<span class="suggestion__text">' + escapeHtml(text) + "</span></button>";
      }).join("");
    }
    document.querySelectorAll(".suggestion").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var query = chip.dataset.prompt || chip.textContent.trim();
        window.location.href = "chat.html?q=" + encodeURIComponent(query);
      });
    });
    var modes = document.querySelectorAll(".segmented__item");
    modes.forEach(function (mode) {
      mode.addEventListener("click", function () {
        modes.forEach(function (other) {
          other.classList.remove("is-on");
          other.setAttribute("aria-selected", "false");
        });
        mode.classList.add("is-on");
        mode.setAttribute("aria-selected", "true");
      });
    });
  }

  /* -------------------------------------------------------------- chat page */
  function initChat() {
    var turns = document.getElementById("turns");
    if (turns) turns.innerHTML = "";
    var params = new URLSearchParams(location.search);
    var conversationId = params.get("c");
    var query = params.get("q");

    if (conversationId) {
      loadConversation(conversationId).then(function () {
        if (query) sendMessage(query);
      });
    } else if (query) {
      sendMessage(query);
    }

    var form = document.getElementById("chat-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = document.getElementById("chat-input");
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      sendMessage(text);
    });
  }

  async function loadConversation(id) {
    try {
      var conversation = await Api.getConversation(id);
      state.conversation = conversation;
      var head = document.querySelector(".chat-head");
      if (head) head.textContent = conversation.title || "Conversation";
      document.title = (conversation.title || "Conversation") + " — AI assistant";
      renderTurns(conversation.messages);
      refreshHistoryOnly();
    } catch (error) {
      toast(error.message);
      if (error.status === 404) window.location.href = "index.html";
    }
  }

  function renderTurns(messages) {
    var list = document.getElementById("turns");
    if (!list) return;
    list.innerHTML = "";
    (messages || []).forEach(function (message) {
      appendTurn(message.role, message.text);
    });
    scrollToBottom();
  }

  async function sendMessage(text) {
    if (state.streaming) return;
    state.streaming = true;

    try {
      if (!state.conversation) {
        state.conversation = await Api.createConversation();
        history.replaceState(null, "", "chat.html?c=" + state.conversation.id);
      }
      var conversationId = state.conversation.id;
      appendTurn("user", text);
      var modelTurn = appendTurn("model", "", true);
      var textNode = modelTurn.querySelector(".turn__text");
      var accumulated = "";

      try {
        await Api.streamMessage(conversationId, text, function (delta) {
          accumulated += delta;
          textNode.textContent = accumulated;
          scrollToBottom();
        });
        if (!accumulated) textNode.textContent = "No reply was returned.";
      } catch (error) {
        textNode.textContent = "Could not reach the backend: " + error.message;
        textNode.classList.add("turn__text--error");
      }
      modelTurn.classList.remove("is-typing");
      await refreshConversations();
      var head = document.querySelector(".chat-head");
      var updated = state.conversations.filter(function (c) { return c.id === conversationId; })[0];
      if (updated && head) {
        head.textContent = updated.title;
        state.conversation.title = updated.title;
        document.title = updated.title + " — AI assistant";
      }
    } catch (error) {
      toast(error.message);
    } finally {
      state.streaming = false;
    }
  }

  function appendTurn(role, text, typing) {
    var list = document.getElementById("turns");
    if (!list) return null;
    var el = document.createElement("article");
    el.className = "turn turn--" + role + (typing ? " is-typing" : "");
    if (role === "user") {
      el.innerHTML = '<div class="turn__head"><span class="turn__label">You said</span>' +
        '<span class="turn__tools"><button class="icon-btn icon-btn--xs" type="button" aria-label="Copy prompt">' + icon("copy", 16) +
        '</button><button class="icon-btn icon-btn--xs" type="button" aria-label="Edit">' + icon("edit", 16) + "</button></span></div>" +
        '<p class="turn__text"></p>';
      el.querySelector(".turn__text").textContent = text;
      var copy = el.querySelector('[aria-label="Copy prompt"]');
      copy.addEventListener("click", function () { copyText(text, copy); });
    } else {
      el.innerHTML = '<div class="turn__head"><span class="turn__label">Gemini said</span></div>' +
        '<p class="turn__text"></p>' +
        '<div class="turn__actions">' +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Copy">' + icon("copy", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Good response">' + icon("thumbUp", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Bad response">' + icon("thumbDown", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__action" type="button" aria-label="Share">' + icon("share", 18) + "</button>" +
        '<button class="icon-btn icon-btn--xs turn__more" type="button" aria-label="More options">' + icon("dots", 18) + "</button>" +
        "</div>";
      if (text) el.querySelector(".turn__text").textContent = text;
      el.querySelectorAll(".turn__action").forEach(function (button) {
        button.addEventListener("click", function () { button.classList.toggle("is-on"); });
      });
      el.querySelector('[aria-label="Copy"]').addEventListener("click", function (event) {
        copyText(el.querySelector(".turn__text").textContent, event.currentTarget);
      });
      el.querySelector(".turn__more").addEventListener("click", function (event) {
        openPopover(event.currentTarget, '<button class="menu-row" type="button" disabled>' + icon("share", 18) +
          "<span>Sharing is not available yet</span></button>");
      });
    }
    list.appendChild(el);
    if (!typing) scrollToBottom();
    return el;
  }

  function copyText(value, button) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(function () {
      button.classList.add("is-on");
      setTimeout(function () { button.classList.remove("is-on"); }, 1200);
    });
  }

  function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  /* ----------------------------------------------------------- other pages */
  function initImages() {
    document.querySelectorAll(".template").forEach(function (template) {
      template.addEventListener("click", function () {
        document.querySelectorAll(".template").forEach(function (other) { other.classList.remove("is-on"); });
        template.classList.add("is-on");
      });
    });
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        chip.parentElement.querySelectorAll(".chip").forEach(function (other) { other.classList.remove("is-on"); });
        chip.classList.add("is-on");
      });
    });
  }

  function initCustomize() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (other) {
          other.classList.remove("is-on");
          other.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-on");
        tab.setAttribute("aria-selected", "true");
      });
    });
    document.querySelectorAll(".add-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var on = button.classList.toggle("is-on");
        button.setAttribute("aria-pressed", String(on));
        button.innerHTML = on ? icon("check", 20) : icon("plus", 20);
      });
    });
  }

  /* --------------------------------------------------- composer / menus */
  function wireComposer() {
    document.querySelectorAll(".mode-picker").forEach(function (picker) {
      picker.addEventListener("click", function () { modelMenu(picker); });
    });
    document.querySelectorAll(".composer__plus").forEach(function (button) {
      button.addEventListener("click", function () { toolsMenu(button); });
    });
    var homeForm = document.getElementById("home-form");
    if (homeForm) {
      homeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = document.getElementById("prompt").value.trim();
        window.location.href = "chat.html" + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    }
  }

  /* ------------------------------------------------------------------- boot */
  async function boot() {
    if (!Api || !Api.token()) {
      showAuth();
      return;
    }
    try {
      state.user = await Api.me();
    } catch (error) {
      if (error.status === 401) {
        Api.clearToken();
        showAuth();
        return;
      }
      toast(error.message);
    }

    try {
      var results = await Promise.all([Api.listConversations(), Api.models(), Api.settings(), Api.suggestions()]);
      state.conversations = results[0].items;
      state.models = results[1];
      state.suggestions = results[3];
      state.settings = results[2];
    } catch (error) {
      toast("Could not load your data: " + error.message);
    }

    if (state.settings) applyTheme(state.settings.theme);
    renderShell();
    wireComposer();
    updateModelLabel();

    if (page === "home") initHome();
    if (page === "chat") initChat();
    if (page === "images") initImages();
    if (page === "customize") initCustomize();

    document.addEventListener("click", function (event) {
      if (event.target.closest(".popover") || event.target.closest(".mode-picker") ||
          event.target.closest(".composer__plus") || event.target.closest(".history-row__menu")) return;
      closeMenus();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
