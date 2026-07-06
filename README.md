# Minimal Countdown Firefox Extension

A clean, minimalist countdown tracker for multiple events. This extension allows you to track deadlines, dynamically colors them based on urgency (green to blue), and lets you edit event titles inline.

## Installation Instructions

Since this extension is local and not downloaded from the Firefox Add-ons store, you can install it as a temporary extension using Firefox's built-in developer tools.

### Step 1: Open Add-on Debugging
1. Open Firefox.
2. In the URL address bar, type `about:debugging` and press **Enter**.

### Step 2: Navigate to This Firefox
1. On the left-hand sidebar menu, click on **This Firefox**.

### Step 3: Load the Extension
1. Click the **Load Temporary Add-on...** button.
2. A file picker window will open. Navigate to the folder containing your extension files.
3. Select **any file** inside that folder (for example, `manifest.json`) and click **Open**.

### Step 4: Pin the Extension (Optional)
1. Click on the Extensions icon (the puzzle piece) in your Firefox toolbar.
2. Find **Minimal Countdown** in the list.
3. Click the gear icon next to it and select **Pin to Toolbar** for quick access.

---

## How to Use
- **Add a Countdown**: Enter a title, select a target date, and click the `+` button.
- **Edit a Title After Creation**: Click directly on any event title to rename it inline. Press **Enter** or click away from the text to auto-save.
- **Sort Items**: Use the dropdown at the top right to sort by **Closest Target** or **Date Created**.
- **Dynamic Color Coding**: 
  - Under 7 days: **Green**
  - 7 to 90 days: **Smooth transition gradient from Green to Blue**
  - 90+ days: **Deep Blue**
  - Today / Past due: **Muted Gray**

*Note: Temporary add-ons are automatically removed when you completely close Firefox. To reload it next time you start your browser, simply repeat Step 3.*
