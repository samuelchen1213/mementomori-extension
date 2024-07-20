chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["birthday"], (result) => {
    if (!result.birthday) {
      chrome.runtime.openOptionsPage();
    } else {
      updateTitle();
    }
  });
});

chrome.runtime.onStartup.addListener(updateTitle);
chrome.runtime.onInstalled.addListener(updateTitle);

setInterval(updateTitle, 60000);

function updateTitle() {
  chrome.storage.sync.get(["birthday", "totalWeeks"], (result) => {
    if (result.birthday && result.totalWeeks) {
      const birthday = new Date(result.birthday);
      const now = new Date();
      const weeksPassed = Math.ceil(
        (now - birthday) / (1000 * 60 * 60 * 24 * 7)
      );
      const weeksRemaining = Math.ceil(result.totalWeeks - weeksPassed);

      if (chrome.action && typeof chrome.action.setTitle === "function") {
        chrome.action.setTitle({ title: `${weeksRemaining} weeks remaining` });
      } else {
        console.error("chrome.action.setTitle is not available.");
      }
    } else {
      if (chrome.action && typeof chrome.action.setTitle === "function") {
        chrome.action.setTitle({ title: "Momento Mori" });
      } else {
        console.error("chrome.action.setTitle is not available.");
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTitleAndColors") {
    updateTitle();
    sendResponse({ status: "success" });
  }
});
