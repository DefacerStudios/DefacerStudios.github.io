// Defacer Studios: small progressive enhancements. The site works without this file.
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. The hero wordmark re-cuts along the pointer: the slash passes through the
  //    pointer at the logo's usual angle. Tap or click replays the cut.
  var cut = document.querySelector(".hero .cut");
  if (cut && !reduce) {
    var SLOPE = 0.58; // Height fraction the cut drops across the full width.
    var clamp = function (v) { return Math.max(4, Math.min(96, v)); };
    cut.addEventListener("pointermove", function (e) {
      var r = cut.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      cut.style.setProperty("--l", clamp((y + SLOPE * x) * 100) + "%");
      cut.style.setProperty("--r", clamp((y - SLOPE * (1 - x)) * 100) + "%");
    });
    cut.addEventListener("pointerleave", function () {
      cut.style.removeProperty("--l");
      cut.style.removeProperty("--r");
    });
    cut.addEventListener("click", function () {
      cut.classList.remove("recut");
      void cut.offsetWidth; // Restart the animation.
      cut.classList.add("recut");
    });
  }

  // 2. Game cards with a preview clip play it on hover (mouse) or while on screen
  //    (touch). Never with reduced motion: the still art stays.
  var cards = document.querySelectorAll(".game-card video");
  if (cards.length && !reduce) {
    var hover = window.matchMedia("(hover: hover)").matches;
    cards.forEach(function (video) {
      var card = video.closest(".game-card");
      var play = function () { video.preload = "auto"; var p = video.play(); if (p) p.catch(function () {}); card.classList.add("playing"); };
      var stop = function () { video.pause(); card.classList.remove("playing"); };
      if (hover) {
        card.addEventListener("pointerenter", play);
        card.addEventListener("pointerleave", stop);
        card.addEventListener("focus", play);
        card.addEventListener("blur", stop);
      } else if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.intersectionRatio >= 0.6) play(); else stop(); });
        }, { threshold: [0, 0.6] }).observe(card);
      }
    });
  }

  // 4. The news strip shows the latest post titles from /news/feed.json (made by
  //    Jekyll on GitHub Pages). Without it, the strip keeps its written text.
  var strip = document.querySelector(".strip-inner[data-feed]");
  if (strip && window.fetch) {
    fetch(strip.getAttribute("data-feed"))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (feed) {
        if (!feed || !feed.posts || !feed.posts.length) return;
        // The latest two headlines take the place of the first written item; the
        // rest of the strip stays as written.
        var first = strip.querySelector("span");
        if (!first) return;
        var frag = document.createDocumentFragment();
        feed.posts.slice(0, 2).forEach(function (post, i) {
          if (i) { var mark = document.createElement("i"); mark.setAttribute("aria-hidden", "true"); frag.appendChild(mark); }
          var a = document.createElement("a");
          a.href = post.url;
          a.textContent = post.title;
          frag.appendChild(a);
        });
        strip.replaceChild(frag, first);
      })
      .catch(function () {});
  }
})();
