// MarketPilot AI Browser Extension - Popup Script

const API_URL_KEY = 'marketpilot_api_url';
const DEFAULT_API_URL = 'http://localhost:3000';

// Load saved API URL
async function loadApiUrl() {
  const result = await chrome.storage.sync.get([API_URL_KEY]);
  return result[API_URL_KEY] || DEFAULT_API_URL;
}

// Save API URL
async function saveApiUrl(url) {
  await chrome.storage.sync.set({ [API_URL_KEY]: url });
}

// Show status message
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

// Get selected text from current tab
async function getSelectedText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return window.getSelection().toString();
      }
    });
    return results[0]?.result || '';
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

// Get page title and URL
async function getPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return {
      title: tab.title,
      url: tab.url
    };
  } catch (error) {
    console.error('Error getting page info:', error);
    return { title: '', url: '' };
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const contentTextarea = document.getElementById('content');
  const platformSelect = document.getElementById('platform');
  const saveButton = document.getElementById('save');
  const settingsLink = document.getElementById('settingsLink');

  // Load API URL
  const apiUrl = await loadApiUrl();
  if (apiUrl !== DEFAULT_API_URL) {
    // Show current API URL in settings link
    settingsLink.textContent = `API: ${new URL(apiUrl).hostname}`;
  }

  // Try to pre-fill content from selected text
  const selectedText = await getSelectedText();
  if (selectedText) {
    contentTextarea.value = selectedText;
  } else {
    // Try to get page info
    const pageInfo = await getPageInfo();
    if (pageInfo.title) {
      contentTextarea.value = `Check this out: ${pageInfo.title}\n${pageInfo.url}`;
    }
  }

  // Save post
  saveButton.addEventListener('click', async () => {
    const content = contentTextarea.value.trim();
    const platform = platformSelect.value;

    if (!content) {
      showStatus('Please enter post content', 'error');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
      const apiUrl = await loadApiUrl();
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platform,
          status: 'draft',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: new Date().toTimeString().slice(0, 5),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      showStatus('Post saved successfully!', 'success');
      contentTextarea.value = '';
      
      // Optionally open the dashboard
      setTimeout(() => {
        chrome.tabs.create({ url: `${apiUrl}/dashboard/scheduler` });
      }, 1000);
    } catch (error) {
      console.error('Error saving post:', error);
      showStatus(error.message || 'Failed to save post. Check API URL in settings.', 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Post';
    }
  });

  // Settings link
  settingsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const apiUrl = await loadApiUrl();
    const newUrl = prompt('Enter MarketPilot AI API URL:', apiUrl);
    if (newUrl) {
      try {
        new URL(newUrl); // Validate URL
        await saveApiUrl(newUrl);
        showStatus('API URL saved!', 'success');
        settingsLink.textContent = `API: ${new URL(newUrl).hostname}`;
      } catch (error) {
        showStatus('Invalid URL format', 'error');
      }
    }
  });
});

