import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import ChatRoom from "./ChatRoom";

const MessagesList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
      {/* Left panel: conversation list */}
      <Paper
        sx={{
          width: "35%",
          height: "80vh",
          overflowY: "auto",
          borderRadius: 3,
          p: 2,
          bgcolor: "#f7f5ecff",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: "#5f7d45", mb: 2 }}
        >
          Conversations
        </Typography>

        <List>
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={selectedConversation?.id === conv.id}
                onClick={() => setSelectedConversation(conv)}
              >
                <ListItemText
                  primary={
                    conv.participantEmails?.find((e) => e !== user?.email) ||
                    "Unknown User"
                  }
                  secondary={
                    conv.lastMessage?.text || "No messages yet"
                  }
                />
              </ListItemButton>
            ))
          ) : (
            <Typography sx={{ textAlign: "center", mt: 3, color: "#888" }}>
              No conversations yet.
            </Typography>
          )}
        </List>
      </Paper>

      {/* Right panel: chat area */}
      <Box sx={{ flexGrow: 1 }}>
        {selectedConversation ? (
          <ChatRoom conversation={selectedConversation} />
        ) : (
          <Paper
            sx={{
              height: "80vh",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              bgcolor: "#fff",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#87ab69", mt: 25 }}
            >
              Select a conversation to start chatting 💬
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default MessagesList;
