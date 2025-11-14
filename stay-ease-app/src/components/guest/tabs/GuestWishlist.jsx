import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function GuestWishlist() {
  const [favorites, setFavorites] = useState([]);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const favs = data.favorites || [];
      setFavorites(favs);
    })();
  }, [user]);

  const handleView = (listingId) => {
    if (!listingId) return;
    navigate(`/login`, { state: { redirectReason: "viewListing", listingId } });
  };

  if (!user) {
    return <Typography>Please login to view your wishlist.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" mb={2} color="#5f7d45">
        Wishlist
      </Typography>
      {favorites.length === 0 ? (
        <Typography color="text.secondary">You have no favorites yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {favorites.map((fav) => (
            <Grid item xs={12} sm={6} md={4} key={fav.id || fav}>
              <Card>
                {fav.imageUrl && (
                  <CardMedia component="img" height="160" image={fav.imageUrl} alt={fav.title || "Listing"} />
                )}
                <CardContent>
                  <Typography variant="subtitle1">{fav.title || "Listing"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fav.location || ""}
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }} onClick={() => handleView(fav.id || fav)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
