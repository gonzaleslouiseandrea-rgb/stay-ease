import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function GuestProfile() {
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile((prev) => ({ ...prev, ...data }));
      }
    })();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setSaving(false);
    alert("Profile updated");
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" mb={2} color="#5f7d45">
        Profile
      </Typography>
      <TextField
        label="Full Name"
        name="fullName"
        fullWidth
        sx={{ mb: 2 }}
        value={profile.fullName || ""}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        sx={{ mb: 2 }}
        value={profile.email || user?.email || ""}
        disabled
      />
      <TextField
        label="Phone"
        name="phone"
        fullWidth
        sx={{ mb: 2 }}
        value={profile.phone || ""}
        onChange={handleChange}
      />
      <TextField
        label="Address"
        name="address"
        fullWidth
        sx={{ mb: 2 }}
        value={profile.address || ""}
        onChange={handleChange}
      />
      <Button variant="contained" sx={{ bgcolor: "#87ab69" }} onClick={handleSave} disabled={saving}>
        Save
      </Button>
    </Paper>
  );
}
