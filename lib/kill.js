const { execSync } = require("child_process");

function findProcessOnPort(port) {
  try {
    const result = execSync(`lsof -i :${port} -t`, { encoding: "utf-8" });
    const pids = result.trim().split("\n").filter(Boolean);
    return pids;
  } catch {
    return [];
  }
}

function killPort(port, { force = false } = {}) {
  const pids = findProcessOnPort(port);

  if (pids.length === 0) {
    console.log(`Nothing running on port ${port}`);
    return false;
  }

  const signal = force ? "-9" : "-15";

  for (const pid of pids) {
    try {
      execSync(`kill ${signal} ${pid}`);
      console.log(`Killed process ${pid} on port ${port}`);
    } catch (err) {
      console.error(`Failed to kill process ${pid}: ${err.message}`);
    }
  }

  return true;
}

module.exports = { killPort, findProcessOnPort };
