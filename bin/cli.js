#!/usr/bin/env node

const { killPort } = require("../lib/kill.js");

const args = process.argv.slice(2);
const port = args.find((arg) => !arg.startsWith("-"));
const force = args.includes("--force") || args.includes("-f");

if (!port) {
  console.log("Usage: killport <port> [--force]");
  process.exit(1);
}

const portNum = parseInt(port, 10);
if (isNaN(portNum)) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

killPort(portNum, { force });
