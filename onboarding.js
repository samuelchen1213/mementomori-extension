document.addEventListener("DOMContentLoaded", () => {
  const weeksContainer = document.getElementById("weeks");
  const container = document.getElementById("container");
  const introText = document.getElementById("introText");
  const initialTextElement = document.getElementById("initialText");
  const birthdateInputElement = document.getElementById("birthdateInput");
  const birthdateInput = document.getElementById("birthdate");
  const saveButton = document.getElementById("saveBirthdate");
  const totalWeeks = 80 * 52; // 80 years * 52 weeks per year

  const initialTextContent =
    "The average lifespan of a human being is 80 years";
  const finalTextContent = "That is approximately 4160 weeks.";

  // Ensure the elements are found
  if (!initialTextElement || !introText || !birthdateInputElement) {
    console.error("One or more elements are not found in the DOM.");
    return;
  }

  // Split the initial text content into spans with spaces
  initialTextElement.innerHTML = initialTextContent
    .split("")
    .map((letter) =>
      letter === " " ? "<span>&nbsp;</span>" : `<span>${letter}</span>`
    )
    .join("");

  // Split the final text content into spans with spaces
  introText.innerHTML = finalTextContent
    .split("")
    .map((letter) =>
      letter === " " ? "<span>&nbsp;</span>" : `<span>${letter}</span>`
    )
    .join("");

  // Create week groups and weeks
  const createWeeksGrid = () => {
    weeksContainer.innerHTML = ""; // Clear previous grid
    const totalGroups = Math.ceil(totalWeeks / 40);
    for (let group = 0; group < totalGroups; group++) {
      const groupContainer = document.createElement("div");
      groupContainer.className = "weeks-group";

      for (let i = 0; i < 40; i++) {
        const weekIndex = group * 40 + i;
        const week = document.createElement("div");
        week.className = "week";
        week.textContent = "."; // Use period as the dot
        if (weekIndex >= totalWeeks) break; // Stop creating weeks if we exceed totalWeeks
        groupContainer.appendChild(week);
      }
      weeksContainer.appendChild(groupContainer);
    }
  };

  createWeeksGrid();

  // Create a GSAP timeline
  const timeline = gsap.timeline();
  const initialDelay = 0.5; // Initial delay

  // Animate the initial text appearing one by one
  timeline.to("#initialText span", {
    duration: 0.05, // Duration for each letter
    opacity: 1,
    stagger: 0.03, // Delay between each letter
    ease: "power1.inOut",
    delay: initialDelay, // Add the delay here
  });

  // Fade out the initial text
  timeline.to(
    "#initialText",
    {
      duration: 1,
      opacity: 0,
      ease: "power1.inOut",
      onComplete: () => {
        initialTextElement.style.display = "none"; // Remove the element after fading out
      },
    },
    "+=1" // Add a slight delay after the initial text animation
  );

  // Animate the dots appearing one by one with exponential easing
  timeline.to(
    ".week",
    {
      duration: 0.05, // Reduce duration for faster animation
      opacity: 1,
      stagger: 0.0007, // Reduce stagger for faster animation
      ease: "expo.in",
    },
    "+=0.7" // Add a slight delay after the initial text animation
  );

  // Animate the final text fading in one by one after the dots animation
  timeline.to(
    "#introText span",
    {
      duration: 0.05, // Duration for each letter
      opacity: 1,
      stagger: 0.03, // Delay between each letter
      ease: "power1.inOut",
    },
    "+=1" // Add a slight delay after the dots animation
  );

  // Fade out the intro text and inject the birthdate input
  timeline.to(
    "#introText",
    {
      duration: 1,
      opacity: 0,
      ease: "power1.inOut",
      onComplete: () => {
        introText.style.display = "none"; // Remove the element after fading out
        birthdateInputElement.style.display = "flex"; // Show the birthdate input
        // Fade in the birthdate input
        gsap.to("#birthdateInput", {
          duration: 1,
          opacity: 1,
          ease: "power1.inOut",
        });
      },
    },
    "+=1"
  );

  // Save the birthdate when the button is clicked
  saveButton.addEventListener("click", () => {
    const birthday = new Date(birthdateInput.value);
    if (isNaN(birthday.getTime())) {
      return;
    }

    const now = new Date();
    const weeksLived = Math.floor((now - birthday) / (1000 * 60 * 60 * 24 * 7));
    const lifeExpectancy = 80;
    const totalWeeks = lifeExpectancy * 52;
    const weeksLeft = totalWeeks - weeksLived;

    chrome.storage.sync.set(
      { birthday: birthdateInput.value, totalWeeks },
      () => {
        // Fade out the birthdate input
        gsap.to("#birthdateInput", {
          duration: 1,
          opacity: 0,
          ease: "power1.inOut",
          onComplete: () => {
            birthdateInputElement.style.display = "none"; // Hide the element after fading out

            // Update the weeks grid one by one
            const weeksElements = document.querySelectorAll(".week");
            const weeksToUpdate = Array.from(weeksElements).slice(
              0,
              weeksLived
            );

            // Inject the new text element
            const newTextElement = document.createElement("div");
            newTextElement.id = "weeksLeftText";
            newTextElement.className = "weeks-left-text";
            newTextElement.innerHTML = `You have ${weeksLeft} weeks left to live. Spend your time wisely.`;
            container.appendChild(newTextElement);

            // Split the new text content into spans with spaces
            newTextElement.innerHTML = newTextElement.innerHTML
              .split("")
              .map((letter) =>
                letter === " "
                  ? "<span>&nbsp;</span>"
                  : `<span>${letter}</span>`
              )
              .join("");

            gsap.to(weeksToUpdate, {
              textContent: "x",
              duration: 0.05,
              stagger: 0.007,
              ease: "power1.inOut",
            });

            // Ensure spans are visible before animating
            gsap.set("#weeksLeftText span", { opacity: 0 });

            // Fade in the new text element
            gsap.to("#weeksLeftText span", {
              duration: 0.05,
              opacity: 1,
              stagger: 0.1,
              ease: "power1.inOut",
              delay: 1, // Delay by 1 second
            });
          },
        });
      }
    );
  });
});
