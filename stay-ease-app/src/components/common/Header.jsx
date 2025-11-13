import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container, Box } from "@mui/material";

export default function Header() {
  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: "#87ab69" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 0.5 }}>
            StayEase
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              to="/guest/become-host"
              variant="text"
              sx={{
                color: "#fffdd0",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Become a Host
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              sx={{
                color: "#fffdd0",
                borderColor: "#fffdd0",
                textTransform: "none",
                "&:hover": { borderColor: "#f8f2b8", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: "#fffdd0",
                color: "#87ab69",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { bgcolor: "#f8f2b8" },
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
