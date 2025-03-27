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
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);

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

      if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
        alert("Unsupported file type. Please upload an image or video.");
        event.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileType = file.type.startsWith("image") ? "image" : "video";
        setMedia({
          url: e.target.result,
          type: fileType,
        });
        setPreview(e.target.result);
        setPreviewType(fileType);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };

  const handlePostMessage = () => {
    postMessage();
    setPreview(null);
    setPreviewType(null);
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
      <Button variant="contained" onClick={() => console.log("Filtering messages")}>
        Filter
      </Button>
      <TextField
        label="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        size="small"
        multiline
        minRows={1}
        maxRows={4}
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
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        <IconButton color="primary" onClick={() => fileInputRef.current.click()}>
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
