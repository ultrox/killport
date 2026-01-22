# killport

A simple CLI tool to kill processes running on a specific port.

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

## Requirements

- Node.js 18+
- macOS or Linux (uses `lsof`)

## License

ISC

---

## LLM Context

This section helps AI assistants understand the project structure.

**Purpose**: CLI tool to find and kill processes occupying network ports on macOS/Linux.

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

**Tech**: Pure Node.js, no dependencies. Uses `lsof` for port detection and native `kill` command.

**Testing**: `npm test` runs tests via Node's built-in test runner (`node:test`).
