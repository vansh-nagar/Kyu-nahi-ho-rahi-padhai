// Your custom image
const customImage = chrome.runtime.getURL("images/gg.jpg");

let thumbnailEnabled = true;
const replacedThumbnails = new Set(); // Track which images we've replaced

// Load settings from Chrome sync storage
function loadSettings() {
  chrome.storage.sync.get(["thumbnailEnabled"], (result) => {
    thumbnailEnabled =
      result.thumbnailEnabled !== undefined ? result.thumbnailEnabled : true;
    console.log("Settings loaded:", { thumbnailEnabled });

    if (thumbnailEnabled) {
      replaceThumbnails();
    }
  });
}

// Save settings to Chrome sync storage
function saveSettings() {
  chrome.storage.sync.set({ thumbnailEnabled });
}

// Restore original thumbnails (when disabled)
function restoreThumbnails() {
  console.log("Restoring original thumbnails...");
  let count = 0;

  // Find ALL images that have data-original-src (regardless of Set state)
  const allImages = document.querySelectorAll("img[data-original-src]");
  console.log("Found " + allImages.length + " images with data-original-src");

  allImages.forEach((imgElement) => {
    const originalSrc = imgElement.getAttribute("data-original-src");
    const originalSrcSet = imgElement.getAttribute("data-original-srcset");

    if (originalSrc) {
      try {
        imgElement.src = originalSrc;
        if (originalSrcSet && originalSrcSet !== "") {
          imgElement.srcset = originalSrcSet;
        } else {
          imgElement.removeAttribute("srcset");
        }
        console.log("Restored thumbnail from:", originalSrc);
        count++;
      } catch (e) {
        console.error("Error restoring thumbnail:", e);
      }
    }
  });

  console.log("Restored " + count + " thumbnails");
}

// Thumbnail replacement function
function replaceThumbnails() {
  console.log("Replacing thumbnails... enabled:", thumbnailEnabled);
  if (!thumbnailEnabled) {
    console.log("Thumbnails disabled, skipping replacement");
    return;
  }

  const thumbnails = document.querySelectorAll("img");
  let count = 0;

  thumbnails.forEach((img) => {
    if (img.src.includes("ytimg.com") || img.src.includes("i.ytimg.com")) {
      // Store original src before replacing
      if (!img.hasAttribute("data-original-src")) {
        img.setAttribute("data-original-src", img.src);
        img.setAttribute("data-original-srcset", img.srcset || "");
        replacedThumbnails.add(img); // Track this image
      }
      try {
        img.src = customImage;
        img.srcset = customImage;
        count++;
      } catch (e) {
        console.error("Error replacing thumbnail:", e);
      }
    }
  });

  console.log("Replaced " + count + " thumbnails");
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.action === "toggleThumbnail") {
    thumbnailEnabled = request.enabled;
    console.log("Toggle received, thumbnailEnabled:", thumbnailEnabled);
    saveSettings();

    // Immediately apply the change
    if (thumbnailEnabled) {
      console.log("Enabling thumbnails replacement...");
      replaceThumbnails();
    } else {
      console.log("Disabling thumbnails, restoring originals...");
      restoreThumbnails();
    }
  }

  sendResponse({ success: true });
  return true;
});

// Initial load
loadSettings();

// Watch for dynamic loads - this will handle new thumbnails as they load
let mutationTimeout;
new MutationObserver(() => {
  clearTimeout(mutationTimeout);
  mutationTimeout = setTimeout(() => {
    if (thumbnailEnabled) {
      replaceThumbnails();
    }
  }, 100);
}).observe(document.body, {
  childList: true,
  subtree: true,
});
