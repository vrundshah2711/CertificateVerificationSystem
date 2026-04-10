import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import API from "../services/api";

function Search() {
  const [id, setId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!id.trim()) return;
    try {
      setBusy(true);
      const res = await API.get(`/certificates/${id}`);
      setCertificate(res.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Certificate not found");
      setCertificate(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 3 }}>
        <Box>
          <Typography variant="h3" fontWeight={900}>
            Certificate Verification
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Search your certificate by ID to verify details and download the official PDF.
          </Typography>
        </Box>
        <Button component={RouterLink} to="/login" variant="outlined">
          Admin login
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <TextField
              label="Certificate ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              fullWidth
              placeholder="e.g. CERT-2026-0001"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={busy || !id.trim()}
              sx={{ minWidth: 140 }}
            >
              {busy ? "Searching..." : "Verify"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {certificate && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success">Certificate verified</Alert>
              <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
                <Typography variant="h5" fontWeight={900}>
                  {certificate.studentName}
                </Typography>
                <Typography color="text.secondary">{certificate.domain}</Typography>
                <Typography>
                  {new Date(certificate.startDate).toDateString()} –{" "}
                  {new Date(certificate.endDate).toDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificate ID: {certificate.certificateId}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/certificate/${certificate.certificateId}`)}
                >
                  View & Download
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    window.open(
                      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/certificates/${certificate.certificateId}/pdf`,
                      "_blank"
                    );
                  }}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Search;