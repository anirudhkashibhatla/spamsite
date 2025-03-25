import { useState } from "react";

function NumberInput({ maxDuration = 3600 }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="p-4">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={0}
        max={maxDuration}
        placeholder="Message Duration (s)"
        className="border rounded p-1 bg-white text-black text-sm w-[70px] md:w-[80px] text-center"
      />
    </div>
  );
}

export default NumberInput;
