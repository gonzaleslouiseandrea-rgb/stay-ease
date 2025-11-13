import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth, uploadToCloudinary } from "../../../firebaseConfig";

export default function AddListingForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    promoCode: "",
    location: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in.");
        setLoading(false);
        return;
      }

      const subRef = doc(db, "subscriptions", user.uid);
      const subSnap = await getDoc(subRef);
      if (!subSnap.exists()) {
        setMessage("An active subscription is required to add listings.");
        setLoading(false);
        return;
      }
      const sub = subSnap.data();
      const now = new Date();
      const periodEnd = sub?.periodEnd?.toDate ? sub.periodEnd.toDate() : null;
      const active = !!sub?.active && (!periodEnd || periodEnd >= now);
      const quota = sub?.quota;
      const used = sub?.used || 0;
      if (!active) {
        setMessage("Your subscription is inactive or expired.");
        setLoading(false);
        return;
      }
      if (typeof quota === "number" && used >= quota) {
        setMessage("You have reached your monthly listing limit.");
        setLoading(false);
        return;
      }

      let imageUrl = "";

      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      await addDoc(collection(db, "listings"), {
        ...formData,
        imageUrl,
        hostId: user.uid,
        createdAt: serverTimestamp(),
        status: "draft", // saved as draft initially
      });

      await updateDoc(subRef, { used: increment(1), updatedAt: serverTimestamp() });

      setMessage("Listing saved successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        promoCode: "",
        location: "",
        image: null,
      });
      setPreview(null);
    } catch (error) {
      console.error("Error saving listing:", error);
      setMessage("Error saving listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        maxWidth: 700,
        mx: "auto",
        mt: 4,
        borderRadius: 3,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2} color="#5f7d45">
        Add New Listing
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Promo Code"
              name="promoCode"
              fullWidth
              value={formData.promoCode}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Category (Home, Experience, Service)"
              name="category"
              fullWidth
              value={formData.category}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Location"
              name="location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                borderColor: "#87ab69",
                color: "#87ab69",
                "&:hover": { borderColor: "#76965d", color: "#76965d" },
              }}
            >
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>

            {preview && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: "#87ab69",
                color: "#fffdd0",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#76965d" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Listing as Draft"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {message && (
        <Typography textAlign="center" mt={2} color="#5f7d45">
          {message}
        </Typography>
      )}
    </Paper>
  );
}
