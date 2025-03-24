import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageBox from "./MessageBox";
import MessageInput from "./MessageInput";
import CreateRoomDialog from "./CreateRoomDialog";
import { Box, Button } from "@mui/material";

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageId, setMessageId] = useState("");
  const [duration, setDuration] = useState("");
  const [filter, setFilter] = useState("");
  const [media, setMedia] = useState(null);
  const [roomParams, setRoomParams] = useState(null); // Store room parameters
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zIndexCounter, setZIndexCounter] = useState(10); // Track the highest zIndex

  const uniqueIndex = useRef(0); // Counter for unique indexes

  window.filterMessages = (id) => setFilter(id);

  const postMessage = () => {
    if (!messageText && !media) return;

    let maxWidth = window.innerWidth - 320;
    let maxHeight = window.innerHeight - 200;

    const newMessage = {
      uniqueIndex: uniqueIndex.current++, // Assign a unique index
      id: messageId.trim() || "anon",
      text: messageText,
      media,
      timestamp: new Date().toLocaleTimeString(),
      left: `${Math.random() * maxWidth}px`,
      top: `${Math.random() * maxHeight}px`,
      duration: Math.min(
        parseInt(duration, 10) || 0,
        roomParams?.maxDuration || 60
      ), // Enforce maxDuration
      zIndex: zIndexCounter, // Assign the current highest zIndex
    };

    setMessages((prev) => [...prev, newMessage]);
    setZIndexCounter((prev) => prev + 1); // Increment the zIndex counter
    setMessageText("");
    setMessageId("");
    setDuration("");
    setMedia(null);

    if (newMessage.duration > 0) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.filter((msg) => msg.uniqueIndex !== newMessage.uniqueIndex)
        );
      }, newMessage.duration * 1000);
    }
  };

  const deleteMessage = (uniqueIndex) => {
    setMessages((prev) =>
      prev.filter((msg) => msg.uniqueIndex !== uniqueIndex)
    );
  };

  const bringToFront = (uniqueIndex) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.uniqueIndex === uniqueIndex
          ? { ...msg, zIndex: zIndexCounter } // Update zIndex for the clicked message
          : msg
      )
    );
    setZIndexCounter((prev) => prev + 1); // Increment the zIndex counter
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateRoom = (params) => {
    setRoomParams(params); // Save room parameters
    console.log("Room Created with Params:", params);
  };

  return (
    <div
      className="message-board"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#121212",
        backgroundImage: "url('/image.jpg')",
        backgroundSize: "cover", // Ensures it fully covers the viewport
        backgroundPosition: "center center", // Centers the image
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Keeps it fixed when scrolling
        color: "white",
      }}
    >
      {messages
        .filter((msg) => !filter || msg.id === filter)
        .map((msg) => (
          <MessageBox
            key={msg.uniqueIndex} // Use the unique index as the key
            msg={msg}
            deleteMessage={deleteMessage}
            bringToFront={bringToFront} // Pass the bringToFront function
          />
        ))}
      <Box
        className="input-wrapper"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 20,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "0 10px",
        }}
      >
        <Button variant="contained" onClick={handleOpenDialog}>
          Create Room
        </Button>
        <MessageInput
          messageId={messageId}
          setMessageId={setMessageId}
          messageText={messageText}
          setMessageText={setMessageText}
          duration={duration}
          setDuration={setDuration}
          setMedia={setMedia}
          postMessage={postMessage}
          filter={filter}
          setFilter={setFilter}
        />
      </Box>
      <CreateRoomDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onCreate={handleCreateRoom}
      />
    </div>
  );
};

export default MessageBoard;
