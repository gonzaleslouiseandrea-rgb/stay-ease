import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db, uploadToCloudinary } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Listing not found.");
        navigate("/host/my-listings");
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleChange = (e) => {
    setListing({ ...listing, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setListing({ ...listing, imageUrl: url });
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error uploading image.");
    }
    setUploading(false);
  };

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "listings", listing.id);
      await updateDoc(docRef, {
        title: listing.title,
        description: listing.description,
        price: Number(listing.price),
        location: listing.location,
        imageUrl: listing.imageUrl,
      });
      alert("✅ Listing updated successfully!");
      navigate("/host/my-listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Error updating listing.");
    }
  };

  if (!listing)
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress color="success" />
      </Box>
    );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f7f5ecff",
        px: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 500, borderRadius: 3 }}>
        <Typography variant="h5" mb={3} color="#5f7d45">
          Edit Listing
        </Typography>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          value={listing.title || ""}
          onChange={handleChange}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={listing.description || ""}
          onChange={handleChange}
        />
        <TextField
          label="Location"
          name="location"
          fullWidth
          margin="normal"
          value={listing.location || ""}
          onChange={handleChange}
        />
        <TextField
          label="Price (₱)"
          name="price"
          fullWidth
          type="number"
          margin="normal"
          value={listing.price || ""}
          onChange={handleChange}
        />

        {/* 🔹 Image Upload Section */}
        <Box mt={2}>
          <Typography variant="body2" mb={1}>
            Current Image:
          </Typography>
          {listing.imageUrl && (
            <img
              src={listing.imageUrl}
              alt="Listing"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />
          )}
          <Button variant="outlined" component="label" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload New Image"}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageUpload}
            />
          </Button>
        </Box>

        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: "#87ab69", color: "#fff" }}
          onClick={handleUpdate}
          disabled={uploading}
        >
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
}
