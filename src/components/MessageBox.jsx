import React, { useRef, useState } from "react";

const MessageBox = ({ msg, bringToFront, deleteMessage, setFilter }) => {
  const boxRef = useRef(null); // Reference to the message box
  const offset = useRef({ x: 0, y: 0 }); // Stores mouse offset position
  const [position, setPosition] = useState({ left: msg.left, top: msg.top }); // Track position
  const [isDragging, setIsDragging] = useState(false); // Track dragging state

  const handleMouseDown = (e) => {
    // Allow dragging only if the target is NOT the message content
    if (
      e.target.classList.contains("message-content") ||
      e.target.tagName === "A"
    ) {
      return; // Prevent dragging when interacting with text or links
    }

    setIsDragging(true);
    bringToFront(msg.uniqueIndex); // Bring the MessageBox to the front on mouse down

    const box = boxRef.current;
    offset.current.x = e.clientX - box.getBoundingClientRect().left;
    offset.current.y = e.clientY - box.getBoundingClientRect().top;

    const handleMouseMove = (moveEvent) => {
      const newLeft = moveEvent.clientX - offset.current.x;
      const newTop = moveEvent.clientY - offset.current.y;

      // Directly update the style for smoother dragging
      box.style.left = `${newLeft}px`;
      box.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false); // Stop dragging
      const box = boxRef.current;
      setPosition({
        left: parseInt(box.style.left, 10),
        top: parseInt(box.style.top, 10),
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={boxRef}
      className="message-box"
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: msg.zIndex, // Use the zIndex from the parent
        overflowWrap: "break-word",
        display: "flex",
        flexDirection: "column",
        cursor: isDragging ? "grabbing" : "grab", // Change cursor based on dragging state
        minWidth: "150px",
        minHeight: "100px",
      }}
      onMouseDown={handleMouseDown} // Start dragging and bring to front on mouse down
      onClick={() => bringToFront(msg.uniqueIndex)} // Bring to front on single click
      onDoubleClick={() => deleteMessage(msg.uniqueIndex)} // Delete message on double click
    >
      {/* Message Header */}
      <div
        className="message-header"
        style={{
          display: "flex", // Use flexbox for alignment
          justifyContent: "space-between", // Space between the left and right sections
          alignItems: "center", // Vertically center the content
          fontWeight: "bold",
          padding: "5px",
          backgroundColor: "gray", // Gunmetal gray
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          minWidth: "200px", // Set a minimum width for the header
        }}
      >
        {/* Left Section: Collapsed ID */}
        <div
          className="message-header-left"
          style={{
            flex: "1", // Allow the left section to take up available space
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setFilter(msg.id); // Directly set the filter state
              console.log("Filtering messages by ID:", msg.id);
            }}
            style={{
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {msg.id.substring(0, 4)}...{" "}
            {/* Display only the first 4 characters */}
          </a>
        </div>

        {/* Right Section: Normal */}
        <div
          className="message-header-right"
          style={{
            marginLeft: "10px",
            color: "white",
            fontFamily: "'Inter', sans-serif", // Use Inter font

            fontSize: "0.5em",
          }}
        >
          {/* Add any additional content for the right section here */}
          USER
        </div>
      </div>

      {/* Message Content */}
      <div
        className="message-content"
        style={{
          padding: "10px",
          color: "black",
          fontFamily: "Consolas, 'Courier New', monospace", // Editor-like font
          fontSize: "1em", // Default font size
          lineHeight: "1.5", // Improve readability
          userSelect: "text", // Allow text selection
          cursor: "text", // Change cursor to text selection
        }}
      >
        {msg.text.split(/(#[^\s]+)/g).map((part, i) =>
          part.startsWith("#") ? (
            <a
              key={i}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // window.filterMessages(part.substring(1));
                setFilter(part.substring(1)); // Directly set the filter state
                console.log("Filtering messages by ID:", msg.id);
              }}
              style={{ color: "blue", textDecoration: "underline" }}
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </div>

      {/* Media Handling */}
      {msg.media && msg.media.type === "image" && (
        <img
          src={msg.media.url}
          alt="Uploaded"
          className="message-media"
          style={{
            width: "auto", // Allow the image to grow dynamically
            height: "auto", // Maintain aspect ratio
            maxWidth: "500px", // Limit the image width to a reasonable size
            maxHeight: "400px", // Limit the height to a reasonable size
            objectFit: "contain", // Maintain aspect ratio
            borderRadius: "4px",
          }}
        />
      )}

      {msg.media && msg.media.type === "video" && (
        <video
          src={msg.media.url}
          controls
          className="message-media"
          style={{
            width: "auto", // Allow the video to grow dynamically
            height: "auto", // Maintain aspect ratio
            maxWidth: "450px", // Limit the video width to a reasonable size
            maxHeight: "300px", // Limit the height to a reasonable size
            objectFit: "contain", // Maintain aspect ratio
            borderRadius: "4px",
          }}
        />
      )}

      {/* Timestamp */}
      <div
        className="message-timestamp"
        style={{
          fontSize: "0.9em",
          color: "#2a3439", // Gunmetal gray
          padding: "5px",
          backgroundColor: "#eee",
          borderBottomLeftRadius: "4px",
          borderBottomRightRadius: "4px",
        }}
      >
        {msg.timestamp}
      </div>
    </div>
  );
};

export default MessageBox;
