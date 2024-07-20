document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("options-form");
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
          backgroundColorInput.value = "#ffffff"; // Default to light mode background color
        }
        if (result.weekColor) {
          weekColorInput.value = result.weekColor;
        } else {
          weekColorInput.value = "#000000"; // Default to light mode week color
        }
      } else if (result.mode === "light") {
        backgroundColorInput.value = "#ffffff";
        weekColorInput.value = "#000000";
      }
    }
  );

  // Show or hide custom colors based on mode
  modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "custom") {
      customColorsDiv.style.display = "block";
      // Set custom colors to light mode defaults if not already set
      if (!backgroundColorInput.value) {
        backgroundColorInput.value = "#ffffff";
      }
      if (!weekColorInput.value) {
        weekColorInput.value = "#000000";
      }
    } else {
      customColorsDiv.style.display = "none";
    }
  });

  // Show toast message
  function showToast() {
    toast.className = "toast show";
    setTimeout(() => {
      toast.className = toast.className.replace("show", "");
    }, 3000);
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
      backgroundColor = backgroundColorInput.value || "#ffffff"; // Default to light mode background color
      weekColor = weekColorInput.value || "#000000"; // Default to light mode week color
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
