const SPREADSHEET_ID = "1Ju3vOzQiHq5RzLCP79zMzmW5rMfby3gRw2G-L9DOA3M";
const SHEET_NAME = "官網諮詢名單";

function doGet() {
  return jsonResponse_({ ok: true, service: "syncomp-website-leads" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = parsePayload_(e);

    if (payload.website) {
      return jsonResponse_({ ok: true });
    }

    const required = ["store", "name", "phone", "location", "status", "monthly", "contact_goal"];
    const missing = required.filter((key) => !String(payload[key] || "").trim());
    if (missing.length) {
      return jsonResponse_({ ok: false, message: "required_fields_missing" });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("target_sheet_not_found");

    const submissionId = cleanCell_(payload.submission_id || Utilities.getUuid());
    if (sheet.getLastRow() > 1) {
      const existingIds = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
      if (existingIds.includes(submissionId)) {
        return jsonResponse_({ ok: true, submission_id: submissionId, duplicate: true });
      }
    }

    const nextRow = sheet.getLastRow() + 1;
    const row = [
      new Date(),
      submissionId,
      "待聯絡",
      cleanCell_(payload.source_page),
      cleanCell_(payload.store),
      cleanCell_(payload.name),
      "",
      cleanCell_(payload.location),
      cleanCell_(payload.status),
      cleanCell_(payload.monthly),
      cleanCell_(payload.contact_goal),
      cleanCell_(payload.services),
      cleanCell_(payload.message),
      cleanCell_(payload.utm_source),
      cleanCell_(payload.utm_medium),
      cleanCell_(payload.utm_campaign),
      cleanCell_(payload.utm_term),
      cleanCell_(payload.utm_content),
      cleanCell_(payload.gclid),
    ];
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    sheet.getRange(nextRow, 7).setRichTextValue(
      SpreadsheetApp.newRichTextValue().setText(plainTextCell_(payload.phone)).build()
    );
    SpreadsheetApp.flush();

    return jsonResponse_({ ok: true, submission_id: submissionId });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, message: "save_failed" });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function parsePayload_(e) {
  const raw = e && e.postData ? e.postData.contents || "" : "";
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  return e && e.parameter ? e.parameter : {};
}

function cleanCell_(value) {
  const text = String(value == null ? "" : value).trim().slice(0, 2000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function plainTextCell_(value) {
  const text = String(value == null ? "" : value).trim().slice(0, 2000);
  return text.startsWith("=") ? "＝" + text.slice(1) : text;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
