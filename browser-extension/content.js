// MarketPilot AI Browser Extension - Content Script
// This script runs on web pages and can extract content

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  } else if (request.action === 'getPageInfo') {
    sendResponse({
      title: document.title,
      url: window.location.href,
    });
  }
  return true;
});

// You can add more content extraction logic here
// For example, extracting images, links, etc.

