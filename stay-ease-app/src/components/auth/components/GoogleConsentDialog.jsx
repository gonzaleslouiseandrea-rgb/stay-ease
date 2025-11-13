import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Box,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleConsentDialog = ({ open, onClose, onAgree }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAgree = () => {
    if (isChecked) {
      onAgree();
      setIsChecked(false);
    }
  };

  const handleClose = () => {
    setIsChecked(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#5f7d45" }}>
        Connect your Google account
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: "#faf9f6" }}>
        <Stack spacing={2.5}>
          <Typography variant="body1">
            StayEase uses your Google account to create a seamless experience. We will request permission to access:
          </Typography>

          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body2" mb={1}>
              Your full name, to personalize your StayEase profile
            </Typography>
            <Typography component="li" variant="body2" mb={1}>
              Your Google email, to secure your account and communicate bookings
            </Typography>
            <Typography component="li" variant="body2">
              Your profile photo (optional), to help hosts recognize you
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            We respect your privacy. Your information is used strictly to create and verify your StayEase account in line
            with our Terms of Service and Privacy Policy.
          </Typography>

          <Divider sx={{ my: 1 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2">
                I consent to StayEase using my Google account details to create and verify my account.
              </Typography>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#faf9f6" }}>
        <Button onClick={handleClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAgree}
          variant="contained"
          disabled={!isChecked}
          startIcon={<GoogleIcon />}
          sx={{
            textTransform: "none",
            bgcolor: "#87ab69",
            "&:hover": { bgcolor: "#76965d" },
          }}
        >
          Continue with Google
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoogleConsentDialog;
