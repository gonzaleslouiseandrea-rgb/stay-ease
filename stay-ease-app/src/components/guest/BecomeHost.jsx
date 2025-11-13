import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Divider, Link } from "@mui/material";
import { db, auth } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function BecomeHost() {
  const [form, setForm] = useState({ experience: "", propertyType: "", description: "" });
  const [requirements, setRequirements] = useState({
    validId: false,
    propertyRight: false,
    safetyClean: false,
    payoutReady: false,
  });
  const [plan, setPlan] = useState("basic_monthly");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { experience, propertyType, description } = form;
    if (!experience || !propertyType || !description) return setError("Please fill all fields.");
    if (!requirements.validId || !requirements.propertyRight || !requirements.safetyClean || !requirements.payoutReady)
      return setError("Please confirm all hosting requirements.");
    if (!acceptTerms) return setError("You must accept the Terms and Security Policies.");

    try {
      // Minimal eligibility check
      if (experience.length <= 10) return setError("Please provide more details about your hosting experience.");

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        role: "host",
        hostDetails: form,
        hostRequirements: requirements,
        selectedPlan: plan,
        acknowledgedPoliciesAt: new Date().toISOString(),
      });

      setSuccess("Application accepted. Please complete your subscription payment on the next screen.");
      setTimeout(() => navigate("/host/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f7f5ecff",
      }}
    >
      <Paper sx={{ p: 5, maxWidth: 720, width: "100%", borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#87ab69" textAlign="center" mb={2}>
          Become a StayEase Host
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Basic Information</Typography>
          <TextField
            label="Hosting Experience (in years or details)"
            name="experience"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={form.experience}
          />
          <TextField
            label="Type of Property (Home, Experience, Service)"
            name="propertyType"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={form.propertyType}
          />
          <TextField
            label="Short Description"
            name="description"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={form.description}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600} mb={1}>Hosting Requirements</Typography>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={requirements.validId} onChange={(e)=>setRequirements(r=>({...r, validId: e.target.checked}))} />} label="I have a valid government-issued ID (to be provided upon request)." />
            <FormControlLabel control={<Checkbox checked={requirements.propertyRight} onChange={(e)=>setRequirements(r=>({...r, propertyRight: e.target.checked}))} />} label="I own the property OR have written permission to host it." />
            <FormControlLabel control={<Checkbox checked={requirements.safetyClean} onChange={(e)=>setRequirements(r=>({...r, safetyClean: e.target.checked}))} />} label="The space meets basic safety, cleanliness, and local compliance standards." />
            <FormControlLabel control={<Checkbox checked={requirements.payoutReady} onChange={(e)=>setRequirements(r=>({...r, payoutReady: e.target.checked}))} />} label="I can receive payouts (PayPal/Bank/E-wallet) and provide accurate details." />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600} mb={1}>Choose a Subscription Plan (PHP)</Typography>
          <RadioGroup value={plan} onChange={(e)=>setPlan(e.target.value)}>
            <FormControlLabel value="basic_monthly" control={<Radio />} label="Basic — ₱299 / month — 3 listings per month" />
            <FormControlLabel value="pro_monthly" control={<Radio />} label="Pro — ₱599 / month — 8 listings per month" />
            <FormControlLabel value="annual" control={<Radio />} label="Annual — ₱1299 / year — Unlimited listings" />
          </RadioGroup>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You’ll complete the payment on the Host Dashboard → Subscription after submission.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={<Checkbox checked={acceptTerms} onChange={(e)=>setAcceptTerms(e.target.checked)} />}
            label={<>
              I agree to the&nbsp;
              <Link href="#" target="_blank" rel="noopener">Terms of Service</Link>
              &nbsp;and&nbsp;
              <Link href="#" target="_blank" rel="noopener">Security & Safety Policy</Link>.
            </>}
          />
          <Button
            type="submit"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "#87ab69",
              color: "#fffdd0",
              "&:hover": { bgcolor: "#76965d" },
            }}
          >
            Submit & Continue
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
