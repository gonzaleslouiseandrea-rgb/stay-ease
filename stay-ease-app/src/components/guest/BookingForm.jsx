import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID, db, auth } from "../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";

export default function BookingForm({ listing }) {
  const [guestNote, setGuestNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const amount = listing?.price || 200;
  const currency = "USD";

  const handleSaveBooking = async (order) => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setErrorMsg("You must be logged in to book a stay.");
        return;
      }

      await addDoc(collection(db, "bookings"), {
        guestId: user.uid,
        hostId: listing?.hostId || "unknown",
        listingId: listing?.id || "unknown",
        amount,
        currency,
        orderID: order.id,
        payerName: order.payer.name.given_name,
        payerEmail: order.payer.email_address,
        note: guestNote,
        status: "paid",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Booking confirmed! Payment successful.");
      setErrorMsg("");
    } catch (error) {
      console.error("Error saving booking:", error);
      setErrorMsg("Error saving booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 600,
          mx: "auto",
          mt: 6,
          borderRadius: 3,
          bgcolor: "#fff",
        }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold" color="#5f7d45">
          Confirm Your Booking
        </Typography>

        <Typography variant="body1" mb={3}>
          You’re booking:{" "}
          <strong>{listing?.title || "Selected Stay"}</strong> for{" "}
          <strong>${amount}</strong>.
        </Typography>

        <TextField
          label="Add a note for your host (optional)"
          fullWidth
          multiline
          rows={3}
          value={guestNote}
          onChange={(e) => setGuestNote(e.target.value)}
          sx={{ mb: 3 }}
        />

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: { value: amount.toString() },
                    description: `Booking for ${listing?.title || "StayEase Property"}`,
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              const order = await actions.order.capture();
              await handleSaveBooking(order);
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setErrorMsg("Payment failed. Please try again.");
            }}
          />
        )}
      </Paper>
    </PayPalScriptProvider>
  );
}
