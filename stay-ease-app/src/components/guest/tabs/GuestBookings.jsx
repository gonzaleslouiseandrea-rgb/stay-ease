import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function GuestBookings() {
  const [bookings, setBookings] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(
        collection(db, "bookings"),
        where("guestId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  return (
    <Box>
      <Typography variant="h6" mb={2} color="#5f7d45">
        My Bookings
      </Typography>
      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No bookings yet.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.listingTitle || b.listingId || "Listing"}</TableCell>
                  <TableCell>
                    {b.currency || ""} {b.amount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.status || "paid"}
                      color={b.status === "paid" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
