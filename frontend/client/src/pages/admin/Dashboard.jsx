import { Card, CardContent, Grid, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage users and import student certificate data securely.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={900} variant="h6">
                Bulk Import
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Upload an Excel file and validate all rows before saving.
              </Typography>
              <Button component={RouterLink} to="/admin/import" variant="contained">
                Import Excel
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={900} variant="h6">
                Users
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Create and manage admin/user accounts.
              </Typography>
              <Button component={RouterLink} to="/admin/users" variant="contained">
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

