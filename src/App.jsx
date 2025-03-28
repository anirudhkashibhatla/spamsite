import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import MessageBoard from "./components/MessageBoard";
import DrawingCanvas from "./DrawingCanvas";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route with roomId */}
        <Route path="/:roomId" element={<MessageBoardWrapper />} />
        {/* Base URL route with default params */}
        <Route path="/" element={<MessageBoardWrapper />} />
        <Route path="/canvas" element={<DrawingCanvas />} />
      </Routes>
    </Router>
  );
};

// Wrapper to handle roomId and default params
const MessageBoardWrapper = () => {
  const { roomId } = useParams(); // Get roomId from the URL

  // Default room parameters
  const defaultRoomParams = {
    roomLife: 3600, // Default room life in seconds
    layout: "Default",
    upvote: "Disabled",
    rateLimit: 0, // No rate limit
    maxDuration: 0, // No duration limit
  };

  return (
    <MessageBoard
      roomId={roomId || null} // Pass roomId if available, otherwise null
      defaultRoomParams={defaultRoomParams} // Pass default params
    />
  );
};

export default App;
