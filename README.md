# killport

[![npm](https://img.shields.io/npm/v/@ma.vu/killport)](https://www.npmjs.com/package/@ma.vu/killport)

**Supported:** Linux, macOS, Windows

A CLI tool to kill processes running on a specific port. No more googling "how to kill port 3000".

## Installation

```bash
npm install -g @ma.vu/killport
```

## Usage

```bash
# Kill process on port 8080
killport 8080

# Force kill (SIGKILL instead of SIGTERM)
killport 8080 --force
killport 8080 -f

# List all listening ports
killport --peek
killport -p
```

## Examples

Kill a stuck development server:

```bash
$ killport 3000
Killed process 12345 on port 3000
```

Nothing running? Get a hint:

```bash
$ killport 9999
Nothing running on port 9999
Hint: use --peek or -p to see all listening ports
```

See what's listening:

```bash
$ killport --peek
Listening ports:
  3000 - node (pid 12345)
  5432 - postgres (pid 67890)
  8080 - java (pid 11111)
```

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--force` | `-f` | Force kill using SIGKILL instead of SIGTERM |
| `--peek` | `-p` | List all processes listening on ports |

## Philosophy

**Zero runtime dependencies.** The only dev dependency is `esbuild` for bundling into a single file.

## Requirements

- Node.js 18+
- macOS, Linux, or Windows

## License

ISC

---

## Implementation Notes

This tool needs to: (1) find which process owns a port, and (2) kill it.

**Why `netstat` instead of `lsof`?**
- `lsof` is Unix-only (macOS/Linux)
- `netstat` exists on all platforms (Windows, macOS, Linux)
- One tool, platform-specific flags:
  - Windows: `netstat -ano`
  - macOS: `netstat -anv`
  - Linux: `netstat -tlnp`

**Why `process.kill()` instead of shell commands?**
- Node's built-in `process.kill(pid, signal)` works cross-platform
- No need to shell out to `kill` (Unix) or `taskkill` (Windows)
- Cleaner, fewer moving parts

**Why not pure Node.js for port detection?**
- Node has no API to query "which process owns port X"
- `net` module can check if a port is busy, but not WHO owns it
- OS-level tools like `netstat` are required for PID discovery

---

## LLM Context

This section helps AI assistants understand the project structure.

**Purpose**: CLI tool to find and kill processes occupying network ports on macOS, Linux, and Windows.

**Structure**:
```
killport/
├── bin/cli.js      # CLI entry point, argument parsing
├── lib/kill.js     # Core logic: findProcessOnPort, killPort, peekPorts
├── test/cli.test.js # Tests using node:test
└── package.json
```

**Key functions in `lib/kill.js`**:
- `findProcessOnPort(port)` - Returns array of PIDs using the port
- `killPort(port, { force })` - Kills process on port, returns boolean
- `peekPorts()` - Returns array of `{ command, pid, port }` for all listening ports

**Tech**: Pure Node.js, no dependencies. Uses `netstat` for port detection and `process.kill()` for termination.

**Testing**: `npm test` runs tests via Node's built-in test runner (`node:test`).
