const express = require("express");
var util = require("util");

const exec = util.promisify(require("child_process").exec);

const app = express();
const PORT = process.env.PORT || 5500;

const runBashScript = async (code = "") => {
  try {
    const { stdout: output, stderr: err } = await exec(code);
    console.log({ output, err });
    return { output, err };
  } catch (err) {
    console.log(err);
    console.log(err.message);
    return { output: "", err: err.stderr };
  }
};

const runJavascript = (code = "") => {
  try {
    // to return the output of console.log instead of just printing it in terminal
    const output = eval(`
    console.log = (val) => val
    ${code}
    `);
    console.log({ output });
    return { output, err: "" };
  } catch (err) {
    console.log(err.message);
    return { output: "", err: err.message };
  }
};
app.get("/isalive", (req, res) => {
  // console.log("Im alive");
  res.send({ alive: true });
});

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
      console.log({ data });
      break;

    case "js":
      data = await runJavascript(code);
    default:
      break;
  }
  res.send(data);
});

app.listen(PORT, () => console.log("Slave server listening on port " + PORT));
