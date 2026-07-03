import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { bugsRouter } from "./routes/bugs";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Vite dev server
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// Health check — useful for verifying Cognee is reachable too
app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

// Routes
app.route("/api/bugs", bugsRouter);

// 404 fallback
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("[ERROR]", err.message);
  return c.json({ error: err.message ?? "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT ?? "3001");
console.log(`🔥 DebugMind backend running on http://localhost:${port}`);

export default { port, fetch: app.fetch };