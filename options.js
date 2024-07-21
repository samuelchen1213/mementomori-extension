document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.getElementById("options-form") ||
    document.getElementById("onboarding-form");
  const birthdayInput = document.getElementById("birthday");
  const modeSelect = document.getElementById("mode");
  const customColorsDiv = document.getElementById("custom-colors");
  const backgroundColorInput = document.getElementById("background-color");
  const weekColorInput = document.getElementById("week-color");
  const toast = document.getElementById("toast");

  // Load saved settings
  chrome.storage.sync.get(
    ["birthday", "mode", "backgroundColor", "weekColor"],
    (result) => {
      if (result.birthday) {
        birthdayInput.value = result.birthday;
      }
      if (result.mode) {
        modeSelect.value = result.mode;
      }
      if (result.mode === "custom") {
        customColorsDiv.style.display = "block";
        if (result.backgroundColor) {
          backgroundColorInput.value = result.backgroundColor;
        } else {
          backgroundColorInput.value = "#202020"; // Default to dark mode background color
        }
        if (result.weekColor) {
          weekColorInput.value = result.weekColor;
        } else {
          weekColorInput.value = "#ffffff"; // Default to dark mode week color
        }
      } else if (result.mode === "dark" || !result.mode) {
        backgroundColorInput.value = "#202020";
        weekColorInput.value = "#ffffff";
        modeSelect.value = "dark";
      } else if (result.mode === "light") {
        backgroundColorInput.value = "#ffffff";
        weekColorInput.value = "#000000";
      }

      modeSelect.addEventListener("change", () => {
        if (modeSelect.value === "custom") {
          customColorsDiv.style.display = "block";
          if (!backgroundColorInput.value) {
            backgroundColorInput.value = "#202020";
          }
          if (!weekColorInput.value) {
            weekColorInput.value = "#ffffff";
          }
        } else {
          customColorsDiv.style.display = "none";
        }
      });
    }
  );

  // Show toast message
  function showToast() {
    if (toast) {
      toast.className = "toast show";
      setTimeout(() => {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    }
  }

  // Save settings and calculate weeks on form submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const birthday = new Date(birthdayInput.value);
    const mode = modeSelect.value;
    let backgroundColor;
    let weekColor;

    if (mode === "light") {
      backgroundColor = "#ffffff";
      weekColor = "#000000";
    } else if (mode === "dark") {
      backgroundColor = "#202020";
      weekColor = "#ffffff";
    } else if (mode === "custom") {
      backgroundColor = backgroundColorInput.value || "#202020"; // Default to dark mode background color
      weekColor = weekColorInput.value || "#ffffff"; // Default to dark mode week color
    }

    const lifeExpectancy = 80; // Fixed life expectancy

    if (isNaN(birthday.getTime())) {
      alert("Please enter a valid birthday.");
      return;
    }

    // Calculate the total number of weeks based on fixed 52 weeks per year
    const totalWeeks = lifeExpectancy * 52;

    // Set the calculated values in storage
    chrome.storage.sync.set(
      {
        birthday: birthdayInput.value,
        totalWeeks,
        mode,
        backgroundColor,
        weekColor,
      },
      () => {
        showToast();
        if (form.id === "onboarding-form") {
          chrome.tabs.update({ url: "index.html" });
        }
        // Notify the new tab to update the title and colors immediately
        chrome.runtime.sendMessage(
          { action: "updateTitleAndColors" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else {
              console.log("Message sent successfully:", response);
            }
          }
        );
      }
    );
  });
});
