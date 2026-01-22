const { test } = require("node:test");
const assert = require("node:assert");
const { spawn, execSync } = require("node:child_process");
const path = require("node:path");

const cli = path.join(__dirname, "../bin/cli.js");

function run(...args) {
  return execSync(`node ${cli} ${args.join(" ")}`, { encoding: "utf-8" }).trim();
}

test("shows nothing to kill on unused port with hint", () => {
  const output = run("59999");
  assert.ok(output.includes("59999")); // port mentioned in playful message
  assert.ok(output.includes("Hint: use --peek or -p"));
});

test("shows usage when no port provided", () => {
  try {
    run();
    assert.fail("should have exited with error");
  } catch (err) {
    assert.ok(err.stdout.includes("Usage: killport <port>"));
  }
});

test("kills process running on port", async () => {
  const server = spawn("node", [
    "-e",
    "require('net').createServer().listen(58886, () => console.log('ready'))",
  ]);

  await new Promise((resolve) => {
    server.stdout.on("data", (data) => {
      if (data.toString().includes("ready")) resolve();
    });
  });

  const output = run("58886");
  assert.ok(output.includes("node")); // process name in playful kill message
});

test("force kills process running on port", async () => {
  const server = spawn("node", [
    "-e",
    "require('net').createServer().listen(58885, () => console.log('ready'))",
  ]);

  await new Promise((resolve) => {
    server.stdout.on("data", (data) => {
      if (data.toString().includes("ready")) resolve();
    });
  });

  const output = run("58885", "--force");
  assert.ok(output.includes("node")); // process name in playful kill message
});

test("peek shows listening ports", async () => {
  const server = spawn("node", [
    "-e",
    "require('net').createServer().listen(58884, () => console.log('ready'))",
  ]);

  await new Promise((resolve) => {
    server.stdout.on("data", (data) => {
      if (data.toString().includes("ready")) resolve();
    });
  });

  const output = run("--peek");
  assert.ok(output.includes("Listening ports:"));
  assert.ok(output.includes("58884"));

  server.kill();
});
