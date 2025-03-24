import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [thickness, setThickness] = useState(2);
  const [lineStyle, setLineStyle] = useState("solid");
  const [isErasing, setIsErasing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 80; // reserve space for toolbar
      const context = canvas.getContext("2d");
      setCtx(context);
    }
  }, []);

  // Update drawing settings on context change
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = isErasing ? "#ffffff" : color;
      ctx.lineWidth = thickness;
      switch (lineStyle) {
        case "dashed":
          ctx.setLineDash([10, 5]);
          break;
        case "dotted":
          ctx.setLineDash([2, 2]);
          break;
        default:
          ctx.setLineDash([]);
      }
    }
  }, [ctx, color, thickness, lineStyle, isErasing]);

  const startDrawing = (e) => {
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", display: "block" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#f5f5f5",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 50,
        }}
      >
        <TextField
          label="Color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          InputLabelProps={{ shrink: true }}
          disabled={isErasing}
        />
        <TextField
          label="Thickness"
          type="number"
          value={thickness}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setThickness(value >= 0 && value <= 50 ? value : thickness);
          }}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel id="line-style-label">Line Style</InputLabel>
          <Select
            labelId="line-style-label"
            value={lineStyle}
            onChange={(e) => setLineStyle(e.target.value)}
            label="Line Style"
            disabled={isErasing}
          >
            <MenuItem value="solid">Solid</MenuItem>
            <MenuItem value="dashed">Dashed</MenuItem>
            <MenuItem value="dotted">Dotted</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => setIsErasing(!isErasing)}>
          {isErasing ? "Switch to Draw" : "Eraser"}
        </Button>
      </Box>
    </div>
  );
};

export default DrawingCanvas;
