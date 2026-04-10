import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography
} from "@mui/material";
import API from "../../services/api";

export default function ImportExcel() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    if (!result) return null;
    return `${result.inserted} inserted, ${result.skipped} skipped, ${result.totalRows} total`;
  }, [result]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
        Bulk Import (Excel)
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Upload an Excel file with columns: `certificateId`, `studentName`, `domain`, `startDate`, `endDate`.
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: "grid", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity={result.errors?.length ? "warning" : "success"}>
              {summary}. Batch: {result.importBatchId}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="outlined" component="label">
              Choose file
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setResult(null);
                  setError("");
                  setFile(e.target.files?.[0] || null);
                }}
              />
            </Button>
            <Typography color="text.secondary">
              {file ? file.name : "No file selected"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disabled={!file || busy}
            sx={{ width: { xs: "100%", sm: "auto" } }}
            onClick={async () => {
              setBusy(true);
              setError("");
              setResult(null);
              try {
                const form = new FormData();
                form.append("file", file);
                const res = await API.post("/imports/excel", form, {
                  headers: { "Content-Type": "multipart/form-data" }
                });
                setResult(res.data);
              } catch (err) {
                setError(err?.response?.data?.message || "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Uploading..." : "Upload & Validate"}
          </Button>

          {result?.errors?.length ? (
            <>
              <Divider />
              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Validation issues ({result.errors.length})
                </Typography>
                <Box
                  sx={{
                    maxHeight: 320,
                    overflow: "auto",
                    border: "1px solid rgba(15, 23, 42, 0.10)",
                    borderRadius: 2,
                    p: 1
                  }}
                >
                  {result.errors.slice(0, 200).map((e, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
                    >
                      row {e.row} • {e.field}: {e.message}
                    </Typography>
                  ))}
                  {result.errors.length > 200 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Showing first 200 errors.
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}

