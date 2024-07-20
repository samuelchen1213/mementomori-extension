document.addEventListener("DOMContentLoaded", () => {
  function updateWeeksGrid() {
    chrome.storage.sync.get(
      ["birthday", "totalWeeks", "backgroundColor", "weekColor"],
      (result) => {
        const weeksContainer = document.getElementById("weeks");
        weeksContainer.innerHTML = ""; // Clear previous grid

        // Apply background color
        document.body.style.backgroundColor =
          result.backgroundColor || "#ffffff";

        if (result.birthday && result.totalWeeks) {
          weeksContainer.classList.remove("centered-message"); // Remove centered message class if it exists

          const birthday = new Date(result.birthday);
          const now = new Date();
          const weeksPassed = Math.floor(
            (now - birthday) / (1000 * 60 * 60 * 24 * 7)
          );
          const weeksRemaining = Math.ceil(result.totalWeeks - weeksPassed);

          const totalGroups = Math.ceil(result.totalWeeks / 40); // Calculate the total number of groups

          for (let group = 0; group < totalGroups; group++) {
            const groupContainer = document.createElement("div");
            groupContainer.className = "weeks-group";

            for (let i = 0; i < 40; i++) {
              const weekIndex = group * 40 + i;
              const week = document.createElement("div");
              week.className = "week";
              week.style.color = result.weekColor || "black"; // Apply week color
              if (weekIndex < weeksPassed) {
                week.textContent = "X";
              } else if (weekIndex < result.totalWeeks) {
                week.textContent = ".";
              } else {
                week.textContent = ""; // Empty content for weeks beyond totalWeeks
              }
              groupContainer.appendChild(week);
            }
            weeksContainer.appendChild(groupContainer);
          }

          document.title = `${weeksRemaining} weeks remaining`;
        } else {
          weeksContainer.classList.add("centered-message"); // Add centered message class if birthdate is not set
          weeksContainer.innerHTML =
            '<div class="set-options-message">Please set your birthdate in the options page.</div>';
          chrome.runtime.openOptionsPage(); // Redirect to options page
        }
      }
    );
  }

  // Initial update when the page loads
  updateWeeksGrid();

  // Update every minute
  setInterval(updateWeeksGrid, 60000);

  // Listen for messages from the options page to update colors immediately
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateTitleAndColors") {
      updateWeeksGrid();
    }
  });
});
