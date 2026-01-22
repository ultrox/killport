const { execSync } = require("child_process");

const platform = process.platform;

// Easy to customize - just edit these arrays!
const messages = {
  killed: [
    "BOOM! Headshot - {name} ({pid}) eliminated 🎯",
    "Hasta la vista, baby - {name} ({pid}) terminated 🤖",
    "{name} ({pid}) sent to the shadow realm 💀",
    "Bonk! {name} ({pid}) has left the chat 👋",
    "{name} ({pid}) got yeeted into oblivion 🚀",
  ],
  notFound: [
    "Ghost town... nobody on port {port} 👻",
    "Port {port} is clean, nothing to kill 🦗",
    "Swinging at air - port {port} is empty 🌬️",
  ],
  failed: [
    "Oof! {name} ({pid}) dodged it 😬",
    "{name} ({pid}) said 'not today' 🛡️",
    "Couldn't take down {name} ({pid}) 💪",
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (msg, vars) => msg.replace(/{(\w+)}/g, (_, k) => vars[k] ?? k);

function getNetstatCommand() {
  switch (platform) {
    case "win32":
      return { cmd: "netstat -ano", pidIndex: -1, localAddressIndex: 1 };
    case "darwin":
      return { cmd: "netstat -anv", pidIndex: 10, localAddressIndex: 3 };
    default: // linux
      return { cmd: "netstat -tlnp", pidIndex: -1, localAddressIndex: 3 };
  }
}

function findProcessOnPort(port) {
  try {
    const { cmd, pidIndex, localAddressIndex } = getNetstatCommand();
    const result = execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    const lines = result.trim().split("\n").filter(Boolean);
    const pids = new Set();

    for (const line of lines) {
      if (!line.includes("LISTEN")) continue;
      const parts = line.trim().split(/\s+/);
      const localAddress = parts[localAddressIndex] || "";

      if (!localAddress.endsWith(`:${port}`) && !localAddress.endsWith(`.${port}`)) continue;

      let pid;
      if (platform === "linux") {
        // Linux format: "pid/program" in last column
        const pidProgram = parts[parts.length - 1];
        pid = pidProgram.split("/")[0];
      } else {
        pid = parts.at(pidIndex);
      }

      if (pid && pid !== "0" && pid !== "-") pids.add(pid);
    }

    return [...pids];
  } catch {
    return [];
  }
}

function killProcess(pid, force) {
  const signal = force ? "SIGKILL" : "SIGTERM";
  process.kill(Number(pid), signal);
}

function getProcessName(pid) {
  try {
    if (platform === "win32") {
      const result = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const match = result.match(/"([^"]+)"/);
      return match ? match[1].replace(/\.exe$/i, "") : null;
    } else {
      const result = execSync(`ps -p ${pid} -o comm=`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const name = result.trim().split("/").pop();
      return name || null;
    }
  } catch {
    return null;
  }
}

function killPort(port, { force = false } = {}) {
  const pids = findProcessOnPort(port);

  if (pids.length === 0) {
    console.log(fmt(pick(messages.notFound), { port }));
    return false;
  }

  for (const pid of pids) {
    const name = getProcessName(pid) || "unknown";
    try {
      killProcess(pid, force);
      console.log(fmt(pick(messages.killed), { name, pid, port }));
    } catch (err) {
      console.log(fmt(pick(messages.failed), { name, pid, port }));
    }
  }

  return true;
}

function peekPorts() {
  try {
    const { cmd, pidIndex, localAddressIndex } = getNetstatCommand();
    const result = execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    const lines = result.trim().split("\n").filter(Boolean);
    const ports = [];

    for (const line of lines) {
      if (!line.includes("LISTEN")) continue;
      const parts = line.trim().split(/\s+/);
      const localAddress = parts[localAddressIndex] || "";
      const portMatch = localAddress.match(/[.:](\d+)$/);

      if (!portMatch) continue;

      let pid;
      if (platform === "linux") {
        const pidProgram = parts[parts.length - 1];
        pid = pidProgram.split("/")[0];
      } else {
        pid = parts.at(pidIndex);
      }

      if (pid && pid !== "0" && pid !== "-") {
        ports.push({
          pid,
          port: portMatch[1],
          command: getProcessName(pid),
        });
      }
    }

    return ports;
  } catch {
    return [];
  }
}

module.exports = { killPort, findProcessOnPort, peekPorts };
