import React, { useState } from "react";
import { Button } from "@mui/material";
import CreateRoomDialog from "./CreateRoomDialog";

const CreateRoomButton = ({ onRoomCreate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateRoom = (params) => {
    onRoomCreate(params); // Pass room parameters to the parent component
    setIsDialogOpen(false); // Close the dialog after creating the room
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpenDialog}>
        Create Room
      </Button>
      <CreateRoomDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onCreate={handleCreateRoom}
      />
    </>
  );
};

export default CreateRoomButton;
