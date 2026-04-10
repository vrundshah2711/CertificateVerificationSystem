import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const theme = responsiveFontSizes(
  createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },
    secondary: { main: "#10b981" },
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900 }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }
    },
    MuiContainer: {
      defaultProps: {
        disableGutters: false
      }
    }
  }
  })
);

