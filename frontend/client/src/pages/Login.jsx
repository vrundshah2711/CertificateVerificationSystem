import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  TextField,
  Typography
} from "@mui/material";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Sign in
        </Typography>
        <Typography color="text.secondary">
          Admins and staff can manage imports and users.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setBusy(true);
              try {
                await login(email, password);
                navigate(from, { replace: true });
              } catch (err) {
                setError(err?.response?.data?.message || "Login failed");
              } finally {
                setBusy(false);
              }
            }}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
              required
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              fullWidth
              required
            />
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/" underline="hover">
              Back to verification
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

