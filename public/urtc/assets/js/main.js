/* ==========================================================================
   Stanford URTC — site behavior
   - Mobile navigation
   - Fills links/text from config.js
   - Interest-list form
   - Generative "Frontiers" art: topographic contours + ridgeline landscape
   - Scroll reveals and subtle pointer parallax
   Everything decorative respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var cfg = window.URTC_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------------------------------------------------------------------- */
  /* Mobile navigation                                                       */
  /* ---------------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Config-driven links and text                                            */
  /*   <a data-config-href="contactEmail" href="fallback.html">              */
  /*   <span data-config-text="contactEmail">Coming soon</span>              */
  /* ---------------------------------------------------------------------- */
  function configValue(key) {
    return String(cfg[key] || "").trim();
  }

  document.querySelectorAll("[data-config-href]").forEach(function (el) {
    var key = el.getAttribute("data-config-href");
    var value = configValue(key);
    if (!value) {
      el.classList.add("is-pending");
      if (el.hasAttribute("data-pending-disable")) {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("role", "link");
      }
      return;
    }
    var isEmail = /Email$/.test(key);
    el.href = isEmail ? "mailto:" + value : value;
    if (!isEmail && /^https?:/i.test(value)) {
      el.target = "_blank";
      el.rel = "noopener";
    }
    var label = el.getAttribute("data-ready-label");
    var labelTarget = el.querySelector("[data-label]");
    if (label && labelTarget) labelTarget.textContent = label;
  });

  document.querySelectorAll("[data-config-text]").forEach(function (el) {
    var value = configValue(el.getAttribute("data-config-text"));
    if (value) el.textContent = value;
  });

  /* ---------------------------------------------------------------------- */
  /* Interest-list form                                                      */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll("form[data-interest-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    var email = form.elements.email;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!email.value.trim() || !email.checkValidity()) {
        email.setAttribute("aria-invalid", "true");
        status.textContent = "Please enter a valid email address.";
        email.focus();
        return;
      }
      email.removeAttribute("aria-invalid");

      // Honeypot: bots fill hidden fields, people don't.
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      var endpoint = configValue("interestFormEndpoint");
      if (!endpoint) {
        status.textContent =
          "Thanks for your interest! Sign-ups aren't open quite yet. Please check back soon.";
        return;
      }

      button.disabled = true;
      status.textContent = "Adding you to the list…";

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          status.textContent = "You're on the list. We'll be in touch when there's news.";
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please try again in a moment.";
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Generative art helpers                                                  */
  /* ---------------------------------------------------------------------- */

  // Small seeded PRNG so the art is identical on every load.
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  // 1-D value noise with smoothstep, layered into fractal noise.
  function makeNoise(rand) {
    var size = 256;
    var table = [];
    for (var i = 0; i < size; i++) table.push(rand());
    function n(x) {
      var i0 = Math.floor(x);
      var f = x - i0;
      var t = f * f * (3 - 2 * f);
      var a = table[((i0 % size) + size) % size];
      var b = table[(((i0 + 1) % size) + size) % size];
      return a + (b - a) * t;
    }
    return function fbm(x) {
      return n(x) * 0.6 + n(x * 2.1 + 17) * 0.28 + n(x * 4.3 + 41) * 0.12;
    };
  }

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* Topographic contours: <svg data-contours="seed" data-rings="16"> */
  function drawContours(svg) {
    var rand = rng(parseInt(svg.getAttribute("data-contours"), 10) || 7);
    var rings = parseInt(svg.getAttribute("data-rings"), 10) || 16;
    var cx = parseFloat(svg.getAttribute("data-cx")) || 300;
    var cy = parseFloat(svg.getAttribute("data-cy")) || 300;
    var maxR = 290;
    var harmonics = [];
    for (var h = 0; h < 5; h++) {
      harmonics.push({ k: h + 2, a: (0.03 + rand() * 0.07) / (1 + h * 0.6), p: rand() * Math.PI * 2 });
    }
    var driftX = (rand() - 0.5) * 3;
    var driftY = (rand() - 0.5) * 3;
    var steps = 160;
    var frag = document.createDocumentFragment();

    for (var i = 1; i <= rings; i++) {
      var base = (i / rings) * maxR;
      var ox = cx + driftX * i;
      var oy = cy + driftY * i;
      var d = "";
      for (var s = 0; s <= steps; s++) {
        var th = (s / steps) * Math.PI * 2;
        var r = 1;
        for (var j = 0; j < harmonics.length; j++) {
          var hm = harmonics[j];
          r += hm.a * Math.sin(hm.k * th + hm.p + i * 0.18) * (0.5 + i / rings);
        }
        var x = ox + Math.cos(th) * base * r;
        var y = oy + Math.sin(th) * base * r * 0.92;
        d += (s ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      // Every fifth line is an "index contour", as on a survey map.
      frag.appendChild(el("path", { d: d + "Z", class: i % 5 === 0 ? "is-index" : "" }));
    }
    svg.appendChild(frag);
  }

  /* Ridgeline landscape: <svg data-ridges="seed" data-lines="14" data-animate> */
  function drawRidges(svg) {
    var rand = rng(parseInt(svg.getAttribute("data-ridges"), 10) || 11);
    var noise = makeNoise(rand);
    var lines = parseInt(svg.getAttribute("data-lines"), 10) || 14;
    var W = 1440, H = 260, pts = 96;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");

    var paths = [];
    for (var j = 0; j < lines; j++) {
      var p = el("path", {});
      // One ridge, near the front, is drawn in cardinal: "the frontier".
      if (j === lines - 3) p.setAttribute("class", "is-frontier");
      p.style.strokeOpacity = (0.18 + (j / lines) * 0.62).toFixed(2);
      svg.appendChild(p);
      paths.push(p);
    }

    function render(t) {
      for (var j = 0; j < lines; j++) {
        var baseY = 30 + (j / (lines - 1)) * (H - 46);
        var amp = 46 + j * 3.2;
        var d = "M0 " + H;
        for (var i = 0; i <= pts; i++) {
          var u = i / pts;
          // Envelope: peaks rise toward the right, like a far range.
          var env = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * (0.15 + u * 0.8)), 1.6);
          var y = baseY - amp * env * noise(u * 6 + j * 0.53 + t);
          d += "L" + (u * W).toFixed(1) + " " + y.toFixed(1);
        }
        paths[j].setAttribute("d", d + "L" + W + " " + H + "Z");
      }
    }

    render(0);

    if (reduceMotion || !svg.hasAttribute("data-animate")) return;

    var t = 0, last = 0, visible = true, raf = null;
    function tick(now) {
      raf = null;
      if (!visible || document.hidden) return;
      if (now - last > 33) { // ~30 fps is plenty for a slow drift
        t += 0.0035;
        render(t);
        last = now;
      }
      raf = requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      }).observe(svg);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick);
    });
    raf = requestAnimationFrame(tick);
  }

  document.querySelectorAll("svg[data-contours]").forEach(drawContours);
  document.querySelectorAll("svg[data-ridges]").forEach(drawRidges);

  /* ---------------------------------------------------------------------- */
  /* Pointer parallax on the hero art                                        */
  /* ---------------------------------------------------------------------- */
  var hero = document.querySelector("[data-parallax]");
  if (hero && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var art = hero.querySelector(".hero-art");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      art.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", function () {
      art.style.setProperty("--px", 0);
      art.style.setProperty("--py", 0);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll reveals                                                          */
  /* ---------------------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (n) { n.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------------------- */
  /* Section rail: highlight the section in view                             */
  /* ---------------------------------------------------------------------- */
  var rail = document.querySelector("[data-rail]");
  if (rail && "IntersectionObserver" in window) {
    var railLinks = rail.querySelectorAll("a[href^='#']");
    var setActive = function (id) {
      railLinks.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    var railIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    railLinks.forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) railIO.observe(target);
    });
  }

  /* Floating pill: hide once the interest-list section is on screen */
  var pill = document.querySelector("[data-float-pill]");
  var pillTarget = pill && document.querySelector(pill.getAttribute("href"));
  if (pill && pillTarget && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      pill.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(pillTarget);
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (n) {
    n.textContent = new Date().getFullYear();
  });
})();
