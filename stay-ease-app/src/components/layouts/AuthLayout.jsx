import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f5ecff",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
