import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const PasswordDialog = ({ open, onClose, onAuthenticate }) => {
  const [password, setPassword] = useState("");

  const handleAuthenticate = () => {
    onAuthenticate(password);
    setPassword("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter Room Password</DialogTitle>
      <DialogContent>
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleAuthenticate}
          color="primary"
          variant="contained"
          disabled={!password.trim()}
        >
          Authenticate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordDialog;
