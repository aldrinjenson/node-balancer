const express = require("express");
const axios = require("axios").default;

const app = express();
const PORT = process.env.PORT || 5000;

const allSlaves = [
  {
    url: "http://localhost:5501",
    isActive: false,
  },
  {
    url: "http://localhost:5502",
    isActive: false,
  },
  {
    url: "http://localhost:5503",
    isActive: false,
  },
  {
    url: "http://localhost:5504",
    isActive: false,
  },
  {
    url: "http://localhost:5505",
    isActive: false,
  },
];
let slaves = allSlaves;

app.get("/", (_, res) => {
  res.send("Load Balancer active");
});

const isSlaveAlive = (slave = {}, index) =>
  new Promise((resolve) => {
    const func = async () => {
      try {
        const data = await axios.get(slave.url + "/isalive");

        if (data?.data?.alive) return index;
        else return -1;
      } catch (error) {
        return -1;
      }
    };
    resolve(func());
  });

const filterSlaves = async () => {
  const promises = [];
  for (const [index, sl] of allSlaves.entries()) {
    promises.push(isSlaveAlive(sl, index));
  }
  const data = await Promise.all(promises);
  const aliveIndices = data.filter((i) => i != -1);
  const newSlaves = allSlaves.filter((s, index) =>
    aliveIndices.includes(index)
  );
  return newSlaves;
};

const ping = async () => {
  // ping and filter out dead slave nodes
  const newSlaves = await filterSlaves();
  console.log(newSlaves.length + " nodes alive");

  slaves = newSlaves;
};
ping();
setInterval(() => {
  // ping every 10 seconds to see if all nodes are alive
  ping();
}, 10000);

app.get("/slavestatus", async (req, res) => {
  const newSlaves = await filterSlaves();
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
    // to prevent the loop from checking infinitely in case all servers are active/busy
    allowLoopToRun = false;
  }, 2000);

  let slaveToUse = slaves[slaveToUseCounter];
  // find free slave
  while (allowLoopToRun) {
    if (slaveToUse.isActive) {
      // find new slave if the current slave is active/busy
      incrementSlaveToUseCounter();
      slaveToUse = slaves[slaveToUseCounter];
      continue;
    }
    break;
  }

  // a slave has been found
  const currentSlaveIndex = slaveToUseCounter;
  try {
    // assign work
    const slaveUrl = slaveToUse.url;
    slaves[currentSlaveIndex].isActive = true;
    const { code, lang } = req.query;
    console.log("sending request to slave: " + currentSlaveIndex);
    incrementSlaveToUseCounter();
    const { data: output } = await axios.get(slaveUrl + "/work", {
      params: { code, lang },
    });
    // get result and mark the slave as free
    slaves[currentSlaveIndex].isActive = false;
    console.log({ output });
    res.send(output);
  } catch (error) {
    console.log("error received from slave" + error);
    output = "Error" + error;
    slaves[currentSlaveIndex].isActive = false;
    res.send(output);
  }
});

app.listen(PORT, () =>
  console.log("Master load balancer server listening on port " + PORT)
);
