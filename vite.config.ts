import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// The port nginx proxies to. `PORT` (process env, then `.env`) overrides it.
const DEFAULT_PORT = 3040;

// Hosts the preview server accepts a `Host:` header from. Vite rejects unknown
// hosts, so the public domain has to be listed or every proxied request 403s.
const DEFAULT_ALLOWED_HOSTS = "abituriyent.bdu.co.az";

export default defineConfig(({ mode }) => {
  // "" prefix => load every var, not just VITE_*, so PORT is picked up too.
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || DEFAULT_PORT;
  const allowedHosts = (env.ALLOWED_HOSTS || DEFAULT_ALLOWED_HOSTS)
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  // strictPort: behind a reverse proxy a silent fallback to port+1 is a
  // 502, not a recovery — fail loudly instead.
  const listen = { host: true, port, strictPort: true, allowedHosts };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: listen,
    preview: listen,
    build: {
      // Grammar chunks (e.g. the C++ TextMate grammar) are large but strictly
      // lazy — they never touch the critical path — so the size warning is noise.
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            motion: ["framer-motion"],
          },
        },
      },
    },
  };
});
