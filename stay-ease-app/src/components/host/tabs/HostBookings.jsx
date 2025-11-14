import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const q = query(
        collection(db, "bookings"),
        where("hostId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(data);
    })();
  }, [uid]);

  return (
    <Box>
      <Typography variant="h5" mb={2} color="#5f7d45">
        Bookings
      </Typography>
      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No bookings yet.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.listingTitle || b.listingId || "Listing"}</TableCell>
                  <TableCell>{b.payerEmail || "N/A"}</TableCell>
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
                    {b.createdAt?.toDate
                      ? b.createdAt.toDate().toLocaleString()
                      : "-"}
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
