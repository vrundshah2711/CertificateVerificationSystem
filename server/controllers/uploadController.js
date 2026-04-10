const xlsx = require("xlsx");
const crypto = require("crypto");
const Certificate = require("../models/Certificate");

function parseDate(value) {
  if (value === null || value === undefined || value === "") return null;
  // xlsx sometimes gives Date objects, numbers, or strings
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    // Excel serialized date number: let xlsx handle if possible via SSF, but fallback:
    // 25569 is 1970-01-01 in Excel day count
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file?.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const importBatchId = crypto.randomUUID();
    const errors = [];

    // Normalize + validate rows
    const normalized = data.map((item, idx) => {
      const rowNumber = idx + 2; // header row is 1
      const certificateId = String(item.certificateId || item.CertificateId || item.certificateID || "").trim();
      const studentName = String(item.studentName || item.StudentName || item.name || "").trim();
      const domain = String(item.domain || item.Domain || "").trim();
      const startDate = parseDate(item.startDate || item.StartDate || item.start || "");
      const endDate = parseDate(item.endDate || item.EndDate || item.end || "");

      const rowErrors = [];
      if (!certificateId) rowErrors.push({ row: rowNumber, field: "certificateId", message: "Required" });
      if (!studentName) rowErrors.push({ row: rowNumber, field: "studentName", message: "Required" });
      if (!domain) rowErrors.push({ row: rowNumber, field: "domain", message: "Required" });
      if (!startDate) rowErrors.push({ row: rowNumber, field: "startDate", message: "Invalid or missing" });
      if (!endDate) rowErrors.push({ row: rowNumber, field: "endDate", message: "Invalid or missing" });
      if (startDate && endDate && startDate > endDate) {
        rowErrors.push({ row: rowNumber, field: "dateRange", message: "startDate must be <= endDate" });
      }

      if (rowErrors.length) errors.push(...rowErrors);

      return {
        _row: rowNumber,
        certificateId,
        studentName,
        domain,
        startDate,
        endDate
      };
    });

    // Duplicate certificateId in file
    const seen = new Map();
    for (const row of normalized) {
      if (!row.certificateId) continue;
      const key = row.certificateId.toLowerCase();
      if (seen.has(key)) {
        errors.push({
          row: row._row,
          field: "certificateId",
          message: `Duplicate in file (also in row ${seen.get(key)})`
        });
      } else {
        seen.set(key, row._row);
      }
    }

    // Filter valid rows (no per-row errors)
    const invalidRows = new Set(errors.map((e) => e.row));
    const candidates = normalized.filter((r) => !invalidRows.has(r._row));

    // Duplicate in DB
    const ids = candidates.map((r) => r.certificateId);
    const existing = ids.length
      ? await Certificate.find({ certificateId: { $in: ids } }, { certificateId: 1 }).lean()
      : [];
    const existingSet = new Set(existing.map((d) => String(d.certificateId)));
    const finalInsert = [];
    for (const r of candidates) {
      if (existingSet.has(r.certificateId)) {
        errors.push({ row: r._row, field: "certificateId", message: "Already exists in database" });
      } else {
        finalInsert.push({
          certificateId: r.certificateId,
          studentName: r.studentName,
          domain: r.domain,
          startDate: r.startDate,
          endDate: r.endDate,
          importBatchId,
          uploadedByUserId: req.auth?.userId
        });
      }
    }

    let inserted = 0;
    if (finalInsert.length) {
      const insertedDocs = await Certificate.insertMany(finalInsert, { ordered: false });
      inserted = insertedDocs.length;
    }

    const totalRows = normalized.length;
    const skipped = totalRows - inserted;
    return res.json({
      message: "Excel processed",
      importBatchId,
      totalRows,
      inserted,
      skipped,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};