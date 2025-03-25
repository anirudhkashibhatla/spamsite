import React, { useRef, useState } from "react";
import { TextField, Button, IconButton, Box, Input } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const MessageInput = ({
  messageId,
  setMessageId,
  messageText,
  setMessageText,
  duration,
  setDuration,
  setMedia,
  postMessage,
  filter,
  setFilter,
  maxDuration, // Add maxDuration as a prop
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null); // State to store the preview URL
  const [previewType, setPreviewType] = useState(null); // State to store the type (image/video)

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

      // Check if the file type is valid
      if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
        alert("Unsupported file type. Please upload an image or video.");
        event.target.value = null; // Reset the file input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileType = file.type.startsWith("image") ? "image" : "video";
        setMedia({
          url: e.target.result,
          type: fileType,
        });
        setPreview(e.target.result); // Set the preview URL
        setPreviewType(fileType); // Set the preview type
      };
      reader.readAsDataURL(file);
    }
    // Reset the file input value to allow consecutive uploads of the same file
    event.target.value = null;
  };

  const handlePostMessage = () => {
    postMessage(); // Call the parent `postMessage` function
    setPreview(null); // Clear the preview
    setPreviewType(null); // Clear the preview type
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "center",
        padding: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: 1,
        width: "100%",
      }}
    >
      <TextField
        label="Filter by ID/IP"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        size="small"
        fullWidth
        sx={{ flex: "1 1 180px" }}
      />
      <Button
        variant="contained"
        onClick={() => console.log("Filtering messages")}
      >
        Filter
      </Button>
      <TextField
        label="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        size="small"
        multiline
        minRows={1} // Starts with 3 rows
        maxRows={4} // Expands up to 10 rows, then scrolls
        fullWidth
        sx={{ flex: "1 1 300px" }}
      />
      <TextField
        label="Enter ID (optional)"
        value={messageId}
        onChange={(e) => setMessageId(e.target.value)}
        size="small"
        fullWidth
        sx={{ flex: "1 1 200px" }}
      />
      <TextField
        label="Message Duration (s)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        size="small"
        fullWidth
        sx={{ flex: "1 1 50px" }}
        slotProps={{
          input: {
            min: 0, // Minimum value is 0
            max: maxDuration || 3600, // Maximum value is maxDuration if provided
          },
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Small Preview Icon */}
        {preview && (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid #ccc",
            }}
          >
            {previewType === "image" ? (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <video
                src={preview}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                muted
              />
            )}
          </Box>
        )}
        <Input
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          inputRef={fileInputRef}
          onChange={handleFileChange}
        />
        <IconButton
          color="primary"
          onClick={() => fileInputRef.current.click()}
        >
          <PhotoCamera />
        </IconButton>
      </Box>
      <Button variant="contained" onClick={handlePostMessage}>
        Post
      </Button>
    </Box>
  );
};

export default MessageInput;
