let countdowns = [];
let currentSort = "closest";

const form = document.getElementById("countdownForm");
const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const sortSelect = document.getElementById("sortSelect");
const listContainer = document.getElementById("countdownList");

document.addEventListener("DOMContentLoaded", async () => {
  const data = await browser.storage.local.get(["countdowns", "sortOrder"]);
  if (data.countdowns) countdowns = data.countdowns;
  if (data.sortOrder) {
    currentSort = data.sortOrder;
    sortSelect.value = currentSort;
  }

  renderCountdowns();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Parse YYYY-MM-DD cleanly into local midnight time
  const [year, month, day] = dateInput.value.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day).getTime();

  const newCountdown = {
    id: Date.now().toString(),
    title: titleInput.value.trim(),
    targetDate: targetDate,
    createdAt: Date.now(),
  };

  countdowns.push(newCountdown);
  await saveToStorage();

  titleInput.value = "";
  dateInput.value = "";
  renderCountdowns();
});

sortSelect.addEventListener("change", async (e) => {
  currentSort = e.target.value;
  await browser.storage.local.set({ sortOrder: currentSort });
  renderCountdowns();
});

async function saveToStorage() {
  await browser.storage.local.set({ countdowns });
}

// Calculate precise calendar days remaining
function getDaysRemaining(targetDate) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffTime = targetDate - todayMidnight;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Generates dynamic aesthetic color shifting from Green to Blue
function getColorForDays(days) {
  if (days <= 0) return "#737373"; // Muted gray for passed/today events
  if (days <= 7) return "hsl(142, 70%, 45%)"; // Vivid Minimalist Green
  if (days >= 90) return "hsl(220, 75%, 50%)"; // Crisp Deep Blue

  // Gradient transition framework between 7 days (Green) and 90 days (Blue)
  const percentage = (days - 7) / (90 - 7);
  const greenHue = 142;
  const blueHue = 220;
  const dynamicHue = greenHue + percentage * (blueHue - greenHue);

  return `hsl(${dynamicHue}, 72%, 46%)`;
}

function renderCountdowns() {
  listContainer.innerHTML = "";

  if (countdowns.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No countdowns set yet.</div>';
    return;
  }

  let sortedItems = [...countdowns];
  if (currentSort === "closest") {
    sortedItems.sort((a, b) => {
      const daysA = getDaysRemaining(a.targetDate);
      const daysB = getDaysRemaining(b.targetDate);
      if (daysA < 0 && daysB >= 0) return 1;
      if (daysB < 0 && daysA >= 0) return -1;
      return a.targetDate - b.targetDate;
    });
  } else if (currentSort === "created") {
    sortedItems.sort((a, b) => b.createdAt - a.createdAt);
  }

  sortedItems.forEach((item) => {
    const daysLeft = getDaysRemaining(item.targetDate);
    const dynamicColor = getColorForDays(daysLeft);

    const card = document.createElement("div");
    card.className = "countdown-card";

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    // Inline editable Title Element
    const titleEl = document.createElement("span");
    titleEl.className = "card-title";
    titleEl.textContent = item.title;
    titleEl.contentEditable = true;
    titleEl.spellcheck = false;

    // Save modifications when user clicks away
    titleEl.addEventListener("blur", async () => {
      const updatedText = titleEl.textContent.trim();
      if (updatedText && updatedText !== item.title) {
        item.title = updatedText;
        await saveToStorage();
      } else {
        titleEl.textContent = item.title; // Revert layout if text left empty
      }
    });

    // Pressing 'Enter' commits edit immediately
    titleEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleEl.blur();
      }
    });

    const dateEl = document.createElement("span");
    dateEl.className = "card-date";
    dateEl.textContent = new Date(item.targetDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(dateEl);

    const timeRightDiv = document.createElement("div");
    timeRightDiv.style.display = "flex";
    timeRightDiv.style.alignItems = "center";

    const timeLeftEl = document.createElement("span");
    timeLeftEl.className = "card-time-left";
    timeLeftEl.style.color = dynamicColor;

    // Aesthetic text outputs
    if (daysLeft < 0) timeLeftEl.textContent = "Passed";
    else if (daysLeft === 0) timeLeftEl.textContent = "Achived!!!";
    else if (daysLeft === 1) timeLeftEl.textContent = "1";
    else timeLeftEl.textContent = `${daysLeft}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "&#x2715;";
    deleteBtn.addEventListener("click", async () => {
      countdowns = countdowns.filter((c) => c.id !== item.id);
      await saveToStorage();
      renderCountdowns();
    });

    timeRightDiv.appendChild(timeLeftEl);
    timeRightDiv.appendChild(deleteBtn);

    card.appendChild(infoDiv);
    card.appendChild(timeRightDiv);
    listContainer.appendChild(card);
  });
}
