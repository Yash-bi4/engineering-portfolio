/* ==========================================================
   Portfolio script
   Every page loads data/content.json and renders from it.
   You should not need to edit this file to change content.
   ========================================================== */

(function () {
  "use strict";

  var CONTENT_URL = "data/content.json";

  /* ---------- Helpers ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isTodo(s) {
    return typeof s === "string" && s.indexOf("TODO") !== -1;
  }

  // Escaped text. Anything containing "TODO" gets a yellow highlight so it is easy to spot.
  function txt(s) {
    return isTodo(s) ? '<span class="todo">' + esc(s) + "</span>" : esc(s);
  }

  function $(sel) { return document.querySelector(sel); }

  /* ---------- Theme toggle ---------- */

  function setupTheme() {
    var btn = $(".theme-toggle");
    if (!btn) return;
    var root = document.documentElement;
    function label() {
      var dark = root.dataset.theme === "dark";
      btn.textContent = dark ? "Light" : "Dark";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
    label();
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      label();
    });
  }

  /* ---------- Footer ---------- */

  function renderFooter(site) {
    var f = $("#footer");
    if (!f) return;
    f.innerHTML =
      "<span>&copy; " + new Date().getFullYear() + " " + esc(site.name) + "</span>" +
      '<a href="mailto:' + esc(site.email) + '">' + esc(site.email) + "</a>" +
      '<a href="' + esc(site.linkedin) + '" rel="noopener">LinkedIn</a>' +
      '<button class="theme-toggle" type="button">Dark</button>';
    setupTheme();
  }

  /* ---------- Projects page ---------- */

  function cardHTML(p) {
    var tags = (p.tags || []).slice(0, 3).map(function (t) { return "<li>" + txt(t) + "</li>"; }).join("");
    return (
      "<li>" +
      '<a class="card" href="#' + encodeURIComponent(p.id) + '" data-id="' + esc(p.id) + '">' +
      '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || p.title) + '" loading="lazy" width="1200" height="800">' +
      '<div class="card-body">' +
      '<h3 class="card-title">' + txt(p.title) + "</h3>" +
      '<p class="card-summary">' + txt(p.summary) + "</p>" +
      (p.status ? '<span class="card-status">Status: ' + txt(p.status) + "</span>" : "") +
      '<ul class="tags" aria-label="Tags">' + tags + "</ul>" +
      "</div></a></li>"
    );
  }

  function listHTML(items) {
    if (!items || !items.length) return "";
    return "<ul>" + items.map(function (i) { return "<li>" + txt(i) + "</li>"; }).join("") + "</ul>";
  }

  function projectHTML(p) {
    var meta = [
      ["Role", p.role],
      ["Timeframe", p.timeframe],
      ["Team", p.team],
      ["Status", p.status]
    ].filter(function (r) { return r[1]; })
      .map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + txt(r[1]) + "</dd>"; })
      .join("");

    var gallery = (p.gallery || []).map(function (g, i) {
      return (
        '<button type="button" data-src="' + esc(g.src) + '" data-alt="' + esc(g.alt || "") + '" aria-label="Enlarge image ' + (i + 1) + ": " + esc(g.alt || "") + '">' +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.alt || "") + '" loading="lazy" width="1200" height="800">' +
        "</button>"
      );
    }).join("");

    var links = (p.links || []).map(function (l) {
      if (!l.url || isTodo(l.url)) {
        return "<li>" + esc(l.label) + ': <span class="todo">' + esc(l.url || "TODO: link") + "</span></li>";
      }
      return '<li><a href="' + esc(l.url) + '" rel="noopener">' + esc(l.label) + "</a></li>";
    }).join("");

    return (
      '<h2 id="modal-title">' + txt(p.title) + "</h2>" +
      '<dl class="meta">' + meta + "</dl>" +
      (p.goal ? "<h3>Goal</h3><p>" + txt(p.goal) + "</p>" : "") +
      (p.did && p.did.length ? "<h3>What I did</h3>" + listHTML(p.did) : "") +
      (p.results && p.results.length ? "<h3>Results</h3>" + listHTML(p.results) : "") +
      (gallery ? '<h3>Gallery</h3><div class="gallery">' + gallery + "</div>" : "") +
      (links ? '<h3>Links</h3><ul class="links">' + links + "</ul>" : "")
    );
  }

  function initProjects(data) {
    var projects = data.projects || [];
    var byId = {};
    projects.forEach(function (p) { byId[p.id] = p; });

    var featured = projects.filter(function (p) { return p.featured; });
    var more = projects.filter(function (p) { return !p.featured; });
    $("#featured-grid").innerHTML = featured.map(cardHTML).join("");
    $("#more-grid").innerHTML = more.map(cardHTML).join("");
    if (!featured.length) $("#featured-h").parentNode.hidden = true;
    if (!more.length) $("#more-h").parentNode.hidden = true;

    var modal = $("#project-modal");
    var body = $("#modal-body");
    var lightbox = $("#lightbox");
    var lbImg = $("#lightbox-img");
    var lbCap = $("#lightbox-cap");
    var baseTitle = document.title;
    var lastTrigger = null;
    var pushedByCard = false;   // true if a card click added a history entry

    function currentId() {
      try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ""; }
    }

    function open(id) {
      var p = byId[id];
      if (!p) return;
      body.innerHTML = projectHTML(p);
      document.title = p.title + " | " + data.site.name;
      if (!modal.open) {
        modal.showModal();
        document.body.classList.add("modal-open");
      }
      modal.scrollTop = 0;
      modal.querySelector(".modal-close").focus();
    }

    function syncToHash() {
      var id = currentId();
      if (id && byId[id]) {
        open(id);
      } else {
        pushedByCard = false;
        if (modal.open) modal.close();
      }
    }

    // Card clicks: let the link set the hash (so the URL is shareable), then hashchange opens the modal.
    document.addEventListener("click", function (e) {
      var card = e.target.closest && e.target.closest(".card");
      if (!card) return;
      lastTrigger = card;
      pushedByCard = true;
      if (currentId() === card.dataset.id) { e.preventDefault(); open(card.dataset.id); }
    });

    window.addEventListener("hashchange", syncToHash);

    modal.querySelector(".modal-close").addEventListener("click", function () { modal.close(); });

    // Click on the backdrop (outside .modal-inner) closes.
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.close();
    });

    modal.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      document.title = baseTitle;
      var id = currentId();
      if (id && byId[id]) {
        if (pushedByCard) { pushedByCard = false; history.back(); }
        else history.replaceState(null, "", location.pathname + location.search);
      }
      var target = lastTrigger || document.querySelector('.card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
      if (target) target.focus();
      lastTrigger = null;
    });

    // Gallery -> lightbox
    body.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".gallery button");
      if (!b) return;
      lbImg.src = b.dataset.src;
      lbImg.alt = b.dataset.alt;
      lbCap.textContent = b.dataset.alt;
      lightbox.showModal();
      lightbox.querySelector(".modal-close").focus();
      lightbox._from = b;
    });
    lightbox.querySelector(".modal-close").addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === lbImg) lightbox.close();
    });
    lightbox.addEventListener("close", function () {
      if (lightbox._from) lightbox._from.focus();
    });

    // Deep link on load: projects.html#pendulum-robot
    syncToHash();
  }

  /* ---------- Home page ---------- */

  function initHome(data) {
    var h = data.home || {};
    $("#home-name").textContent = data.site.name;
    $("#home-headline").innerHTML = txt(h.headline || "");
    $("#home-intro").innerHTML = txt(h.intro || "");
    var featured = (data.projects || []).filter(function (p) { return p.featured; });
    if (!featured.length) $("#selected-h").parentNode.hidden = true;
    $("#selected").innerHTML = featured.map(function (p) {
      return (
        '<li><a href="projects.html#' + encodeURIComponent(p.id) + '">' + txt(p.title) + "</a>" +
        "<p>" + txt(p.summary) + (p.status ? ' <span class="card-status">(' + txt(p.status) + ")</span>" : "") + "</p></li>"
      );
    }).join("");
  }

  /* ---------- About page ---------- */

  function initAbout(data) {
    var a = data.about || {};
    var photo = $("#bio-photo");
    photo.src = a.photo || "";
    photo.alt = a.photoAlt || "";
    $("#bio-text").innerHTML = (a.bio || []).map(function (p) { return "<p>" + txt(p) + "</p>"; }).join("");

    // Timeline (renders in the order listed in content.json; keep newest first)
    var tl = $("#timeline");
    tl.innerHTML = (data.timeline || []).map(function (t, i) {
      var bid = "tl-body-" + i;
      var bullets = (t.bullets && t.bullets.length) ? t.bullets : ["TODO: details"];
      return (
        '<li class="tl-item" data-type="' + esc(t.type) + '">' +
        '<button type="button" class="tl-head" aria-expanded="false" aria-controls="' + bid + '">' +
        '<span class="tl-top"><span class="tl-dates">' + txt(t.dates) + "</span>" +
        '<span class="tl-type">' + (t.type === "education" ? "Education" : "Work") + "</span></span>" +
        '<span class="tl-org">' + txt(t.org) + "</span>" +
        '<span class="tl-role">' + txt(t.role) + "</span>" +
        '<span class="tl-loc">' + txt(t.location) + "</span>" +
        "</button>" +
        '<div class="tl-body" id="' + bid + '" hidden>' + listHTML(bullets) + "</div>" +
        "</li>"
      );
    }).join("");

    tl.addEventListener("click", function (e) {
      var head = e.target.closest && e.target.closest(".tl-head");
      if (!head) return;
      var openNow = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(openNow));
      document.getElementById(head.getAttribute("aria-controls")).hidden = !openNow;
    });

    // Filter
    var filterBtns = document.querySelectorAll(".filters button");
    Array.prototype.forEach.call(filterBtns, function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.dataset.filter;
        Array.prototype.forEach.call(filterBtns, function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        Array.prototype.forEach.call(tl.children, function (li) {
          li.hidden = !(f === "all" || li.dataset.type === f);
        });
      });
    });

    // Skills
    $("#skills").innerHTML = (data.skills || []).map(function (g) {
      return "<div><h3>" + txt(g.group) + "</h3>" + listHTML(g.items) + "</div>";
    }).join("");

    // Activities
    var acts = data.activities || [];
    var actBox = $("#activities");
    if (actBox) {
      if (!acts.length) actBox.parentNode.hidden = true;
      actBox.innerHTML = acts.map(function (a) {
        return '<li><span class="act-dates">' + txt(a.dates) + "</span> <strong>" + txt(a.org) + "</strong>, " + txt(a.role) + "</li>";
      }).join("");
    }

    // Contact
    var s = data.site;
    function shortUrl(u) { return u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }
    function linkOrTodo(u) {
      return isTodo(u) ? txt(u) : '<a href="' + esc(u) + '" rel="noopener">' + esc(shortUrl(u)) + "</a>";
    }
    $("#contact").innerHTML =
      '<li><span>Email</span><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a></li>" +
      "<li><span>LinkedIn</span>" + linkOrTodo(s.linkedin) + "</li>" +
      (s.github ? "<li><span>GitHub</span>" + linkOrTodo(s.github) + "</li>" : "") +
      '<li><span>Resume</span><a href="' + esc(s.resume || "resume.pdf") + '">PDF</a></li>';
  }

  /* ---------- Load ---------- */

  function showLoadError(err) {
    var box = $("#load-error");
    if (!box) return;
    box.hidden = false;
    var local = location.protocol === "file:";
    box.innerHTML =
      "<strong>Could not load <code>data/content.json</code>.</strong> " +
      (local
        ? "Browsers block reading local files from a page opened directly from disk. In this folder, run <code>python -m http.server 8000</code> and open <a href=\"http://localhost:8000\">http://localhost:8000</a>. On GitHub Pages this works without any extra step."
        : "Check that the file exists and is valid JSON (" + esc(err && err.message) + ").");
  }

  var page = document.body.dataset.page;

  fetch(CONTENT_URL, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      renderFooter(data.site || {});
      if (page === "home") initHome(data);
      if (page === "projects") initProjects(data);
      if (page === "about") initAbout(data);
    })
    .catch(function (err) {
      console.error(err);
      showLoadError(err);
    });
})();
