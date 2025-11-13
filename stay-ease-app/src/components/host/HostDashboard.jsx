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

// imports near top of HostDashboard.jsx
import DashboardHome from "./tabs/DashboardHome";
import MyListings from "./tabs/MyListings";
import AddListing from "./tabs/AddListing";
import Messages from "./tabs/MessagesList";
import CalendarView from "./tabs/CalendarView";
import AccountSettings from "./tabs/AccountSettings";
import ChatRoom from "./tabs/ChatRoom";
import Subscription from "./tabs/Subscription";


const drawerWidth = 240;

export default function HostDashboard() {
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

        // Only host or admin can access
        if (data.role !== "host" && data.role !== "admin") {
          navigate("/guest/become-host");
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
          StayEase
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: "#dce5cd" }} />
      <List>
        [
          "Dashboard",
          "My Listings",
          "Add Listing",
          "Messages",
          "Chat Room",
          "Calendar",
          "Subscription",
          "Account Settings",
        ].map((text) => (
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
        return <DashboardHome />;
      case "My Listings":
        return <MyListings />;
      case "Add Listing":
        return <AddListing />;
      case "Messages":
        return <Messages />;
      case "Chat Room":
        return <ChatRoom />;
      case "Calendar":
        return <CalendarView />;
      case "Subscription":
        return <Subscription />;
      case "Account Settings":
        return <AccountSettings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f7f5ecff", minHeight: "100vh" }}>
      {/* 🔹 Mobile Drawer */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
          bgcolor: "#87ab69",
          color: "#fffdd0",
          boxShadow: 0,
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {selectedTab}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 🔹 Sidebar for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            bgcolor: "#87ab69",
            color: "#fffdd0",
            border: "none",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* 🔹 Drawer for Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* 🔹 Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          mt: { xs: 7, sm: 0 },
          bgcolor: "#ffffff",
          borderTopLeftRadius: { sm: 16 },
          borderBottomLeftRadius: { sm: 16 },
        }}
      >
        <AppBar
          position="static"
          sx={{
            bgcolor: "#f7f5ecff",
            color: "#5f7d45",
            boxShadow: 0,
            mb: 3,
          }}
        >
          <Toolbar>
            <Typography variant="h5" fontWeight="bold">
              {selectedTab}
            </Typography>
          </Toolbar>
        </AppBar>

        {renderTab()}
      </Box>
    </Box>
  );
}
