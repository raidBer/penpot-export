import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

const exportButton = document.querySelector(
  "[data-handler='export-html']",
) as HTMLButtonElement;
const copyButton = document.querySelector(
  "[data-handler='copy-html']",
) as HTMLButtonElement;
const htmlOutput = document.querySelector(
  "#html-output",
) as HTMLTextAreaElement;
const errorMessage = document.querySelector("#error-message") as HTMLDivElement;
const successMessage = document.querySelector(
  "#success-message",
) as HTMLDivElement;

// Export HTML button handler
exportButton?.addEventListener("click", () => {
  // Clear previous messages
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  htmlOutput.value = "Génération du HTML...";
  copyButton.disabled = true;

  // Send message to plugin.ts
  parent.postMessage("export-html", "*");
});

// Copy HTML button handler
copyButton?.addEventListener("click", () => {
  if (htmlOutput.value && htmlOutput.value !== "Generating HTML...") {
    htmlOutput.select();
    htmlOutput.focus();

    // Use execCommand as fallback for iframe context
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        successMessage.textContent = "HTML copié dans le presse-papiers !";
        successMessage.style.display = "block";
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000);
      } else {
        // If execCommand fails, text is already selected, user can copy manually
        successMessage.textContent =
          "Texte sélectionné ! Utilisez Ctrl+C pour copier.";
        successMessage.style.display = "block";
      }
    } catch (err) {
      // Text is selected, user can copy manually
      successMessage.textContent =
        "Texte sélectionné ! Utilisez Ctrl+C pour copier.";
      successMessage.style.display = "block";
    }
  }
});

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  }

  // Handle export results
  if (event.data.type === "export-result") {
    if (event.data.error) {
      errorMessage.textContent = event.data.error;
      errorMessage.style.display = "block";
      htmlOutput.value = "";
      copyButton.disabled = true;
    } else {
      htmlOutput.value = event.data.html;
      copyButton.disabled = false;
      successMessage.textContent = "HTML généré avec succès !";
      successMessage.style.display = "block";
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 3000);
    }
  }
});
