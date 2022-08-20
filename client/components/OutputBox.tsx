import React from "react";

const OutputBox = ({ output = "", isError = false }) => {
  return (
    <div
      style={{
        border: "1px solid grey",
        height: "40vh",
        width: "20vw",
        margin: "10px",
      }}
    >
      <h1>Output</h1>
      {isError && (
        <div
          style={{
            backgroundColor: "f29c9c",
            padding: "10px",
            fontSize: "30px",
            margin: "5px 20px",
          }}
        >
          Error!
        </div>
      )}
      <p style={{ whiteSpace: "pre-line" }}>{output}</p>
    </div>
  );
};

export default OutputBox;
