// src/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Alert, Divider, Container } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { signInWithGoogleForLogin } from "../../utils/googleAuth";
import GoogleIcon from "@mui/icons-material/Google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "stayEaseEmailVerified" && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          setSuccessMessage(`Email ${payload.email || ""} verified successfully. Please sign in.`);
          localStorage.removeItem("stayEaseEmailVerified");
        } catch (err) {
          console.error("Failed to parse verification payload", err);
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    try {
      const stored = localStorage.getItem("stayEaseEmailVerified");
      if (stored) {
        const payload = JSON.parse(stored);
        setSuccessMessage(`Email ${payload.email || ""} verified successfully. Please sign in.`);
        localStorage.removeItem("stayEaseEmailVerified");
      }
    } catch (err) {
      console.error("Failed to parse stored verification payload", err);
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get Firestore user doc to check verification
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("User record not found.");
        return;
      }

      const userData = userDoc.data();
      if (!userData.verified) {
        setError("Please verify your email before logging in. Check your inbox for the verification email.");
        return;
      }

      // Redirect based on user role
      redirectUser(userData);
    } catch (error) {
      console.error("Login failed:", error.message);
      setError("Invalid email or password.");
    }
  };

  const redirectUser = (userData) => {
    if (userData.role === "admin") {
      navigate("/admin/dashboard");
    } else if (userData.role === "host") {
      navigate("/host/dashboard");
    } else {
      navigate("/guest/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMessage("");
    try {
      const { userData } = await signInWithGoogleForLogin();
      if (!userData.verified) {
        setError("Please verify your email before logging in. Check your inbox for the verification email.");
        return;
      }

      redirectUser(userData);
    } catch (error) {
      console.error("Google login failed:", error);
      setError(error.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="xs" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backdropFilter: "blur(8px)",
            bgcolor: "rgba(255,255,255,0.85)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
            StayEase Login
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Sign in with email
            </Typography>
          </Divider>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1,
                bgcolor: "#87ab69",
                "&:hover": { bgcolor: "#76965d" },
              }}
            >
              Login
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or continue with
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1,
              borderColor: "#db4437",
              color: "#db4437",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                borderColor: "#c23321",
                bgcolor: "rgba(219, 68, 55, 0.04)",
              },
            }}
          >
            Continue with Google
          </Button>

          <Typography textAlign="center" mt={2}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "#87ab69", fontWeight: "bold" }}>
              Register
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
