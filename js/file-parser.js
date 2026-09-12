/**
 * RESUME FILE PARSER & DROPZONE MODULE
 * Client-Side In-Browser Extraction for PDF, DOCX, TXT, and Markdown.
 * Zero data sent to remote servers (100% private).
 */

/**
 * Fallback string extractor for binary buffers if CDN libraries are unavailable
 */
function extractRawStringsFromBuffer(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let text = "";
  let currentWord = "";
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Printable ASCII or newline/tab
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
      currentWord += String.fromCharCode(byte);
    } else {
      if (currentWord.length >= 3 && /[a-zA-Z]/.test(currentWord)) {
        text += currentWord + " ";
      }
      currentWord = "";
    }
  }
  if (currentWord.length >= 3) text += currentWord;
  return text.replace(/\s{2,}/g, " ").trim();
}

/**
 * Parses PDF file in browser using PDF.js or stream fallback
 */
export async function parsePdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  
  if (typeof window !== "undefined" && window.pdfjsLib) {
    try {
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let lastY = null;
        let pageStr = "";
        
        textContent.items.forEach(item => {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += "\n";
          } else if (pageStr.length > 0 && !pageStr.endsWith(" ") && !pageStr.endsWith("\n")) {
            pageStr += " ";
          }
          pageStr += item.str;
          lastY = item.transform[5];
        });

        fullText += pageStr + "\n\n";
      }

      if (fullText.trim().length > 30) {
        return fullText.trim();
      }
    } catch (err) {
      console.warn("PDF.js extraction warning, falling back to stream reader:", err);
    }
  }

  // Fallback stream text extraction
  return extractRawStringsFromBuffer(arrayBuffer);
}

/**
 * Parses DOCX file in browser using Mammoth.js or XML fallback
 */
export async function parseDocxFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  if (typeof window !== "undefined" && window.mammoth) {
    try {
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 30) {
        return result.value.trim();
      }
    } catch (err) {
      console.warn("Mammoth extraction warning, falling back to XML reader:", err);
    }
  }

  // Fallback: search for XML text tags in buffer
  return extractRawStringsFromBuffer(arrayBuffer);
}

/**
 * General file dispatcher based on file extension / mime type
 */
export async function parseResumeFile(file) {
  if (!file) throw new Error("No file provided");

  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    return await parsePdfFile(file);
  } else if (fileName.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await parseDocxFile(file);
  } else if (fileName.endsWith(".txt") || fileName.endsWith(".md") || file.type.startsWith("text/")) {
    return (await file.text()).trim();
  } else {
    // Attempt text read as fallback
    try {
      const txt = await file.text();
      if (txt && txt.trim().length > 20) return txt.trim();
    } catch (e) {
      // Fallback to binary buffer extraction
      const buf = await file.arrayBuffer();
      return extractRawStringsFromBuffer(buf);
    }
  }
}

/**
 * Configures interactive drag-and-drop dropzone on a container element
 */
export function setupDropzone({ dropzoneEl, textareaEl, onFileParsed, onLoadingChange }) {
  if (!dropzoneEl || !textareaEl) return;

  const fileInput = dropzoneEl.querySelector("input[type='file']");

  function setDragOver(active) {
    dropzoneEl.classList.toggle("drag-over", active);
  }

  ["dragenter", "dragover"].forEach(evt => {
    dropzoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    dropzoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    });
  });

  dropzoneEl.addEventListener("drop", async (e) => {
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  });

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleFile(e.target.files[0]);
      }
    });
  }

  dropzoneEl.addEventListener("click", (e) => {
    if (fileInput && e.target !== fileInput) {
      fileInput.click();
    }
  });

  async function handleFile(file) {
    if (onLoadingChange) onLoadingChange(true, file.name);
    try {
      const extractedText = await parseResumeFile(file);
      if (extractedText && extractedText.length > 20) {
        textareaEl.value = extractedText;
        if (onFileParsed) onFileParsed(extractedText, file.name);
      } else {
        throw new Error("Could not extract readable text from document.");
      }
    } catch (err) {
      console.error("File parse error:", err);
      alert(`Error reading ${file.name}: ${err.message}`);
    } finally {
      if (onLoadingChange) onLoadingChange(false);
    }
  }
}
