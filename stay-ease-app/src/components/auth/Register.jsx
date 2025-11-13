import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Divider,
} from "@mui/material";
import ConsentDialog from "./components/GoogleConsentDialog";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { sendVerificationEmail } from "../../utils/emailService";
import { useNavigate, Link } from "react-router-dom";
import { signInWithGoogleForRegister } from "../../utils/googleAuth";
import GoogleIcon from "@mui/icons-material/Google";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [showGoogleConsent, setShowGoogleConsent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleRegister = async () => {
    setError("");
    setSuccess("");
    setShowGoogleConsent(true);
  };

  const handleGoogleConsent = async () => {
    setShowGoogleConsent(false);
    try {
      const { userData, isNewUser } = await signInWithGoogleForRegister();
      if (isNewUser) {
        setSuccess("Registration successful! A verification email has been sent to your inbox. Please check your email to verify your account before logging in.");
        setTimeout(() => navigate("/login"), 5000);
      } else if (!userData.verified) {
        setError("Please verify your email before logging in. Check your inbox for the verification email.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (userData.role === "admin") {
            navigate("/admin/dashboard");
          } else if (userData.role === "host") {
            navigate("/host/dashboard");
          } else {
            navigate("/guest/dashboard");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Google registration failed:", error);
      setError(error.message || "Google sign-up failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, phone, address, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !address || !password || !confirmPassword)
      return setError("Please fill in all fields.");

    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate verification token (simple base64 encoded email + timestamp)
      const verificationToken = btoa(`${email}:${Date.now()}`).replace(/[+/=]/g, "");
      
      // Create verification link
      const baseUrl = window.location.origin;
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      // Add to Firestore with verification token
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phone,
        address,
        role: "guest",
        createdAt: new Date().toISOString(),
        verified: false,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      // Send verification email via EmailJS
      try {
        await sendVerificationEmail(email, fullName, verificationLink);
        setSuccess("Registration successful! A verification email has been sent to your inbox. Please check your email to verify your account.");
        setTimeout(() => navigate("/login"), 5000);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Still show success but warn about email
        setSuccess("Account created successfully! However, there was an issue sending the verification email. Please contact support.");
        setTimeout(() => navigate("/login"), 5000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Grid
      container
      sx={{
        minHeight: { xs: "100vh", md: "85vh" },
        backgroundImage:
          "linear-gradient(180deg, rgba(247,245,236,0.9) 0%, rgba(255,255,255,1) 100%)",
        alignItems: "stretch",
      }}
    >
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: { xs: "none", md: "block" },
        }}
      ></Grid>

      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, width: "100%", maxWidth: 420, backgroundColor: "#ffffff" }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="#5f7d45"
            gutterBottom
          >
            Welcome to StayEase
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Sign up with email
            </Typography>
          </Divider>

          <form onSubmit={handleSubmit}>
            {["fullName", "email", "phone", "address"].map((field) => (
              <TextField
                key={field}
                label={
                  field === "fullName"
                    ? "Full Name"
                    : field === "email"
                    ? "Email Address"
                    : field === "phone"
                    ? "Phone Number"
                    : "Address"
                }
                name={field}
                fullWidth
                margin="normal"
                value={formData[field]}
                onChange={handleChange}
                required
              />
            ))}
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1,
                bgcolor: "#87ab69",
                color: "#fffdd0",
                fontWeight: "bold",
                fontSize: ".95rem",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { bgcolor: "#76965d" },
              }}
            >
              Create Account
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
            onClick={handleGoogleRegister}
            sx={{
              py: 1,
              borderColor: "#db4437",
              color: "#db4437",
              textTransform: "none",
              fontWeight: 500,
              fontSize: ".95rem",
              "&:hover": {
                borderColor: "#c23321",
                bgcolor: "rgba(219, 68, 55, 0.04)",
              },
            }}
          >
            Continue with Google
          </Button>

          <ConsentDialog
            open={showGoogleConsent}
            onClose={() => setShowGoogleConsent(false)}
            onAgree={handleGoogleConsent}
          />

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#87ab69",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
