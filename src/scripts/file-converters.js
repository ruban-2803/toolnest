const converterDetails = {
  "png-to-jpg": { input: "image/png", extension: "jpg", mime: "image/jpeg", filePattern: /\.png$/iu },
  "jpg-to-png": { input: "image/jpeg", extension: "png", mime: "image/png", filePattern: /\.jpe?g$/iu },
  "png-to-webp": { input: "image/png", extension: "webp", mime: "image/webp", filePattern: /\.png$/iu },
  "jpg-to-webp": { input: "image/jpeg", extension: "webp", mime: "image/webp", filePattern: /\.jpe?g$/iu },
  "webp-to-jpg": { input: "image/webp", extension: "jpg", mime: "image/jpeg", filePattern: /\.webp$/iu }
};

function parseCSV(source) {
  const text = source.replace(/^\uFEFF/u, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote && character !== "," && character !== "\r" && character !== "\n") {
      throw new Error("Unexpected character after a quoted CSV field.");
    }

    if (character === '"') {
      if (field.length !== 0 || afterQuote) {
        throw new Error("CSV contains a quote in an unquoted field.");
      }
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
      afterQuote = false;
    } else if (character === "\r" || character === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
      afterQuote = false;
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

export function csvToJSON(source) {
  const rows = parseCSV(source);
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = rows[0];
  if (headers.some((header) => header.trim() === "")) {
    throw new Error("Every CSV column must have a non-empty header.");
  }
  if (new Set(headers).size !== headers.length) {
    throw new Error("CSV column headers must be unique.");
  }

  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`Row ${index + 2} has ${values.length} fields; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
}

function escapeCSV(value) {
  const text = value == null
    ? ""
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  return /[",\r\n]/u.test(text) ? `"${text.replace(/"/gu, '""')}"` : text;
}

export function jsonToCSV(source) {
  let records;
  try {
    records = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("JSON must be a non-empty array of objects.");
  }
  if (records.some((record) => record === null || typeof record !== "object" || Array.isArray(record))) {
    throw new Error("Every item in the JSON array must be an object.");
  }

  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (headers.length === 0) {
    throw new Error("JSON objects must contain at least one field.");
  }
  return [
    headers.map(escapeCSV).join(","),
    ...records.map((record) => headers.map((header) => escapeCSV(record[header])).join(","))
  ].join("\r\n");
}

function setStatus(status, message, state = "") {
  status.textContent = message;
  status.className = `converter-status${state ? ` ${state}` : ""}`;
}

function downloadResult(blob, filename, downloadLink) {
  const previousUrl = downloadLink.dataset.objectUrl;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  const url = URL.createObjectURL(blob);
  downloadLink.dataset.objectUrl = url;
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.hidden = false;
}

async function convertImage(file, details, downloadLink) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create an image canvas.");

    if (details.mime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Your browser could not encode this image format."));
      }, details.mime, 0.92);
    });
    if (blob.type !== details.mime) {
      throw new Error(`Your browser does not support ${details.extension.toUpperCase()} image output.`);
    }
    const name = file.name.replace(/\.[^.]+$/u, "") || "converted-image";
    downloadResult(blob, `${name}.${details.extension}`, downloadLink);
    return `${bitmap.width} × ${bitmap.height} image converted.`;
  } finally {
    bitmap?.close();
  }
}

async function convertDataFile(file, format, downloadLink) {
  const source = await file.text();
  if (!source.trim()) throw new Error("The selected file is empty.");
  const result = format === "csv-to-json" ? csvToJSON(source) : jsonToCSV(source);
  const isJSON = format === "csv-to-json";
  const content = isJSON ? JSON.stringify(result, null, 2) : result;
  const extension = isJSON ? "json" : "csv";
  const mime = isJSON ? "application/json" : "text/csv";
  const name = file.name.replace(/\.[^.]+$/u, "") || "converted-file";
  downloadResult(new Blob([content], { type: `${mime};charset=utf-8` }), `${name}.${extension}`, downloadLink);
  return isJSON
    ? `${result.length} row${result.length === 1 ? "" : "s"} converted.`
    : "CSV file created.";
}

if (typeof document !== "undefined") document.querySelectorAll("[data-converter]").forEach((converter) => {
  const format = converter.dataset.converter;
  const input = converter.querySelector('input[type="file"]');
  const button = converter.querySelector("[data-convert]");
  const status = converter.querySelector(".converter-status");
  const selectedFile = converter.querySelector(".selected-file");
  const downloadLink = converter.querySelector(".download-result");
  const imageDetails = converterDetails[format];

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    downloadLink.hidden = true;
    if (downloadLink.dataset.objectUrl) {
      URL.revokeObjectURL(downloadLink.dataset.objectUrl);
      delete downloadLink.dataset.objectUrl;
    }
    selectedFile.textContent = file ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB` : "No file selected";
    setStatus(status, file ? "Ready to convert." : "Choose a file to get started.");
  });

  button.addEventListener("click", async () => {
    const file = input.files?.[0];
    if (!file) {
      setStatus(status, "Choose a file before converting.", "error");
      input.focus();
      return;
    }

    button.disabled = true;
    downloadLink.hidden = true;
    if (downloadLink.dataset.objectUrl) {
      URL.revokeObjectURL(downloadLink.dataset.objectUrl);
      delete downloadLink.dataset.objectUrl;
    }
    setStatus(status, "Reading file and converting in your browser…");
    try {
      let message;
      if (imageDetails) {
        const validType = file.type === imageDetails.input || (file.type === "" && imageDetails.filePattern.test(file.name));
        if (!validType) {
          const label = imageDetails.input === "image/jpeg" ? "JPG or JPEG" : imageDetails.input.replace("image/", "").toUpperCase();
          throw new Error(`Choose a ${label} file for this converter.`);
        }
        message = await convertImage(file, imageDetails, downloadLink);
      } else {
        message = await convertDataFile(file, format, downloadLink);
      }
      setStatus(status, `Done — ${message} Your file was not uploaded.`, "success");
    } catch (error) {
      setStatus(status, error instanceof Error ? error.message : "Conversion failed. Please try another file.", "error");
    } finally {
      button.disabled = false;
    }
  });
});
