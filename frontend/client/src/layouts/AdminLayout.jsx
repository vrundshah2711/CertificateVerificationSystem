import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const drawerWidth = 260;
const appBarHeight = 64;

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = useMemo(
    () => [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/import", label: "Bulk Import" },
      { to: "/admin/users", label: "Users" }
    ],
    []
  );

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }} color="text.secondary">
        Admin Panel
      </Typography>
      <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>
        Certificate System
      </Typography>
      <Divider sx={{ my: 2 }} />
      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 2,
              "&.active": { bgcolor: "rgba(37, 99, 235, 0.10)" }
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 700 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)"
        }}
      >
        <Toolbar>
          <Button
            variant="text"
            onClick={() => setOpen(true)}
            sx={{ display: { md: "none" }, mr: 1, fontWeight: 800 }}
          >
            Menu
          </Button>
          <Typography sx={{ flexGrow: 1 }} fontWeight={900}>
            Admin
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mr: 2,
              display: { xs: "none", sm: "block" },
              maxWidth: 360,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {user?.email} ({user?.role})
          </Typography>
          <Button
            variant="outlined"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: "min(86vw, 320px)" }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          pt: `${appBarHeight}px`,
          px: { xs: 1.5, sm: 2, md: 3 },
          pb: { xs: 2, md: 3 }
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 0 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

