import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import API from "../../services/api";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });

  const canCreateAdmin = currentUser?.role === "SUPER_ADMIN";

  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const res = await API.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roles = useMemo(() => {
    const base = [{ value: "USER", label: "USER" }];
    if (canCreateAdmin) base.unshift({ value: "ADMIN", label: "ADMIN" });
    return base;
  }, [canCreateAdmin]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Users
          </Typography>
          <Typography color="text.secondary">
            Create accounts and manage status.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
          <Button variant="outlined" onClick={refresh} disabled={busy}>
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ flexGrow: { xs: 1, sm: 0 } }}
          >
            Create user
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={800}>
              Total: {users.length}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2, display: "grid", gap: 1.2 }}>
            {users.map((u) => (
              <Box
                key={u.id}
                sx={{
                  p: 1.5,
                  border: "1px solid rgba(15, 23, 42, 0.10)",
                  borderRadius: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap"
                }}
              >
                <Box sx={{ minWidth: { xs: "100%", sm: 280 } }}>
                  <Typography fontWeight={900}>{u.name || "(no name)"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {u.email} • {u.role} • {u.status}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={u.role === "SUPER_ADMIN"}
                    onClick={async () => {
                      try {
                        await API.patch(`/users/${u.id}`, {
                          status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
                        });
                        await refresh();
                      } catch (err) {
                        setError(err?.response?.data?.message || "Update failed");
                      }
                    }}
                  >
                    {u.status === "ACTIVE" ? "Disable" : "Enable"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create user</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            fullWidth
            required
            type="password"
          />
          <TextField
            label="Role"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            select
            fullWidth
          >
            {roles.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
          {!canCreateAdmin && (
            <Alert severity="info">
              Only SUPER_ADMIN can create ADMIN accounts.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setError("");
              try {
                await API.post("/users", form);
                setOpen(false);
                setForm({ name: "", email: "", password: "", role: "USER" });
                await refresh();
              } catch (err) {
                setError(err?.response?.data?.message || "Create failed");
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

