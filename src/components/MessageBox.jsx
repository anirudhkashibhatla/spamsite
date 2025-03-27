import React, { useRef, useState } from "react";

const MessageBox = ({ msg, bringToFront, deleteMessage }) => {
  const boxRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ left: msg.left, top: msg.top });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (
      e.target.classList.contains("message-content") ||
      e.target.tagName === "A"
    ) {
      return;
    }

    setIsDragging(true);
    bringToFront(msg.uniqueIndex);

    const box = boxRef.current;
    offset.current.x = e.clientX - box.getBoundingClientRect().left;
    offset.current.y = e.clientY - box.getBoundingClientRect().top;

    const handleMouseMove = (moveEvent) => {
      const newLeft = moveEvent.clientX - offset.current.x;
      const newTop = moveEvent.clientY - offset.current.y;
      box.style.left = `${newLeft}px`;
      box.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
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
        zIndex: msg.zIndex,
        overflowWrap: "break-word",
        display: "flex",
        flexDirection: "column",
        cursor: isDragging ? "grabbing" : "grab",
        minWidth: "150px",
        minHeight: "100px",
      }}
      onMouseDown={handleMouseDown}
      onClick={() => bringToFront(msg.uniqueIndex)}
      onDoubleClick={() => deleteMessage(msg.uniqueIndex)}
    >
      <div
        className="message-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          padding: "5px",
          backgroundColor: "gray",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          minWidth: "200px",
        }}
      >
        <div
          className="message-header-left"
          style={{
            flex: "1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.filterMessages(msg.id);
            }}
            style={{
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {msg.id.substring(0, 4)}... 
          </a>
        </div>

        <div
          className="message-header-right"
          style={{
            marginLeft: "10px",
            color: "white",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.5em",
          }}
        >
          USER
        </div>
      </div>

      <div
        className="message-content"
        style={{
          padding: "10px",
          color: "black",
          fontFamily: "Consolas, 'Courier New', monospace", 
          fontSize: "1em", 
          lineHeight: "1.5", 
          userSelect: "text", 
          cursor: "text", 
        }}
      >
        {msg.text.split(/(#[^\s]+)/g).map((part, i) =>
          part.startsWith("#") ? (
            <a
              key={i}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.filterMessages(part.substring(1));
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

      {msg.media && msg.media.type === "image" && (
        <img
          src={msg.media.url}
          alt="Uploaded"
          className="message-media"
          style={{
            width: "auto", 
            height: "auto", 
            maxWidth: "500px",
            maxHeight: "400px",
            objectFit: "contain",
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
            width: "auto",
            height: "auto",
            maxWidth: "450px",
            maxHeight: "300px",
            objectFit: "contain",
            borderRadius: "4px",
          }}
        />
      )}

      <div
        className="message-timestamp"
        style={{
          fontSize: "0.9em",
          color: "#2a3439",
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
