import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchCalendarData = async () => {
      // 🟢 Fetch host’s custom unavailability
      const availQuery = query(collection(db, "availability"), where("hostId", "==", uid));
      const availSnap = await getDocs(availQuery);
      const availEvents = availSnap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        start: new Date(d.data().start.toDate()),
        end: new Date(d.data().end.toDate()),
        type: "custom",
      }));

      // 🟣 Fetch host’s booked listings (from "bookings" collection)
      const bookingQuery = query(collection(db, "bookings"), where("hostId", "==", uid));
      const bookingSnap = await getDocs(bookingQuery);
      const bookingEvents = bookingSnap.docs.map((d) => ({
        id: d.id,
        title: `Booked: ${d.data().listingTitle || "Reservation"}`,
        start: new Date(d.data().checkIn.toDate()),
        end: new Date(d.data().checkOut.toDate()),
        type: "booking",
      }));

      setEvents([...availEvents, ...bookingEvents]);
    };

    fetchCalendarData();
  }, [uid]);

  const handleSelectSlot = async ({ start, end }) => {
    const title = prompt("Enter title (e.g. Maintenance, Blocked Dates):");
    if (!title) return;

    await addDoc(collection(db, "availability"), {
      hostId: uid,
      title,
      start,
      end,
    });

    setEvents((prev) => [...prev, { title, start, end, type: "custom" }]);
  };

  const handleSelectEvent = async (event) => {
    if (event.type === "booking") {
      alert("Booked dates cannot be removed.");
      return;
    }

    if (window.confirm(`Remove "${event.title}" from calendar?`)) {
      await deleteDoc(doc(db, "availability", event.id));
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2} color="#5f7d45">
        Availability Calendar
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary" mb={2}>
          Drag to select dates to block, or click an event to delete.
          <br />
          Booked dates appear automatically.
        </Typography>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 500 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.type === "booking" ? "#87ab69" : "#f9d342",
              color: event.type === "booking" ? "#fff" : "#000",
              borderRadius: "8px",
            },
          })}
        />
      </Paper>
    </Box>
  );
}
