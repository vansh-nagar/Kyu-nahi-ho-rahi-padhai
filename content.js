// Your custom image
const customImage = chrome.runtime.getURL("images/gg.jpg");

function replaceThumbnails() {
  const thumbnails = document.querySelectorAll("img");

  thumbnails.forEach((img) => {
    if (img.src.includes("ytimg.com") || img.src.includes("i.ytimg.com")) {
      img.src = customImage;
      img.srcset = customImage;
    }
  });
}

// Initial run
replaceThumbnails();

// Watch for dynamic loads
new MutationObserver(replaceThumbnails).observe(document.body, {
  childList: true,
  subtree: true,
});
