// src/components/host/tabs/DashboardHome.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardHome() {
  const [stats, setStats] = useState({ totalListings: 0, totalBookings: 0, upcoming: 0 });
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const fetch = async () => {
      const listingsSnap = await getDocs(query(collection(db, "listings"), where("hostId", "==", uid)));
      const bookingsSnap = await getDocs(query(collection(db, "bookings"), where("hostId", "==", uid)));
      const upcomingSnap = await getDocs(query(collection(db, "bookings"), where("hostId", "==", uid))); // filter client side
      const now = new Date();
      const upcomingCount = upcomingSnap.docs.filter(d => {
        const data = d.data();
        const cIn = data.checkIn ? new Date(data.checkIn.seconds * 1000) : null;
        return cIn && cIn >= now;
      }).length;

      setStats({ totalListings: listingsSnap.size, totalBookings: bookingsSnap.size, upcoming: upcomingCount });
    };
    fetch();
  }, [uid]);

  return (
    <Box>
      <Typography variant="h5" color="#5f7d45" mb={2}>Host Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography>Total Listings</Typography><Typography variant="h6">{stats.totalListings}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography>Total Bookings</Typography><Typography variant="h6">{stats.totalBookings}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography>Upcoming</Typography><Typography variant="h6">{stats.upcoming}</Typography></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
