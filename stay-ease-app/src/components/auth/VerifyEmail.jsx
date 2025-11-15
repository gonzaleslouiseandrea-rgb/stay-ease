// src/auth/VerifyEmail.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
const VERIFY_EMAIL_ENDPOINT = import.meta.env.VITE_VERIFY_EMAIL_ENDPOINT;

export default function VerifyEmail() {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToLogin = useCallback(() => {
    try {
      localStorage.setItem(
        "stayEaseEmailVerified",
        JSON.stringify({ email: verifiedEmail, timestamp: Date.now() })
      );
    } catch (error) {
      console.error("Failed to store verification payload", error);
    }

    // Attempt to close verification tab if opened from login
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    navigate("/login", { replace: true });
  }, [navigate, verifiedEmail]);

  useEffect(() => {
    const verifyUserEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const email = queryParams.get("email");
      const token = queryParams.get("token");

      if (!email || !token) {
        setStatus("failed");
        setMessage("Invalid verification link. Missing email or token.");
        return;
      }

      try {
        if (!VERIFY_EMAIL_ENDPOINT) {
          console.error("VITE_VERIFY_EMAIL_ENDPOINT is not configured.");
          setStatus("failed");
          setMessage("Verification service is not configured. Please contact support.");
          return;
        }

        const url = `${VERIFY_EMAIL_ENDPOINT}?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(token)}`;

        const response = await fetch(url, {
          method: "GET",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data || data.success === false) {
          setStatus("failed");
          setMessage(
            (data && data.message) ||
              "An error occurred during verification. Please try again or contact support."
          );
          return;
        }

        setVerifiedEmail(email);

        if (data.alreadyVerified) {
          setStatus("success");
          setMessage(
            data.message ||
              "Your email has already been verified. You are registered! Redirecting to login..."
          );
        } else {
          setStatus("success");
          setMessage(
            data.message ||
              "Your email has been successfully verified! You are now registered. Redirecting to login..."
          );
        }

        setTimeout(() => {
          redirectToLogin();
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage(
          "An error occurred during verification. Please try again or contact support."
        );
      }
    };

    verifyUserEmail();
  }, [location.search, redirectToLogin]);

  return (
    <Box
      sx={{
        bgcolor: "#f7f5ecff",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 5,
          borderRadius: 5,
          width: { xs: "90%", sm: "400px" },
        }}
      >
        {status === "verifying" && (
          <>
            <CircularProgress color="success" />
            <Typography mt={2} color="text.secondary">
              Verifying your email...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h5" fontWeight="bold" color="#87ab69" mb={2}>
              ✅ Registration Complete!
            </Typography>
            <Typography variant="h6" color="#5f7d45" mb={2}>
              Your email has been verified
            </Typography>
            <Typography mt={2} color="text.secondary" mb={3}>
              {message || "You are now registered with StayEase! Redirecting to login page..."}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#87ab69",
                color: "#FFFDD0",
                py: 1.2,
                "&:hover": { bgcolor: "#76965d" },
              }}
              onClick={redirectToLogin}
            >
              Go to Login Now
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <Typography variant="h5" fontWeight="bold" color="error">
              ❌ Verification Failed
            </Typography>
            <Typography mt={2} color="text.secondary">
              {message || "Invalid or expired verification link."}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#87ab69",
                  color: "#87ab69",
                  "&:hover": { borderColor: "#76965d", bgcolor: "#f0f0f0" },
                }}
                onClick={() => navigate("/register")}
              >
                Back to Register
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#87ab69",
                  color: "#FFFDD0",
                  "&:hover": { bgcolor: "#76965d" },
                }}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
