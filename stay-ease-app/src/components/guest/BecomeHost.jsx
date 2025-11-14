import React, { useState } from "react";
import { Box, Button, Typography, Paper, Alert, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Divider, Link, Stepper, Step, StepLabel } from "@mui/material";
import { db, auth } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function BecomeHost() {
  const [step, setStep] = useState(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!requirements.validId || !requirements.propertyRight || !requirements.safetyClean || !requirements.payoutReady)
      return setError("Please confirm all hosting requirements.");
    if (!acceptTerms) return setError("You must accept the Terms and Security Policies.");

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to complete your host application.");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        role: "host",
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
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Requirements</StepLabel>
          </Step>
          <Step>
            <StepLabel>Subscription</StepLabel>
          </Step>
          <Step>
            <StepLabel>Terms & Policy</StepLabel>
          </Step>
        </Stepper>

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Step 1: Hosting Requirements
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                To host with StayEase, you must meet all of the following requirements. Please review and confirm each
                item.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={requirements.validId}
                      onChange={(e) => setRequirements((r) => ({ ...r, validId: e.target.checked }))}
                    />
                  }
                  label="I have a valid government-issued ID (to be provided upon request)."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={requirements.propertyRight}
                      onChange={(e) => setRequirements((r) => ({ ...r, propertyRight: e.target.checked }))}
                    />
                  }
                  label="I own the property OR have written permission to host it."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={requirements.safetyClean}
                      onChange={(e) => setRequirements((r) => ({ ...r, safetyClean: e.target.checked }))}
                    />
                  }
                  label="The space meets basic safety, cleanliness, and local compliance standards."
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={requirements.payoutReady}
                      onChange={(e) => setRequirements((r) => ({ ...r, payoutReady: e.target.checked }))}
                    />
                  }
                  label="I can receive payouts (PayPal/Bank/E-wallet) and provide accurate details."
                />
              </FormGroup>

              <Divider sx={{ my: 3 }} />

              <Button
                type="button"
                fullWidth
                disabled={
                  !requirements.validId ||
                  !requirements.propertyRight ||
                  !requirements.safetyClean ||
                  !requirements.payoutReady
                }
                sx={{
                  mt: 1,
                  bgcolor: "#87ab69",
                  color: "#fffdd0",
                  "&:hover": { bgcolor: "#76965d" },
                }}
                onClick={() => setStep(1)}
              >
                Continue to Subscription
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Step 2: Subscription Plan
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Select a plan that fits how often you intend to host. You’ll be able to manage and process
                subscription payments from the Host Dashboard after becoming a host.
              </Typography>

              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Choose a Subscription Plan (PHP)
              </Typography>
              <RadioGroup value={plan} onChange={(e) => setPlan(e.target.value)}>
                <FormControlLabel
                  value="basic_monthly"
                  control={<Radio />}
                  label="Basic — ₱299 / month — 3 listings per month"
                />
                <FormControlLabel
                  value="pro_monthly"
                  control={<Radio />}
                  label="Pro — ₱599 / month — 8 listings per month"
                />
                <FormControlLabel
                  value="annual"
                  control={<Radio />}
                  label="Annual — ₱1299 / year — Unlimited listings"
                />
              </RadioGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You’ll complete the payment on the Host Dashboard → Subscription after you are approved as a host.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
                <Button
                  fullWidth
                  type="button"
                  sx={{
                    bgcolor: "#87ab69",
                    color: "#fffdd0",
                    "&:hover": { bgcolor: "#76965d" },
                  }}
                  onClick={() => setStep(2)}
                >
                  Continue to Terms
                </Button>
              </Box>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Step 3: Terms & Security Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Please review our Terms of Service and Security & Safety Policy. You must agree to these before
                becoming a StayEase host.
              </Typography>

              <Typography variant="body2" mb={2}>
                By continuing, you acknowledge your responsibility to provide accurate information, maintain a safe and
                compliant space, and follow all applicable local regulations and StayEase hosting standards.
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                }
                label={
                  <>
                    I have read and agree to the&nbsp;
                    <Link href="#" target="_blank" rel="noopener">
                      Terms of Service
                    </Link>
                    &nbsp;and&nbsp;
                    <Link href="#" target="_blank" rel="noopener">
                      Security & Safety Policy
                    </Link>
                    .
                  </>
                }
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  sx={{
                    bgcolor: "#87ab69",
                    color: "#fffdd0",
                    "&:hover": { bgcolor: "#76965d" },
                  }}
                >
                  Agree & Become Host
                </Button>
              </Box>
            </>
          )}
        </form>
      </Paper>
    </Box>
  );
}
