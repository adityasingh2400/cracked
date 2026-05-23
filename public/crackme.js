// cracked.com bookmarklet — runs on linkedin.com/in/* in the user's logged-in
// browser session. Reads the rendered DOM, normalizes to ExtractedSignals
// shape, posts to cracked.com which renders the card.
//
// Selector strategy per /plan-eng-review Open Question #5: semantic anchors
// (section headings + text content) instead of brittle class names so the
// quarterly LinkedIn DOM rotation is tolerated. Includes telemetry ping so
// when selectors stop matching we know within hours.
//
// Privacy: only the user's own profile page DOM is read, in the user's own
// session. cracked.com never touches LinkedIn directly.
//
// To install: drag a link with this code as a javascript: URL to your bookmark
// bar. The landing page surfaces a draggable button.

(function () {
  "use strict";

  var CRACKED_BASE =
    (typeof window !== "undefined" && window.CRACKED_BASE) ||
    "https://cracked-woad.vercel.app";
  var VERSION = "1.0.0";

  // ---------- helpers ----------
  function textContent(el) {
    return (el && el.textContent ? el.textContent.trim() : "").replace(/\s+/g, " ");
  }

  function findSectionByHeading(headingTexts) {
    var headings = document.querySelectorAll("h2, h3, span[aria-hidden='true']");
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var t = textContent(h).toLowerCase();
      for (var j = 0; j < headingTexts.length; j++) {
        if (t.indexOf(headingTexts[j]) === 0) {
          // Climb to nearest section container.
          var node = h;
          while (node && node !== document.body) {
            if (node.tagName === "SECTION" || node.tagName === "DIV") {
              return node;
            }
            node = node.parentElement;
          }
        }
      }
    }
    return null;
  }

  function extractName() {
    // LinkedIn puts the profile name in an h1 with aria-hidden span sometimes.
    var h1 = document.querySelector("h1");
    if (h1) return textContent(h1);
    return "Profile";
  }

  function extractExperience() {
    var section = findSectionByHeading(["experience"]);
    if (!section) return [];
    var items = section.querySelectorAll("li");
    var out = [];
    items.forEach(function (li) {
      var allText = textContent(li);
      if (!allText || allText.length < 5) return;
      // Try to find a bold/title element.
      var titleEl =
        li.querySelector("span[aria-hidden='true']") ||
        li.querySelector("strong") ||
        li.querySelector("h3");
      var title = titleEl ? textContent(titleEl) : "";
      // Lines often: "Senior Engineer · Anthropic · 2024-Present"
      var parts = allText.split("·").map(function (p) { return p.trim(); });
      var company = parts.length > 1 ? parts[1] : parts[0];
      if (title && company) {
        out.push({ name: company, title: title });
      } else if (parts[0]) {
        out.push({ name: parts[0], title: undefined });
      }
    });
    return out;
  }

  function extractEducation() {
    var section = findSectionByHeading(["education"]);
    if (!section) return [];
    var items = section.querySelectorAll("li");
    var out = [];
    items.forEach(function (li) {
      var allText = textContent(li);
      if (!allText || allText.length < 5) return;
      var titleEl = li.querySelector("span[aria-hidden='true']") || li.querySelector("h3");
      var schoolName = titleEl ? textContent(titleEl) : allText.split("·")[0];
      // Look for year mentions.
      var yearMatch = allText.match(/(19|20)\d{2}/g);
      var gradYear = yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : undefined;
      out.push({ name: schoolName, gradYear: gradYear });
    });
    return out;
  }

  function extractAwards() {
    var section = findSectionByHeading(["honors", "awards", "honors & awards"]);
    if (!section) return [];
    var items = section.querySelectorAll("li");
    var out = [];
    items.forEach(function (li) {
      var t = textContent(li);
      if (t && t.length > 3) {
        var yearMatch = t.match(/(19|20)\d{2}/);
        out.push({ name: t.slice(0, 120), year: yearMatch ? parseInt(yearMatch[0]) : undefined });
      }
    });
    return out;
  }

  function extractPublications() {
    var section = findSectionByHeading(["publications"]);
    if (!section) return [];
    var items = section.querySelectorAll("li");
    var out = [];
    items.forEach(function (li) {
      var t = textContent(li);
      if (t && t.length > 5) {
        out.push({ venue: t.slice(0, 200) });
      }
    });
    return out;
  }

  function extractRawText() {
    var main = document.querySelector("main") || document.body;
    return textContent(main).slice(0, 18000);
  }

  // LinkedIn profile image lives in different selectors depending on the
  // current DOM version. Try multiple semantic anchors before giving up.
  function extractPhotoUrl() {
    var selectors = [
      "img.profile-photo-edit__preview",          // edit page
      "img.pv-top-card-profile-picture__image",   // older profile DOM
      "img.profile-picture-edit__preview",        // newer profile DOM
      "img[alt*='profile photo']",                // generic alt-text match
      "button.pv-top-card-profile-picture__container img",
      "section.pv-top-card img.evi-image",        // 2024 variant
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && el.src && /licdn\.com/.test(el.src)) {
        return el.src;
      }
    }
    return null;
  }

  // Mirror the LinkedIn photo URL to our stable hosting and return the
  // mirrored URL. Async. Resolves to null on any failure (silent fallback).
  function mirrorPhoto(sourceUrl) {
    return fetch(CRACKED_BASE + "/api/mirror-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl: sourceUrl }),
      mode: "cors",
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.url ? j.url : null; })
      .catch(function () { return null; });
  }

  function postTelemetry(fieldCounts) {
    try {
      fetch(CRACKED_BASE + "/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldCounts: fieldCounts }),
        keepalive: true,
        mode: "cors",
      }).catch(function () { /* swallow */ });
    } catch (e) { /* swallow */ }
  }

  // ---------- extract ----------
  var signals = {
    schools: extractEducation(),
    companies: extractExperience(),
    awards: extractAwards(),
    publications: extractPublications(),
    funding: [],
    open_source: [],
    online: [],
    raw_text: extractRawText(),
  };

  var fieldCounts = {
    schools: signals.schools.length,
    companies: signals.companies.length,
    awards: signals.awards.length,
    publications: signals.publications.length,
    raw_text_chars: Math.min(signals.raw_text.length, 999),
  };

  // Fire telemetry regardless of outcome (so we detect DOM rotations).
  postTelemetry(fieldCounts);

  // Selector-failure threshold: if fewer than 4 of 7 categories have ANY data,
  // surface a toast and link to paste-text fallback.
  var categoriesWithData = ["schools", "companies", "awards", "publications", "funding", "open_source", "online"]
    .filter(function (k) { return signals[k] && signals[k].length > 0; }).length;
  if (categoriesWithData < 4 && signals.raw_text.length < 500) {
    alert(
      "cracked.com couldn't read enough from your profile.\n\n" +
      "Most likely cause: LinkedIn updated their layout. You can paste your About + Experience as text instead — opening that page now."
    );
    window.location.href = CRACKED_BASE + "/?fallback=paste";
    return;
  }

  // ---------- send to cracked.com ----------
  var photoUrl = extractPhotoUrl();

  function dispatch(mirroredPhotoUrl) {
    var payload = {
      name: extractName(),
      signals: signals,
      source: "bookmarklet",
      bookmarkletVersion: VERSION,
      photoUrl: mirroredPhotoUrl || undefined,
    };
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    window.location.href = CRACKED_BASE + "/c/from-bookmarklet?d=" + encoded;
  }

  if (photoUrl) {
    // Mirror first (with a 4s soft timeout), then dispatch — even if mirroring
    // fails, dispatch proceeds with no photo (initials-only avatar fallback).
    var timer = setTimeout(function () { dispatch(null); }, 4000);
    mirrorPhoto(photoUrl).then(function (mirrored) {
      clearTimeout(timer);
      dispatch(mirrored);
    });
  } else {
    dispatch(null);
  }
})();
