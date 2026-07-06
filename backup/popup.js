let countdowns = [];
let currentSort = "closest";

// DOM Elements
const form = document.getElementById("countdownForm");
const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const sortSelect = document.getElementById("sortSelect");
const listContainer = document.getElementById("countdownList");

// Initialize Extension
document.addEventListener("DOMContentLoaded", async () => {
  const data = await browser.storage.local.get(["countdowns", "sortOrder"]);
  if (data.countdowns) countdowns = data.countdowns;
  if (data.sortOrder) {
    currentSort = data.sortOrder;
    sortSelect.value = currentSort;
  }

  renderCountdowns();
  // Live update ticker every second
  setInterval(renderCountdowns, 1000);
});

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newCountdown = {
    id: Date.now().toString(),
    title: titleInput.value.trim(),
    targetDate: new Date(dateInput.value).getTime(),
    createdAt: Date.now(),
  };

  countdowns.push(newCountdown);
  await saveToStorage();

  // Reset fields
  titleInput.value = "";
  dateInput.value = "";
  renderCountdowns();
});

// Handle Sort Adjustments
sortSelect.addEventListener("change", async (e) => {
  currentSort = e.target.value;
  await browser.storage.local.set({ sortOrder: currentSort });
  renderCountdowns();
});

// Save wrapper
async function saveToStorage() {
  await browser.storage.local.set({ countdowns });
}

// Calculate the human-readable remaining time
function getTimeRemaining(target) {
  const total = target - Date.now();

  if (total <= 0) return "Passed";

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

// Render Core Logic
function renderCountdowns() {
  listContainer.innerHTML = "";

  if (countdowns.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No countdowns set yet.</div>';
    return;
  }

  // Sorting logic
  let sortedItems = [...countdowns];
  if (currentSort === "closest") {
    // Sorts upcoming events by closeness, expired events drop to the bottom
    sortedItems.sort((a, b) => {
      const diffA = a.targetDate - Date.now();
      const diffB = b.targetDate - Date.now();
      if (diffA < 0 && diffB >= 0) return 1;
      if (diffB < 0 && diffA >= 0) return -1;
      return a.targetDate - b.targetDate;
    });
  } else if (currentSort === "created") {
    // Newest created entries first
    sortedItems.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Generate DOM
  sortedItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "countdown-card";

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    const titleEl = document.createElement("span");
    titleEl.className = "card-title";
    titleEl.textContent = item.title;

    const dateEl = document.createElement("span");
    dateEl.className = "card-date";
    dateEl.textContent = new Date(item.targetDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(dateEl);

    const timeRightDiv = document.createElement("div");
    timeRightDiv.style.display = "flex";
    timeRightDiv.style.alignItems = "center";

    const timeLeftEl = document.createElement("span");
    timeLeftEl.className = "card-time-left";
    timeLeftEl.textContent = getTimeRemaining(item.targetDate);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "&#x2715;"; // Elegant '✕' cross mark
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
