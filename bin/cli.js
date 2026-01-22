#!/usr/bin/env node

const { killPort, peekPorts } = require("../lib/kill.js");

const args = process.argv.slice(2);
const port = args.find((arg) => !arg.startsWith("-"));
const force = args.includes("--force") || args.includes("-f");
const peek = args.includes("--peek") || args.includes("-p");

if (peek) {
  const ports = peekPorts();
  if (ports.length === 0) {
    console.log("No ports currently listening");
  } else {
    console.log("Listening ports:");
    const maxPort = Math.max(...ports.map((p) => p.port.length));
    for (const p of ports) {
      const name = p.command || "unknown";
      console.log(`  ${p.port.padStart(maxPort)} - ${name} (pid ${p.pid})`);
    }
  }
  process.exit(0);
}

if (!port) {
  console.log("Usage: killport <port> [--force] [--peek]");
  process.exit(1);
}

const portNum = parseInt(port, 10);
if (isNaN(portNum)) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

const killed = killPort(portNum, { force });
if (!killed) {
  console.log("Hint: use --peek or -p to see all listening ports");
}
