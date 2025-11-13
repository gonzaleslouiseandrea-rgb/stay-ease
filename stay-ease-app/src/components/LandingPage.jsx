// src/components/LandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Skeleton,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const FEATURE_CARDS = [
  {
    icon: <HomeWorkIcon fontSize="large" sx={{ color: "#fff" }} />,
    title: "Thoughtfully curated stays",
    description: "Browse handpicked homes, experiences, and services designed for restorative getaways.",
  },
  {
    icon: <LocalFireDepartmentIcon fontSize="large" sx={{ color: "#fff" }} />,
    title: "Hosted by locals",
    description: "Connect with trusted hosts who know the area best and tailor every stay to you.",
  },
  {
    icon: <AutoAwesomeIcon fontSize="large" sx={{ color: "#fff" }} />,
    title: "Concierge-level service",
    description: "Enjoy flexible itineraries, curated activities, and round-the-clock guest support.",
  },
];

// Category chips removed; using only Where, Dates, and Who filters

const heroBackground =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80";

export default function LandingPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whereValue, setWhereValue] = useState("");
  const [whereTerm, setWhereTerm] = useState("");
  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [unavailableListingIds, setUnavailableListingIds] = useState(new Set());

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const listingsQuery = query(collection(db, "listings"), where("status", "==", "published"));
        const snapshot = await getDocs(listingsQuery);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setListings(data);
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError("We couldn't load stays at the moment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Compute unavailable listing ids from bookings overlapping the selected date range
  useEffect(() => {
    const fetchUnavailable = async () => {
      try {
        if (!checkIn || !checkOut) {
          setUnavailableListingIds(new Set());
          return;
        }

        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        if (isNaN(inDate) || isNaN(outDate) || inDate >= outDate) {
          setUnavailableListingIds(new Set());
          return;
        }

        const inTs = Timestamp.fromDate(inDate);
        const outTs = Timestamp.fromDate(outDate);

        // Overlap condition: booking.checkIn < selectedCheckOut AND booking.checkOut > selectedCheckIn
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("checkIn", "<", outTs),
          where("checkOut", ">", inTs)
        );
        const snap = await getDocs(q);
        const ids = new Set(snap.docs.map((d) => d.data().listingId).filter(Boolean));
        setUnavailableListingIds(ids);
      } catch (e) {
        // Fail open: do not filter out if query fails
        setUnavailableListingIds(new Set());
      }
    };

    fetchUnavailable();
  }, [checkIn, checkOut]);

  const filteredListings = useMemo(() => {
    let results = [...listings];

    if (whereTerm.trim()) {
      const term = whereTerm.toLowerCase();
      results = results.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const location = item.location?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        return title.includes(term) || location.includes(term) || description.includes(term);
      });
    }

    // Exclude listings that are unavailable in the selected date range
    if (checkIn && checkOut && unavailableListingIds.size > 0) {
      results = results.filter((item) => !unavailableListingIds.has(item.id));
    }

    // Filter by guest count if listing has capacity defined
    if (guests && Number(guests) > 0) {
      results = results.filter((item) =>
        typeof item.capacity === "number" ? item.capacity >= Number(guests) : true
      );
    }

    return results;
  }, [listings, whereTerm, checkIn, checkOut, unavailableListingIds, guests]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setWhereTerm(whereValue.trim());
  };

  

  const handleExploreListing = (listing) => {
    // Placeholder: if detail page exists, navigate there. For now direct guests to register/login.
    if (listing?.id) {
      navigate("/login", { state: { redirectReason: "viewListing", listingId: listing.id } });
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f4f1" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", md: "75vh" },
          display: "flex",
          alignItems: "center",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.3)), url(${heroBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={4} maxWidth="640px">
            <Typography variant="h2" fontWeight={700} lineHeight={1.2}>
              Escape to stays curated for slow living
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Discover boutique homes, immersive experiences, and bespoke services selected to help you recharge
              anywhere in the world.
            </Typography>

            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 4,
                bgcolor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.7)",
              }}
            >
              <Stack spacing={2} direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }}>
                {/* Where */}
                <TextField
                  value={whereValue}
                  onChange={(e) => setWhereValue(e.target.value)}
                  placeholder="Where"
                  variant="outlined"
                  fullWidth
                  size="medium"
                />

                {/* Dates */}
                <TextField
                  type="date"
                  label="Check-in"
                  InputLabelProps={{ shrink: true }}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  size="medium"
                />
                <TextField
                  type="date"
                  label="Check-out"
                  InputLabelProps={{ shrink: true }}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  size="medium"
                />

                {/* Who */}
                <TextField
                  type="number"
                  label="Who"
                  inputProps={{ min: 1 }}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  size="medium"
                  sx={{ width: { xs: "100%", md: 140 } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon />}
                  sx={{
                    px: 4,
                    py: 1.4,
                    bgcolor: "#87ab69",
                    color: "#fffdd0",
                    fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#76965d" },
                  }}
                >
                  Search
                </Button>
              </Stack>

              
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Results Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 8 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Stays for you
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredListings.length} option{filteredListings.length === 1 ? "" : "s"} found
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {[...new Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 4 }} />
                <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : filteredListings.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "#fff",
            }}
            elevation={0}
          >
            <Typography variant="h6" fontWeight={600} mb={1}>
              No stays found for your search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting the filters or exploring other destinations.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredListings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card sx={{ borderRadius: 4, height: "100%", display: "flex", flexDirection: "column" }} elevation={3}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={listing.imageUrl || "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80"}
                    alt={listing.title || "StayEase listing"}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
                      {listing.category || "Stay"}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} mt={1}>
                      {listing.title || "Untitled stay"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {listing.location || "Curated destination"}
                    </Typography>
                    {listing.price && (
                      <Typography variant="subtitle1" fontWeight={600} mt={2}>
                        ${Number(listing.price).toLocaleString()} <Typography component="span" variant="body2">/ night</Typography>
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      sx={{
                        borderRadius: 99,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.2,
                        bgcolor: "#87ab69",
                        "&:hover": { bgcolor: "#76965d" },
                      }}
                      onClick={() => handleExploreListing(listing)}
                    >
                      Explore stay
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Highlights Section */}
      <Container maxWidth="lg" sx={{ pb: { xs: 10, md: 12 } }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          StayEase signatures
        </Typography>
        <Grid container spacing={3}>
          {FEATURE_CARDS.map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #87ab69, #5f7d45)",
                  color: "#fff",
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
                elevation={4}
              >
                <Box>{feature.icon}</Box>
                <Typography variant="h6" fontWeight={700}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
