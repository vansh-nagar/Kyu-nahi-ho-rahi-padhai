// DOM Elements
const toggleButton = document.getElementById("toggleButton");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

let isEnabled = true;

// Load settings on popup open
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
});

// Load settings from Chrome sync storage
function loadSettings() {
  chrome.storage.sync.get(["thumbnailEnabled"], (result) => {
    isEnabled =
      result.thumbnailEnabled !== undefined ? result.thumbnailEnabled : true;
    updateUI();
  });
}

// Update UI
function updateUI() {
  if (toggleButton) {
    toggleButton.checked = isEnabled;
  }
  updateStatus();
}

// Update status indicator
function updateStatus() {
  if (statusDot) {
    if (isEnabled) {
      statusDot.classList.remove("inactive");
      statusText.textContent = "✅ Thumbnails: ON";
    } else {
      statusDot.classList.add("inactive");
      statusText.textContent = "⛔ Thumbnails: OFF";
    }
  }
}

// Toggle button listener
if (toggleButton) {
  toggleButton.addEventListener("change", (e) => {
    isEnabled = e.target.checked;

    // Save to storage
    chrome.storage.sync.set({ thumbnailEnabled: isEnabled });

    // Update UI immediately
    updateStatus();

    // Send message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "toggleThumbnail", enabled: isEnabled },
          () => {
            // Ignore errors
          }
        );
      });
    });
  });
}
