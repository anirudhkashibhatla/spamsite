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
        <Route path="/:roomId" element={<MessageBoardWrapper />} />
        {/* Base URL route with default params */}
        <Route path="/" element={<MessageBoardWrapper />} />
        <Route path="/canvas" element={<DrawingCanvas />} />
      </Routes>
    </Router>
  );
};

const MessageBoardWrapper = () => {
  const { roomId } = useParams();
  const defaultRoomParams = {
    roomLife: 3600,
    layout: "Default",
    upvote: "Disabled",
    rateLimit: 0,
    maxDuration: 0,
  };

  return (
    <MessageBoard
      roomId={roomId || null}
      defaultRoomParams={defaultRoomParams}
    />
  );
};

export default App;
