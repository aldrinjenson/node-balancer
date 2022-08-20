const express = require("express");
const axios = require("axios").default;

const app = express();
const PORT = process.env.PORT || 5000;

let slaves = [
  {
    url: "http://localhost:5501",
    isActive: false,
    index: 0,
  },
  {
    url: "http://localhost:5502",
    isActive: false,
    index: 1,
  },
];

app.get("/", (req, res) => {
  res.send("Load Balancer active");
});

const isSlaveAlive = (slave = {}, index) =>
  new Promise((resolve) => {
    const func = async () => {
      try {
        const { data } = await axios.get(slave.url + "/isalive");
        if (data.alive) return index;
        else throw Error("invalid status");
      } catch (error) {
        return -1;
      }
    };
    resolve(func());
  });

app.get("/slavestatus", async (req, res) => {
  const aliveSlaves = [];
  const promises = [];
  for (const [index, sl] of slaves.entries()) {
    promises.push(isSlaveAlive(sl, index));
  }
  let data = await Promise.all(promises);
  const aliveIndices = data.filter((i) => i != -1);

  const newSlaves = slaves.filter((s) => aliveIndices.includes(s.index));
  slaves = newSlaves;
  res.send(newSlaves);
});

let slaveToUseCounter = 0;
const incrementSlaveToUseCounter = () =>
  (slaveToUseCounter = (slaveToUseCounter + 1) % slaves.length);

app.get("/code", async (req, res) => {
  let output = "";
  let allowLoopToRun = true;

  setTimeout(() => {
    // to prevent the loop from checking infinitely in case all servers are busy
    allowLoopToRun = false;
  }, 2000);

  let slaveToUse = slaves[slaveToUseCounter];
  // find free slave
  while (allowLoopToRun) {
    if (slaveToUse.isActive) {
      incrementSlaveToUseCounter();
      slaveToUse = slaves[slaveToUseCounter];
      continue;
    }
    break;
  }

  try {
    // assign work
    const slaveUrl = slaveToUse.url;
    slaves[slaveToUseCounter].isActive = true;
    const { code, lang } = req.query;
    console.log("sending request to slave: " + slaveToUseCounter);
    incrementSlaveToUseCounter();
    const { data: output } = await axios.get(slaveUrl + "/work", {
      params: { code, lang },
    });
    // get result
    slaves[slaveToUse.index].isActive = false;

    res.send(output);
  } catch (error) {
    console.log("error received from slave" + error);
    output = "Error" + error;
    slaves[slaveToUse.index].isActive = false;
    res.send(output);
  }
});

app.listen(PORT, () =>
  console.log("Master load balancer server listening on port " + PORT)
);
