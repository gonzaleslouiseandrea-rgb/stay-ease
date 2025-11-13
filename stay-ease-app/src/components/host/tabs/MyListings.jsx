import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) fetchListings();
  }, [user]);

  const fetchListings = async () => {
    try {
      const q = query(collection(db, "listings"), where("hostId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, "listings", id));
      setListings((prev) => prev.filter((listing) => listing.id !== id));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        My Listings
      </Typography>

      <Grid container spacing={3}>
        {listings.length === 0 ? (
          <Typography>No listings yet.</Typography>
        ) : (
          listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card>
                {listing.imageUrl && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={listing.imageUrl}
                    alt={listing.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {listing.location}
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    ₱{listing.price}/night
                  </Typography>

                  <Box mt={2} sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#87ab69", color: "#fff" }}
                      onClick={() =>
                        navigate(`/host/edit-listing/${listing.id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(listing.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
