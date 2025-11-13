// src/components/host/tabs/AccountSettings.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function AccountSettings() {
  const uid = auth.currentUser?.uid;
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setProfile(snap.data());
    })();
  }, [uid]);

  const save = async () => {
    if (!uid) return;
    setSaving(true);
    await updateDoc(doc(db, "users", uid), { name: profile.name, phone: profile.phone });
    setSaving(false);
    alert("Profile updated");
  };

  return (
    <Box>
      <Typography variant="h5" mb={2} color="#5f7d45">Account Settings</Typography>
      <Box sx={{ maxWidth: 600 }}>
        <TextField label="Name" fullWidth value={profile.name || ""} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} sx={{ mb: 2 }} />
        <TextField label="Email" fullWidth value={profile.email || ""} disabled sx={{ mb: 2 }} />
        <TextField label="Phone" fullWidth value={profile.phone || ""} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} sx={{ mb: 2 }} />
        <Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: "#87ab69" }}>Save</Button>
      </Box>
    </Box>
  );
}
