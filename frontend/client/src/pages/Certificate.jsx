import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import API from "../services/api";

function Certificate() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get(`/certificates/${id}`);
        if (mounted) setCertificate(res.data);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || "Certificate not found");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Certificate
          </Typography>
          <Typography color="text.secondary">ID: {id}</Typography>
        </Box>
        <Button component={RouterLink} to="/" variant="outlined">
          Back
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {certificate && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Verified. You can download the official PDF.
          </Alert>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" fontWeight={900}>
                {certificate.studentName}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {certificate.domain}
              </Typography>
              <Typography sx={{ mt: 1.5 }}>
                {new Date(certificate.startDate).toDateString()} –{" "}
                {new Date(certificate.endDate).toDateString()}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
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
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}

export default Certificate;