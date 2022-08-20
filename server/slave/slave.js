const express = require("express");
const axios = require("axios").default;
var util = require("util");

const exec = util.promisify(require("child_process").exec);

const app = express();
const PORT = process.env.PORT || 5500;

const runBashScript = async (code = "") => {
  try {
    const { stdout: output, stderr: err } = await exec(code);
    console.log(output);
    return { output, err };
  } catch (err) {
    console.log(err);
    console.log(err.message);
    return { output: "", err: err.stderr };
  }
};

const runJavascript = (code = "") => {
  try {
    const output = eval(code);
    console.log(typeof output);
    console.log(JSON.stringify(output));

    console.log({ output });

    return { output, err: "" };
  } catch (err) {
    console.log(err.message);
    return { output: "", err: err.message };
  }
};

app.get("/", (req, res) => {
  res.send("Slave server active");
});

app.get("/work", async (req, res) => {
  const { code, lang } = req.query;
  console.log({ code, lang });
  if (!code.length) {
    console.log("Empty code");
    return { output: "", err: "" };
  }
  switch (lang) {
    case "bash":
      data = await runBashScript(code);
    case "js":
      data = await runJavascript(code);
    default:
      break;
  }
  res.send(data);
});

app.listen(PORT, () => console.log("Slave server listening on port " + PORT));
