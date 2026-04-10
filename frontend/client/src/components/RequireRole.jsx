import { Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext.jsx";
import RequireAuth from "./RequireAuth.jsx";

export default function RequireRole({ allowedRoles, children }) {
  return (
    <RequireAuth>
      <Inner allowedRoles={allowedRoles}>{children}</Inner>
    </RequireAuth>
  );
}

function Inner({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!allowedRoles?.includes(user?.role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          Access denied
        </Typography>
        <Typography color="text.secondary">
          You don’t have permission to view this page.
        </Typography>
      </Box>
    );
  }
  return children;
}

