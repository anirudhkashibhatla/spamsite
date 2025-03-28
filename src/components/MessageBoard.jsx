import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PasswordDialog from "./PasswordDialog";
import MessageBox from "./MessageBox";
import MessageInput from "./MessageInput";
import CreateRoomButton from "./CreateRoomButton";
import { Box } from "@mui/material";
import "./MessageBoard.css";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

const MessageBoard = ({ roomId, defaultRoomParams }) => {
  const [roomParams, setRoomParams] = useState(defaultRoomParams);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageId, setMessageId] = useState("");
  const [duration, setDuration] = useState("");
  const [filter, setFilter] = useState("");
  const [media, setMedia] = useState(null);
  const [zIndexCounter, setZIndexCounter] = useState(10);
  const navigate = useNavigate();

  const uniqueIndex = useRef(0);

  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const socket = useRef(null);

  const initializeWebRTC = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: roomId,
        });
      }
    };

    dataChannel.current = peerConnection.current.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    });

    dataChannel.current.onopen = () => {
      console.log("Data channel is open");
    };

    dataChannel.current.onclose = () => {
      console.log("Data channel closed");
      initializeWebRTC();
    };

    dataChannel.current.onmessage = (event) => {
      console.log("Received message:", event.data);
      const receivedMessage = JSON.parse(event.data);

      setMessages((prev) => [...prev, receivedMessage]);

      if (receivedMessage.shouldAutoDelete && receivedMessage.duration > 0) {
        setTimeout(() => {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.uniqueIndex !== receivedMessage.uniqueIndex
            )
          );
        }, receivedMessage.duration * 1000);
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.current.emit("webrtc-offer", {
      offer,
      roomId: roomId,
    });
  };

  useEffect(() => {
    socket.current = io("http://localhost:5001");

    socket.current.on("connect", () => {
      console.log("Connected to signaling server:", socket.current.id);
      socket.current.emit("join-room", roomId);
      initializeWebRTC();
    });

    socket.current.on("webrtc-offer", async (data) => {
      if (!peerConnection.current) {
        await initializeWebRTC();
      }

      await peerConnection.current.setRemoteDescription(data.offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.current.emit("webrtc-answer", {
        answer,
        roomId: data.roomId,
      });
    });

    socket.current.on("webrtc-answer", async (data) => {
      await peerConnection.current.setRemoteDescription(data.answer);
    });

    socket.current.on("ice-candidate", async (data) => {
      await peerConnection.current.addIceCandidate(data.candidate);
    });

    return () => {
      socket.current.disconnect();
      peerConnection.current?.close();
    };
  }, [roomId]);

  useEffect(() => {
    const fetchRoomParams = async () => {
      if (!roomId) {
        console.log("No roomId provided. Skipping fetchRoomParams.");
        setIsLoading(false);
        return;
      }

      console.log(`Fetching room parameters for roomId(frontend): ${roomId}`);
      try {
        const token = Cookies.get("access_token");
        console.log("Access token from cookies:", token);
        const response = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
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
            setIsAuthenticated(true);
          }
        } else if (response.status === 404) {
          console.error(`Room with roomId ${roomId} does not exist.`);
          setRoomNotFound(true);
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
        setIsLoading(false);
      }
    };

    fetchRoomParams();
  }, [roomId]);

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

        Cookies.set("access_token", data.token, { expires: 1 });

        setIsAuthenticated(true);
        setIsPasswordDialogOpen(false);

        const roomResponse = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
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
          setRoomParams(roomData);
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
    navigate("/");
  };

  const sendMessage = (message) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      console.log("Sending message via DataChannel:", message);

      const messageWithDeletionInfo = {
        ...message,
        shouldAutoDelete: message.duration > 0,
      };

      dataChannel.current.send(JSON.stringify(messageWithDeletionInfo));
    } else {
      console.error("DataChannel is not open. Cannot send message.");
    }
  };

  const postMessage = () => {
    if (!messageText && !media) {
      console.warn("No message text or media provided. Aborting postMessage.");
      return;
    }

    let maxWidth = window.innerWidth - 320;
    let maxHeight = window.innerHeight - 200;

    const parsedDuration = parseInt(duration, 10);
    console.log("Parsed Duration:", parsedDuration);

    const maxDuration = roomParams?.maxDuration;
    const validMaxDuration =
      !isNaN(maxDuration) && maxDuration > 0 ? maxDuration : 0;
    console.log("Valid Max Duration:", validMaxDuration);

    const finalDuration =
      validMaxDuration === 0
        ? 0
        : !duration || isNaN(parsedDuration) || parsedDuration <= 0
        ? validMaxDuration
        : Math.min(parsedDuration, validMaxDuration);
    console.log("Final Duration:", finalDuration);

    const newMessage = {
      uniqueIndex: uniqueIndex.current++,
      id: messageId.trim() || "anon",
      text: messageText,
      media,
      timestamp: new Date().toLocaleTimeString(),
      left: `${Math.random() * maxWidth}px`,
      top: `${Math.random() * maxHeight}px`,
      duration: finalDuration,
      zIndex: zIndexCounter,
    };

    setMessages((prev) => [...prev, newMessage]);
    setZIndexCounter((prev) => prev + 1);
    setMessageText("");
    setMessageId("");
    setDuration("");
    setMedia(null);

    sendMessage(newMessage);

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
          ? { ...msg, zIndex: zIndexCounter }
          : msg
      )
    );
    setZIndexCounter((prev) => prev + 1);
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
    );
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
          color: "red",
        }}
      >
        Room does not exist.
      </div>
    );
  }

  if (isPasswordDialogOpen && !isAuthenticated) {
    return (
      <PasswordDialog
        open={isPasswordDialogOpen}
        onClose={handleClosePasswordDialog}
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
            key={msg.uniqueIndex}
            msg={msg}
            bringToFront={(uniqueIndex) => {}}
            deleteMessage={(uniqueIndex) => {}}
            setFilter={setFilter}
          />
        ))}
      <Box className="input-wrapper">
        <CreateRoomButton
          onRoomCreate={(params) => {
            console.log("Room Created with Params:", params);
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
