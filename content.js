// Set the value of GlobalWorkerOptions.workerSrc property to the URL of the local pdf.worker.min.js file
if (typeof window !== "undefined" && "pdfjsLib" in window) {
  window["pdfjsLib"].GlobalWorkerOptions.workerSrc =
    chrome.runtime.getURL("pdf.worker.min.js");
}

// Create the button
const button = document.createElement("button");
button.innerText = "Submit File";
button.style.backgroundColor = "green";
button.style.color = "white";
button.style.padding = "3px";
button.style.border = "none";
button.style.borderRadius = "3px";
button.style.margin = "3px";

// Create the progress bar container
const progressContainer = document.createElement("div");
progressContainer.style.width = "99%";
progressContainer.style.height = "5px";
progressContainer.style.backgroundColor = "grey";
progressContainer.style.margin = "3px";
progressContainer.style.borderRadius = "5px";

// Create the progress bar element
const progressBar = document.createElement("div");
progressBar.style.width = "0%";
progressBar.style.height = "100%";
progressBar.style.backgroundColor = "#32a9db";
progressContainer.appendChild(progressBar);

// Add a click event listener to the button
button.addEventListener("click", async () => {
  // Create the input element
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.js,.py,.html,.css,.json,.csv,.pdf"; // Include PDF files in the accepted types

  // Add a change event listener to the input element
  input.addEventListener("change", async () => {
    // Reset progress bar once a new file is inserted
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = "#32a9db";

    const file = input.files[0];

    if (file.type === "application/pdf") {
      // Handle PDF file
      const pdfData = await fetch(file.name).then(response => response.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const numPages = pdf.numPages;

      let pdfText = "";

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const pageText = await page.getTextContent();
        const pageTextChunks = pageText.items.map(item => item.str);
        pdfText += pageTextChunks.join(" ");
      }

      await submitConversation(pdfText, 1, file.name);
    } else {
      // Handle non-PDF file (same as before)
      const text = await file.text();
      const MAX_CHUNK_SIZE = 15000;
      // ... (rest of the text file chunking and submission logic)
    }

    progressBar.style.backgroundColor = "#32a9db";
  });

  // Click the input element to trigger the file selection dialog
  input.click();
});

// Define the submitConversation function
async function submitConversation(text, part, filename) {
  const textarea = document.querySelector("textarea[tabindex='0']");
  const enterKeyEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
  });
  textarea.value = `Part ${part} of ${filename}: \n\n ${text}`;
  textarea.dispatchEvent(enterKeyEvent);
}

// Periodically check if the button has been added to the page and add it if it hasn't
const targetSelector =
  ".flex.flex-col.w-full.py-2.flex-grow.md\\:py-3.md\\:pl-4";
const intervalId = setInterval(() => {
  const targetElement = document.querySelector(targetSelector);
  if (targetElement && !targetElement.contains(button)) {
    // Insert the button before the target element
    targetElement.parentNode.insertBefore(button, targetElement);

    // Insert the progress bar container before the target element
    targetElement.parentNode.insertBefore(progressContainer, targetElement);
  }
}, 3000);
