/* House of Legends: site behaviour.
   Everything here is an enhancement. Without JavaScript every page still reads top to bottom. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CFG = window.HOL || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------------- header: solid after the hero starts to scroll, hides on the way down ---------------- */
  var hdr = $("[data-header]");
  var lastY = window.scrollY;
  var ticking = false;

  function headerOffset() {
    if (!hdr || hdr.classList.contains("is-hidden")) return 0;
    return hdr.getBoundingClientRect().height;
  }

  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle("is-solid", y > 40);
      var goingDown = y > lastY;
      if (y > 420 && goingDown && Math.abs(y - lastY) > 4) hdr.classList.add("is-hidden");
      else if (!goingDown && Math.abs(y - lastY) > 4) hdr.classList.remove("is-hidden");
      if (y < 120) hdr.classList.remove("is-hidden");
    }
    doc.style.setProperty("--sub-top", (hdr && !hdr.classList.contains("is-hidden") && y > 40 ? headerOffset() : 0) + "px");
    lastY = y;
    parallax();
    threads();
    progress();
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", function () { window.requestAnimationFrame(onScroll); });

  /* ---------------- mobile menu ---------------- */
  var menu = $("#menu");
  var menuBtn = $("[data-menu-open]");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("menu-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    $$(".menu__nav a", menu).forEach(function (a, i) {
      a.style.transitionDelay = open ? (80 + i * 45) + "ms" : "0ms";
      a.tabIndex = open ? 0 : -1;
    });
    if (open) { var c = $("[data-menu-close]", menu); if (c) c.focus(); }
    else if (menuBtn) menuBtn.focus();
  }
  if (menu) {
    $$(".menu__nav a", menu).forEach(function (a) { a.tabIndex = -1; });
    if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(true); });
    $$("[data-menu-close]", menu).forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
      if (e.key === "Tab" && menu.classList.contains("is-open")) {
        var f = $$("a,button", menu).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealables = $$("[data-reveal],[data-reveal-group],.hthread,.unveil");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealables.forEach(function (el) {
      // an unveiling image is clipped to nothing until it reveals, so watch its frame instead
      if (el.classList.contains("unveil")) {
        var watch = new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) { el.classList.add("in"); watch.disconnect(); }
        }, { threshold: 0.05 });
        watch.observe(el.parentElement);
      } else io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }
  function sizeThreads() {
    $$(".hthread").forEach(function (t) {
      var can = t.scrollWidth > t.clientWidth + 4;
      t.classList.toggle("is-scrollable", can);
      t.classList.toggle("at-end", can && t.scrollLeft + t.clientWidth >= t.scrollWidth - 8);
    });
  }
  $$(".hthread").forEach(function (t) {
    t.addEventListener("scroll", sizeThreads, { passive: true });
  });
  window.addEventListener("resize", sizeThreads);
  window.addEventListener("load", sizeThreads);
  sizeThreads();
  $$(".hthread").forEach(function (t) {
    $$("li:not(.line)", t).forEach(function (li, i) {
      $$(".dot,.yr,.txt", li).forEach(function (el) { el.style.setProperty("--i", i); });
    });
  });

  /* ---------------- motifs drift slowly against the scroll ---------------- */
  var drifts = $$("[data-drift]");
  function parallax() {
    if (reduce || !drifts.length) return;
    var vh = window.innerHeight;
    drifts.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      var k = parseFloat(el.getAttribute("data-drift")) || 0.08;
      var mid = box.top + box.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (-mid * k).toFixed(1) + "px,0)";
    });
  }

  /* ---------------- vertical threads fill as you read ---------------- */
  var thrs = $$(".thr");
  thrs.forEach(function (t) {
    var f = document.createElement("span");
    f.className = "thr__fill";
    f.setAttribute("aria-hidden", "true");
    t.insertBefore(f, t.firstChild);
  });
  function threads() {
    if (!thrs.length) return;
    var line = window.innerHeight * 0.62;
    thrs.forEach(function (t) {
      var r = t.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      var h = Math.max(0, Math.min(r.height - 10, line - r.top - 10));
      $(".thr__fill", t).style.height = h + "px";
      $$(".yr", t).forEach(function (y) {
        y.classList.toggle("on", y.getBoundingClientRect().top + 18 < line);
      });
    });
  }

  /* ---------------- reading progress ---------------- */
  var bar = $("[data-progress]");
  function progress() {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
  }

  /* ---------------- sticky sub navigation follows the chapter you are in ---------------- */
  $$("[data-subnav]").forEach(function (nav) {
    var links = $$("a[href^='#']", nav);
    var map = {};
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) map[s.id] = a; });
    if (!("IntersectionObserver" in window)) return;
    var current = null;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (current) current.classList.remove("on");
          current = map[en.target.id];
          if (current) {
            current.classList.add("on");
            var box = nav.firstElementChild;
            if (box && box.scrollWidth > box.clientWidth) {
              box.scrollTo({ left: current.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
            }
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { so.observe(document.getElementById(id)); });
  });

  /* ---------------- "Ask us about this work" ---------------- */
  $$("[data-ask]").forEach(function (box) {
    var openBtn = $("[data-ask-open]", box), closeBtn = $("[data-ask-close]", box);
    var intro = $("[data-ask-intro]", box), form = $("form", box);
    if (openBtn) openBtn.addEventListener("click", function () { intro.hidden = true; form.hidden = false; var f = $("input,textarea", form); if (f) f.focus(); });
    if (closeBtn) closeBtn.addEventListener("click", function () { form.hidden = true; intro.hidden = false; openBtn.focus(); });
  });

  /* ---------------- Write to us: who is writing ---------------- */
  $$("[data-roles]").forEach(function (group) {
    var form = group.closest("form");
    var chips = $$(".chip", group);
    var note = $("[data-role-note]", form), msgLab = $("[data-role-msg]", form);
    function pick(chip) {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      var role = chip.getAttribute("data-role");
      if (note) note.textContent = chip.getAttribute("data-note") || "";
      if (msgLab) msgLab.textContent = chip.getAttribute("data-msg") || "Your letter";
      $$("[data-for-role]", form).forEach(function (fs) { fs.hidden = fs.getAttribute("data-for-role") !== role; });
      var hidden = $("input[name='writing_as']", form);
      if (hidden) hidden.value = chip.textContent.trim();
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { pick(c); }); });
    var preset = (location.hash.match(/as=([a-z]+)/) || [])[1];
    var first = chips.filter(function (c) { return c.getAttribute("data-role") === preset; })[0] || chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0] || chips[0];
    if (first) pick(first);
  });

  /* ---------------- forms: send to the gallery ----------------
     If a form service address is set (window.HOL.endpoint), letters are posted there.
     Until then, the visitor's own email app opens with the letter written out, addressed to the gallery. */
  $$("form[data-form]").forEach(function (form) {
    if (!CFG.endpoint) {
      $$("[data-needs-endpoint]", form).forEach(function (el) { el.hidden = true; });
      $$("[data-no-endpoint]", form).forEach(function (el) { el.hidden = false; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $(".form-err", form);
      if (err) err.remove();
      $$(".bad", form).forEach(function (el) { el.classList.remove("bad"); });
      var bad = $$("[required]", form).filter(function (i) {
        if (i.closest("[hidden]")) return false;
        var v = (i.value || "").trim();
        return !v || (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      });
      if (bad.length) {
        bad.forEach(function (b) { b.classList.add("bad"); });
        var p = document.createElement("p");
        p.className = "form-err";
        p.setAttribute("role", "alert");
        p.textContent = bad[0].type === "email" ? "Please check your email address, so we can write back." : "Please fill in the field marked in red.";
        var sub = $("[type=submit]", form);
        (sub ? sub.parentNode : form).appendChild(p);
        bad[0].focus();
        return;
      }
      var kind = form.getAttribute("data-form");
      var data = new FormData(form);
      $$("[hidden] input,[hidden] textarea", form).forEach(function (i) { if (i.name) data.delete(i.name); });
      data.append("form", kind);
      data.append("page", location.pathname);

      if (CFG.endpoint) {
        var btn = $("[type=submit]", form);
        if (btn) btn.disabled = true;
        fetch(CFG.endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(form); })
          .catch(function () {
            if (btn) btn.disabled = false;
            var p = document.createElement("p");
            p.className = "form-err";
            p.setAttribute("role", "alert");
            p.innerHTML = "Something went wrong on our side. Please try again, or write to us at <a href=\"mailto:" + CFG.email + "\">" + CFG.email + "</a>.";
            (btn ? btn.parentNode : form).appendChild(p);
          });
      } else {
        var subject = form.getAttribute("data-subject") || "A letter from the website";
        var lines = [];
        data.forEach(function (v, k) {
          if (typeof v !== "string" || !v.trim() || k === "form" || k === "page" || k === "_gotcha") return;
          var lab = form.querySelector("[name='" + k + "']");
          var labelEl = lab && lab.id ? form.querySelector("label[for='" + lab.id + "']") : null;
          var name = labelEl ? labelEl.textContent.trim() : k.replace(/_/g, " ");
          lines.push(name + ": " + v.trim());
        });
        var href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n\n"));
        window.location.href = href;
        done(form, true);
      }
    });
  });
  function done(form, viaMail) {
    var sent = form.parentNode.querySelector("[data-sent]");
    form.hidden = true;
    if (sent) {
      if (viaMail) { var m = $("[data-sent-mail]", sent); if (m) m.hidden = false; }
      sent.hidden = false;
      sent.setAttribute("tabindex", "-1");
      sent.focus({ preventScroll: true });
      sent.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
  }

  /* ---------------- year in footer ---------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  onScroll();
})();
