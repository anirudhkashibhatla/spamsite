import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import PasswordDialog from "./PasswordDialog";
import MessageBox from "./MessageBox";
import MessageInput from "./MessageInput";
import CreateRoomButton from "./CreateRoomButton";
import { Box } from "@mui/material";
import "./MessageBoard.css";
import Cookies from "js-cookie"; // Import js-cookie

const MessageBoard = ({ roomId, defaultRoomParams }) => {
  const [roomParams, setRoomParams] = useState(defaultRoomParams); // Initialize with default params
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false); // Control password dialog visibility
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [roomNotFound, setRoomNotFound] = useState(false); // Track if the room doesn't exist
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageId, setMessageId] = useState("");
  const [duration, setDuration] = useState("");
  const [filter, setFilter] = useState("");
  const [media, setMedia] = useState(null);
  const [zIndexCounter, setZIndexCounter] = useState(10); // Track the highest zIndex
  const navigate = useNavigate(); // Initialize useNavigate

  const uniqueIndex = useRef(0); // Counter for unique indexes

  // Fetch room parameters if roomId is provided
  useEffect(() => {
    const fetchRoomParams = async () => {
      if (!roomId) {
        console.log("No roomId provided. Skipping fetchRoomParams.");
        setIsLoading(false); // Stop loading if no roomId is provided
        return;
      }

      console.log(`Fetching room parameters for roomId(frontend): ${roomId}`);
      try {
        const token = Cookies.get("access_token"); // Retrieve the token from cookies
        console.log("Access token from cookies:", token);
        const response = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined, // Include the token if it exists
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`Room parameters fetched for roomId ${roomId}:`, data);

          if (data.requiresPassword && !token) {
            console.log(`Room ${roomId} requires a password.`);
            setIsPasswordDialogOpen(true);
          } else {
            setRoomParams(data);
            setIsAuthenticated(true); // Mark the user as authenticated
          }
        } else if (response.status === 404) {
          console.error(`Room with roomId ${roomId} does not exist.`);
          setRoomNotFound(true); // Mark the room as not found
        } else {
          console.error(
            `Failed to fetch room parameters for roomId ${roomId}. Status: ${response.status}`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching room parameters for roomId ${roomId}:`,
          error
        );
      } finally {
        setIsLoading(false); // Stop loading after fetching room parameters
      }
    };

    fetchRoomParams();
  }, [roomId]);

  // Handle password authentication
  const handleAuthenticate = async (enteredPassword) => {
    console.log(`Authenticating password for roomId: ${roomId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}/authenticate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: enteredPassword }),
        }
      );
      console.log(`Response from authenticate for roomId ${roomId}:`, response);

      if (!response.ok) {
        if (response.status === 404) {
          alert("Room not found. Please check the Room ID.");
        } else {
          alert("Authentication failed.");
        }
        return;
      }

      const data = await response.json();
      console.log(`Authentication result for roomId ${roomId}:`, data);

      if (data.success && data.token) {
        console.log(
          `Authentication successful for roomId ${roomId}. Storing token and fetching room data.`
        );

        // Store the token in cookies
        Cookies.set("access_token", data.token, { expires: 1 }); // Expires in 1 day

        setIsAuthenticated(true); // Mark the user as authenticated
        setIsPasswordDialogOpen(false); // Close the password dialog

        // Fetch the complete room data after successful authentication
        const roomResponse = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`, // Use the token in the Authorization header
            },
          }
        );
        console.log(
          `Response from fetchRoomParams after authentication for roomId ${roomId}:`,
          roomResponse
        );

        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          console.log(
            `Complete room data fetched for roomId ${roomId}:`,
            roomData
          );
          setRoomParams(roomData); // Set the complete room data
        } else {
          console.error(
            `Failed to fetch complete room data for roomId ${roomId}. Status: ${roomResponse.status}`
          );
        }
      } else {
        alert("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error(`Error during authentication for roomId ${roomId}:`, error);
    }
  };

  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false);
    navigate("/"); // Redirect to the base URL
  };

  const postMessage = () => {
    if (!messageText && !media) {
      console.warn("No message text or media provided. Aborting postMessage.");
      return; // Ensure there's content to post
    }

    let maxWidth = window.innerWidth - 320; // Prevent messages from going off-screen
    let maxHeight = window.innerHeight - 200;

    // Validate and calculate duration
    const parsedDuration = parseInt(duration, 10);
    console.log("Parsed Duration:", parsedDuration);

    const maxDuration = roomParams?.maxDuration;
    const validMaxDuration =
      !isNaN(maxDuration) && maxDuration > 0 ? maxDuration : 0; // Set to 0 if maxDuration is NaN or 0
    console.log("Valid Max Duration:", validMaxDuration);

    const finalDuration =
      validMaxDuration === 0
        ? 0 // If maxDuration is 0 or NaN, set duration to 0
        : !duration || isNaN(parsedDuration) || parsedDuration <= 0
        ? validMaxDuration // Use maxDuration if no valid duration is entered
        : Math.min(parsedDuration, validMaxDuration); // Use entered duration, but enforce maxDuration
    console.log("Final Duration:", finalDuration);

    const newMessage = {
      uniqueIndex: uniqueIndex.current++, // Assign a unique index
      id: messageId.trim() || "anon", // Default to "anon" if no ID is provided
      text: messageText,
      media,
      timestamp: new Date().toLocaleTimeString(),
      left: `${Math.random() * maxWidth}px`,
      top: `${Math.random() * maxHeight}px`,
      duration: finalDuration, // Enforce maxDuration or set to 0
      zIndex: zIndexCounter, // Assign the current highest zIndex
    };

    setMessages((prev) => [...prev, newMessage]); // Add the new message to the list
    setZIndexCounter((prev) => prev + 1); // Increment the zIndex counter
    setMessageText(""); // Clear the input fields
    setMessageId("");
    setDuration("");
    setMedia(null);

    // Automatically remove the message after its duration
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

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        Loading room parameters...
      </div>
    ); // Center the loading message in the middle of the viewport
  }

  if (roomNotFound) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          color: "red", // Optional: Add styling to differentiate the error
        }}
      >
        Room does not exist.
      </div>
    ); // Center the error message in the middle of the viewport
  }

  // Show the password dialog if the user is not authenticated
  if (isPasswordDialogOpen && !isAuthenticated) {
    return (
      <PasswordDialog
        open={isPasswordDialogOpen}
        onClose={handleClosePasswordDialog} // Redirect on close
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <div className="message-board">
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
      <Box className="input-wrapper">
        <CreateRoomButton
          onRoomCreate={(params) => {
            console.log("Room Created with Params:", params); // Log params directly
          }}
        />
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
    </div>
  );
};

export default MessageBoard;
