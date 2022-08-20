import Codebox from "./Codebox";
import OutputBox from "./OutputBox";
import axios from "axios";
import { useState } from "react";

const masterBaseUrl = "http://localhost:5000";

const Workspace = () => {
  const [outputString, setOutputString] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (code = "", lang = "") => {
    console.log(code, lang);
    const {
      data: { output, err },
    } = await axios.get(masterBaseUrl + "/code", {
      params: { code, lang },
    });
    console.log({ output, err });
    setIsError(err);
    if (err) {
      setOutputString(err);
    } else {
      setOutputString(output);
    }
  };
  return (
    <div style={{}}>
      <div
        style={{
          justifyContent: "space-between",
          textAlign: "center",
          margin: "20px",
          display: "flex",
          padding: "10px",
          border: "1px solid black",
        }}
      >
        <Codebox handleSubmit={handleSubmit} />
        <OutputBox output={outputString} isError={isError} />
      </div>
    </div>
  );
};

export default Workspace;
