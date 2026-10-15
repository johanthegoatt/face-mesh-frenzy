// Starts the Electron app. ELECTRON_RUN_AS_NODE, if a parent tool set it,
// makes electron behave as plain node and the window never opens, so it is
// cleared first. Works the same on Windows, macOS and Linux.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const electronBinary = require("electron");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, ["."], { stdio: "inherit", env });
child.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));
