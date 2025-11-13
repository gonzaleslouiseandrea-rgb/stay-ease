import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ✅ Role Verification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/auth/login");

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);

        // Only admin can access
        if (data.role !== "admin") {
          navigate("/");
        }
      } else {
        navigate("/auth/login");
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const drawer = (
    <Box sx={{ bgcolor: "#87ab69", height: "100%", color: "#fffdd0" }}>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          StayEase Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: "#dce5cd" }} />
      <List>
        {["Dashboard", "Users", "Listings", "Bookings", "Settings"].map((text) => (
          <ListItemButton
            key={text}
            onClick={() => setSelectedTab(text)}
            sx={{
              "&.Mui-selected": {
                bgcolor: "#76965d",
                color: "#fff",
              },
              "&:hover": { bgcolor: "#7ca563" },
            }}
            selected={selectedTab === text}
          >
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ bgcolor: "#dce5cd" }} />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#fffdd0",
            color: "#87ab69",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#f8f2b8" },
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const renderTab = () => {
    switch (selectedTab) {
      case "Dashboard":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="#5f7d45" mb={3}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: 2,
                  minWidth: 200,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Total Users
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#87ab69">
                  -
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: 2,
                  minWidth: 200,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Total Listings
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#87ab69">
                  -
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: 2,
                  minWidth: 200,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Total Bookings
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#87ab69">
                  -
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      case "Users":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="#5f7d45" mb={3}>
              User Management
            </Typography>
            <Typography color="text.secondary">
              User management features coming soon...
            </Typography>
          </Box>
        );
      case "Listings":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="#5f7d45" mb={3}>
              Listing Management
            </Typography>
            <Typography color="text.secondary">
              Listing management features coming soon...
            </Typography>
          </Box>
        );
      case "Bookings":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="#5f7d45" mb={3}>
              Booking Management
            </Typography>
            <Typography color="text.secondary">
              Booking management features coming soon...
            </Typography>
          </Box>
        );
      case "Settings":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="#5f7d45" mb={3}>
              Admin Settings
            </Typography>
            <Typography color="text.secondary">
              Admin settings coming soon...
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f7f5ecff", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#87ab69",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          {userData && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {userData.fullName || userData.email}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {renderTab()}
      </Box>
    </Box>
  );
}


