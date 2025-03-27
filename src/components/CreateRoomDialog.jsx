import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  MenuItem,
} from "@mui/material";

const CreateRoomDialog = ({ open, onClose, onCreate }) => {
  const [activeTab, setActiveTab] = useState(0); // Tab state
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [roomLife, setRoomLife] = useState(60); // Default room life in seconds
  const [layout, setLayout] = useState("Default");
  const [upvote, setUpvote] = useState("Disabled");
  const [rateLimit, setRateLimit] = useState(0);
  const [maxDuration, setMaxDuration] = useState(60);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreate = async () => {
    console.log("handleCreate called");
    const roomParams = {
      roomId: roomId.trim(),
      password: password.trim(),
      roomLife: parseInt(roomLife, 10), 
      layout,
      upvote,
      rateLimit: parseInt(rateLimit, 10),
      maxDuration: parseInt(maxDuration, 10), // Pass maximum duration
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomParams.roomId}`
      );
      console.log("handleCreate called");

      if (response.ok) {
        alert("Room ID already exists. Please choose a different Room ID.");
        return;
      }
      console.log("handleCreate called");

      const createResponse = await fetch(
        "http://localhost:5000/api/rooms/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomParams),
        }
      );
      console.log("handleCreate called");

      if (createResponse.ok) {
        const data = await createResponse.json();
        console.log("Room created successfully:", data);
        onCreate(roomParams); // Pass parameters to MessageBoard
        onClose(); 
      } else {
        const errorData = await createResponse.json();
        alert(`Failed to create room: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the room. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Room</DialogTitle>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Basic" />
        <Tab label="Customize" />
      </Tabs>
      <DialogContent>
        {activeTab === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Room Life (seconds)"
              type="number"
              value={roomLife}
              onChange={(e) => setRoomLife(e.target.value)}
              fullWidth
            />
          </Box>
        )}
        {activeTab === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Layout"
              select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              fullWidth
            >
              <MenuItem value="Default">Default</MenuItem>
              <MenuItem value="Compact">Compact</MenuItem>
              <MenuItem value="Grid">Grid</MenuItem>
            </TextField>
            <TextField
              label="Upvote"
              select
              value={upvote}
              onChange={(e) => setUpvote(e.target.value)}
              fullWidth
            >
              <MenuItem value="Disabled">Disabled</MenuItem>
              <MenuItem value="Enabled">Enabled</MenuItem>
            </TextField>
            <TextField
              label="Message Rate Limit (per second)"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              fullWidth
            />
            <TextField
              label="Maximum Message Duration (seconds)"
              type="number"
              value={maxDuration}
              onChange={(e) => setMaxDuration(e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoomDialog;
