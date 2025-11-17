// DOM Elements
const enableToggle = document.getElementById("enableToggle");
const smoothToggle = document.getElementById("smoothToggle");
const dirDown = document.getElementById("dirDown");
const dirUp = document.getElementById("dirUp");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const smoothText = document.getElementById("smoothText");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const quickToggleBtn = document.getElementById("quickToggleBtn");

// Current settings
let currentSettings = {
  enabled: false,
  smooth: true,
  direction: "down",
  speed: 2,
};

// Load settings on popup open
document.addEventListener("DOMContentLoaded", () => {
  loadSettingsFromStorage();
});

// Load settings from Chrome sync storage
function loadSettingsFromStorage() {
  chrome.storage.sync.get(
    ["scrollEnabled", "scrollSmooth", "scrollDirection", "scrollSpeed"],
    (result) => {
      currentSettings.enabled = result.scrollEnabled || false;
      currentSettings.smooth = result.scrollSmooth !== false;
      currentSettings.direction = result.scrollDirection || "down";
      currentSettings.speed = result.scrollSpeed || 2;

      updateUI();
    }
  );
}

// Update UI to reflect current settings
function updateUI() {
  enableToggle.checked = currentSettings.enabled;
  smoothToggle.checked = currentSettings.smooth;
  speedSlider.value = currentSettings.speed;
  speedValue.textContent = currentSettings.speed + "x";
  smoothText.textContent = currentSettings.smooth
    ? "Smooth scrolling enabled"
    : "Instant scrolling";

  // Update direction buttons
  if (currentSettings.direction === "down") {
    dirDown.classList.add("active");
    dirUp.classList.remove("active");
  } else {
    dirUp.classList.add("active");
    dirDown.classList.remove("active");
  }

  // Update status indicator
  updateStatusIndicator();

  // Disable/enable controls based on auto-scroll state
  disableControls();
}

// Update status indicator
function updateStatusIndicator() {
  if (currentSettings.enabled) {
    statusDot.classList.add("active");
    statusText.textContent = "✅ Auto-Scroll: ON";
  } else {
    statusDot.classList.remove("active");
    statusText.textContent = "⛔ Auto-Scroll: OFF";
  }
}

// Disable controls when auto-scroll is off
function disableControls() {
  const settingItems = document.querySelectorAll(".setting-item");

  settingItems.forEach((item, index) => {
    // First item is the enable toggle, so don't disable it
    if (index === 0) return;

    if (currentSettings.enabled) {
      item.classList.remove("disabled");
      const inputs = item.querySelectorAll("input, button");
      inputs.forEach((input) => (input.disabled = false));
    } else {
      item.classList.add("disabled");
      const inputs = item.querySelectorAll("input, button");
      inputs.forEach((input) => (input.disabled = true));
    }
  });
}

// Enable/Disable toggle
enableToggle.addEventListener("change", (e) => {
  currentSettings.enabled = e.target.checked;
  saveSettings();
  updateUI();

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs
        .sendMessage(tabs[0].id, {
          action: "toggleScroll",
          enabled: currentSettings.enabled,
        })
        .catch((err) => console.log("Could not send message:", err));
    }
  });
});

// Smooth vs Instant toggle
smoothToggle.addEventListener("change", (e) => {
  currentSettings.smooth = e.target.checked;
  smoothText.textContent = currentSettings.smooth
    ? "Smooth scrolling enabled"
    : "Instant scrolling";
  saveSettings();
  updateSettings();
});

// Direction buttons
dirDown.addEventListener("click", () => {
  currentSettings.direction = "down";
  updateUI();
  saveSettings();
  updateSettings();
});

dirUp.addEventListener("click", () => {
  currentSettings.direction = "up";
  updateUI();
  saveSettings();
  updateSettings();
});

// Speed slider
speedSlider.addEventListener("input", (e) => {
  currentSettings.speed = parseInt(e.target.value);
  speedValue.textContent = currentSettings.speed + "x";
  saveSettings();
  updateSettings();
});

// Quick toggle button
quickToggleBtn.addEventListener("click", () => {
  currentSettings.enabled = !currentSettings.enabled;
  enableToggle.checked = currentSettings.enabled;
  saveSettings();
  updateUI();

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs
        .sendMessage(tabs[0].id, {
          action: "toggleScroll",
          enabled: currentSettings.enabled,
        })
        .catch((err) => console.log("Could not send message:", err));
    }
  });
});

// Save settings to Chrome sync storage
function saveSettings() {
  chrome.storage.sync.set({
    scrollEnabled: currentSettings.enabled,
    scrollSmooth: currentSettings.smooth,
    scrollDirection: currentSettings.direction,
    scrollSpeed: currentSettings.speed,
  });
}

// Send updated settings to content script
function updateSettings() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs
        .sendMessage(tabs[0].id, {
          action: "updateSettings",
          smooth: currentSettings.smooth,
          direction: currentSettings.direction,
          speed: currentSettings.speed,
        })
        .catch((err) => console.log("Could not send message:", err));
    }
  });
}
