import React, { useState } from "react";

const Codebox = ({ handleSubmit }) => {
  const [codeVal, setCodeVal] = useState("");
  const [chosenLang, setChosenLang] = useState("bash");
  return (
    <div
      style={{
        border: "1px solid grey",
        height: "40vh",
        width: "20vw",
        margin: "10px",
        display: "flex",
        flexDirection: "column",
        padding: 10,

        fontSize: "5px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Code</h1>
        <label>Choose language:</label>
        <select
          value={chosenLang}
          onChange={(e) => setChosenLang(e.target.value)}
        >
          <option value='bash'>Bash</option>
          <option value='js'>Javascript</option>
        </select>
      </div>
      <textarea
        value={codeVal}
        onChange={(e) => setCodeVal(e.target.value)}
        style={{ fontSize: "25px" }}
        cols={30}
        rows={8}
      />
      <button
        onClick={() => handleSubmit(codeVal, chosenLang)}
        style={{ margin: "15px 5px", padding: "10px", borderRadius: "35px" }}
      >
        Send Code
      </button>
    </div>
  );
};

export default Codebox;
