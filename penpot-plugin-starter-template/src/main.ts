import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

document.querySelector("[data-handler='blue-stripe']")?.addEventListener("click", () => {
  // send message to plugin.ts
  parent.postMessage("blue-stripe", "*");
});

document.querySelector("[data-handler='restore-version']")?.addEventListener("click", () => {
  // send message to plugin.ts
  parent.postMessage("restore-version", "*");
});

document.querySelector("[data-handler='print-versions']")?.addEventListener("click", () => {
  // send message to plugin.ts
  parent.postMessage("print-versions", "*");
});

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  }
});
