import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatRoom = ({ conversation }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // ✅ Load all messages for this conversation
  useEffect(() => {
    if (!conversation?.id) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversation.id),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      },
      (error) => {
        console.error("Error loading messages:", error);
      }
    );

    return () => unsubscribe();
  }, [conversation?.id]);

  // ✅ Automatically create conversation if it doesn't exist
  const ensureConversationExists = async () => {
    if (!conversation?.id || !user) return;
    
    const convoRef = doc(db, "conversations", conversation.id);
    const convoSnap = await getDoc(convoRef);

    if (!convoSnap.exists()) {
      // You can customize participant info here
      await setDoc(convoRef, {
        participants: [user.uid],
        participantNames: [user.displayName || "User"],
        lastMessage: {
          text: "Conversation started",
          timestamp: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
      });
    }
  };

  // ✅ Send a message and update conversation
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation?.id || !user) return;

    await ensureConversationExists();

    const msgRef = await addDoc(collection(db, "messages"), {
      conversationId: conversation.id,
      senderId: user.uid,
      text,
      timestamp: serverTimestamp(),
    });

    // Update last message in conversation
    const convoRef = doc(db, "conversations", conversation.id);
    await updateDoc(convoRef, {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
      },
    });

    setText("");
  };

  if (!conversation) {
    return (
      <Paper
        sx={{
          height: "80vh",
          borderRadius: 3,
          p: 3,
          textAlign: "center",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#87ab69" }}>
          Select a conversation to start chatting
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        height: "80vh",
        borderRadius: 3,
        p: 2,
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ color: "#5f7d45", mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}
      >
        Chat
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          p: 1,
        }}
      >
        <List>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === user?.uid ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor:
                      msg.senderId === user?.uid ? "#87ab69" : "#f0f0f0",
                    color: msg.senderId === user?.uid ? "#fff" : "#000",
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Box>
              </ListItem>
            ))
          ) : (
            <Typography
              sx={{ textAlign: "center", mt: 3, color: "#888" }}
            >
              No messages yet. Start the conversation!
            </Typography>
          )}
        </List>
      </Box>

      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{ display: "flex", gap: 1, mt: "auto" }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            bgcolor: "#f7f5ecff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "#87ab69",
            "&:hover": { bgcolor: "#76965d" },
            borderRadius: 2,
            minWidth: "auto",
            px: 2,
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatRoom;
