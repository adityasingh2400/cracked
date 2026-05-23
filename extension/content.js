// Content script — runs on LinkedIn profile pages and feed pages.
// Two responsibilities:
//   1. On a profile page (/in/*): inject a "⚡ Crack" button next to the
//      profile name. Click → read DOM → post payload → open cracked.com.
//   2. On a feed page (/feed/*): scan visible profile links, batch-query
//      /api/lookup, annotate each name with a tier badge.

(function () {
  "use strict";

  const CRACKED_BASE = "https://cracked-woad.vercel.app";

  // ============================================================
  // Profile-page button
  // ============================================================

  function isProfilePage() {
    return /\/in\/[^/]+\/?$/.test(window.location.pathname);
  }

  function injectCrackButton() {
    if (!isProfilePage()) return;
    if (document.querySelector(".cracked-ext-button")) return;

    const h1 = document.querySelector("h1");
    if (!h1) return;

    const btn = document.createElement("button");
    btn.className = "cracked-ext-button";
    btn.textContent = "⚡ Crack";
    btn.title = "Crack this profile on cracked.com";
    btn.addEventListener("click", crackCurrentProfile);
    h1.parentElement && h1.parentElement.appendChild(btn);
  }

  async function crackCurrentProfile() {
    const payload = await readProfileDOM();

    // If we got a photo URL, mirror it before dispatching (4s soft timeout)
    if (payload.photoUrl) {
      const mirrored = await Promise.race([
        mirrorPhoto(payload.photoUrl),
        new Promise((res) => setTimeout(() => res(null), 4000)),
      ]);
      payload.photoUrl = mirrored || undefined;
    }

    // Telemetry ping (silent).
    fetch(CRACKED_BASE + "/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldCounts: countFields(payload.signals) }),
      keepalive: true,
    }).catch(() => {});

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    window.open(CRACKED_BASE + "/c/from-bookmarklet?d=" + encoded, "_blank");
  }

  async function readProfileDOM() {
    // Same shape as the bookmarklet.
    function text(el) {
      return (el && el.textContent ? el.textContent.trim() : "").replace(/\s+/g, " ");
    }

    function findSection(headingTexts) {
      const headings = document.querySelectorAll("h2, h3, span[aria-hidden='true']");
      for (const h of headings) {
        const t = text(h).toLowerCase();
        for (const target of headingTexts) {
          if (t.indexOf(target) === 0) {
            let node = h;
            while (node && node !== document.body) {
              if (node.tagName === "SECTION" || node.tagName === "DIV") return node;
              node = node.parentElement;
            }
          }
        }
      }
      return null;
    }

    const name = text(document.querySelector("h1")) || "Profile";

    const expSection = findSection(["experience"]);
    const companies = [];
    if (expSection) {
      expSection.querySelectorAll("li").forEach((li) => {
        const t = text(li);
        if (!t || t.length < 5) return;
        const parts = t.split("·").map((p) => p.trim());
        const titleEl = li.querySelector("span[aria-hidden='true']") || li.querySelector("strong");
        const title = titleEl ? text(titleEl) : "";
        const company = parts.length > 1 ? parts[1] : parts[0];
        if (company) companies.push({ name: company, title: title || undefined });
      });
    }

    const eduSection = findSection(["education"]);
    const schools = [];
    if (eduSection) {
      eduSection.querySelectorAll("li").forEach((li) => {
        const t = text(li);
        if (!t || t.length < 5) return;
        const titleEl = li.querySelector("span[aria-hidden='true']") || li.querySelector("h3");
        const schoolName = titleEl ? text(titleEl) : t.split("·")[0];
        const yearMatch = t.match(/(19|20)\d{2}/g);
        const gradYear = yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : undefined;
        schools.push({ name: schoolName, gradYear });
      });
    }

    const awardsSection = findSection(["honors", "awards"]);
    const awards = [];
    if (awardsSection) {
      awardsSection.querySelectorAll("li").forEach((li) => {
        const t = text(li);
        if (t && t.length > 3) awards.push({ name: t.slice(0, 120) });
      });
    }

    const pubsSection = findSection(["publications"]);
    const publications = [];
    if (pubsSection) {
      pubsSection.querySelectorAll("li").forEach((li) => {
        const t = text(li);
        if (t && t.length > 5) publications.push({ venue: t.slice(0, 200) });
      });
    }

    const raw_text = text(document.querySelector("main") || document.body).slice(0, 18000);

    // Extract LinkedIn profile photo URL from DOM
    const photoUrl = extractPhotoUrl();

    return {
      name,
      signals: { schools, companies, awards, publications, funding: [], open_source: [], online: [], raw_text },
      source: "extension",
      extensionVersion: chrome.runtime.getManifest().version,
      photoUrl,
    };
  }

  function extractPhotoUrl() {
    const selectors = [
      "img.profile-photo-edit__preview",
      "img.pv-top-card-profile-picture__image",
      "img.profile-picture-edit__preview",
      "img[alt*='profile photo']",
      "button.pv-top-card-profile-picture__container img",
      "section.pv-top-card img.evi-image",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.src && /licdn\.com/.test(el.src)) return el.src;
    }
    return undefined;
  }

  async function mirrorPhoto(sourceUrl) {
    try {
      const r = await fetch(CRACKED_BASE + "/api/mirror-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl }),
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j.url || null;
    } catch {
      return null;
    }
  }

  function countFields(signals) {
    return {
      schools: signals.schools.length,
      companies: signals.companies.length,
      awards: signals.awards.length,
      publications: signals.publications.length,
    };
  }

  // ============================================================
  // Browse-mode tier badges on the LinkedIn feed
  // ============================================================

  function isFeedPage() {
    return window.location.pathname.startsWith("/feed");
  }

  function collectVisibleProfileLinks() {
    const links = document.querySelectorAll("a[href*='/in/']");
    const urls = new Set();
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const m = href.match(/\/in\/([a-zA-Z0-9-_]+)/);
      if (m) urls.add("linkedin.com/in/" + m[1]);
    });
    return Array.from(urls).slice(0, 50); // /api/lookup MAX_BATCH = 50
  }

  async function lookupTiers(urls) {
    if (urls.length === 0) return {};
    try {
      const qs = encodeURIComponent(urls.join(","));
      const res = await fetch(CRACKED_BASE + "/api/lookup?urls=" + qs);
      if (!res.ok) return {};
      const json = await res.json();
      return json.results || {};
    } catch {
      return {}; // silent degradation
    }
  }

  function badgeForTier(tier) {
    const badge = document.createElement("span");
    badge.className = "cracked-ext-tier-badge cracked-tier-" + tier.toLowerCase();
    badge.textContent = tier;
    badge.title = "cracked.com tier";
    return badge;
  }

  async function annotateFeed() {
    if (!isFeedPage()) return;
    const urls = collectVisibleProfileLinks();
    if (urls.length === 0) return;
    const results = await lookupTiers(urls);

    const links = document.querySelectorAll("a[href*='/in/']");
    links.forEach((a) => {
      if (a.dataset.crackedAnnotated === "true") return;
      const href = a.getAttribute("href") || "";
      const m = href.match(/\/in\/([a-zA-Z0-9-_]+)/);
      if (!m) return;
      const key = "linkedin.com/in/" + m[1];
      const entry = results[key];
      if (entry && entry.tier) {
        a.dataset.crackedAnnotated = "true";
        a.appendChild(badgeForTier(entry.tier));
      }
    });
  }

  // ============================================================
  // Wiring + observers
  // ============================================================

  injectCrackButton();
  annotateFeed();

  // LinkedIn is a SPA — observe DOM changes and re-run.
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(() => {
        injectCrackButton();
        annotateFeed();
      }, 800);
    } else {
      // Feed is virtualized — names come/go on scroll. Throttle.
      if (isFeedPage()) {
        clearTimeout(window.__crackedFeedTimer);
        window.__crackedFeedTimer = setTimeout(annotateFeed, 500);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
