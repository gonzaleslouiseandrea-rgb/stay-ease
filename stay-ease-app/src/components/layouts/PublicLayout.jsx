import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { Box, Toolbar } from "@mui/material";

export default function PublicLayout() {
  return (
    <Box sx={{ bgcolor: "#f7f5ecff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      {/* Spacer for fixed AppBar */}
      <Toolbar sx={{ minHeight: 72 }} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
