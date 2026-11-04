import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Translate the supervised preview's Vite flags to the existing Next dev CLI.
// Normal npm run dev remains a Next development server on its default port.
const appRoot = fileURLToPath(new URL("../apps/maarej-web/", import.meta.url));
const require = createRequire(new URL("../apps/maarej-web/package.json", import.meta.url));
const args = process.argv.slice(2);
const nextArgs = ["dev"];
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (arg === "--host") nextArgs.push("--hostname", args[++index]);
  else if (arg === "--port") nextArgs.push("--port", args[++index]);
  else if (arg !== "--strictPort") nextArgs.push(arg);
}
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), ...nextArgs], { cwd: appRoot, env: process.env, stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 1));
