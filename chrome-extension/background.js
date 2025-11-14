// Background service worker for Chrome extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI SEO Ecosystem extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  // Popup will handle this, but we can add logic here if needed
});

