// Service worker — extension background.
// MV3 doesn't keep persistent workers, but lookups are short-lived so we
// just respond to action button clicks. The content script does the heavy work.

chrome.runtime.onInstalled.addListener(() => {
  console.log("cracked.com extension installed.");
});

// Forward popup → content script messages when needed.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.kind === "crackActiveTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].id) {
        sendResponse({ ok: false, error: "No active tab." });
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            // Same as content.js's crackCurrentProfile — invoked from popup.
            const btn = document.querySelector(".cracked-ext-button");
            if (btn) (btn as HTMLButtonElement).click();
          },
        },
        () => sendResponse({ ok: true })
      );
    });
    return true; // async response
  }
  return false;
});
