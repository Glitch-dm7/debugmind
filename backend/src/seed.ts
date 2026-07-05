// Run with: bun run seed
// Seeds 20 realistic bugs across TypeScript, Python, Go, Rust, Java
// Spread across 4 projects to test cross-project recall

const BASE_URL = "http://localhost:3001";

interface SeedBug {
  rawError: string;
  fix: string;
  language: string;
  framework?: string;
  projectId: string;
  tags: string[];
}

const bugs: SeedBug[] = [
  // ─── Project: proj-alpha (TypeScript / React) ─────────────────────────────

  {
    rawError: `TypeError: Cannot read properties of undefined (reading 'map')
  at ProjectList (/src/components/ProjectList.tsx:42:7)
  at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:14985:18)`,
    fix: "The projects array was undefined on first render. Added optional chaining: projects?.map() and initialized state with useState<Project[]>([]) instead of useState(null).",
    language: "typescript",
    framework: "react",
    projectId: "proj-alpha",
    tags: ["undefined", "map", "react", "hooks", "initial-state"],
  },
  {
    rawError: `Unhandled Runtime Error
TypeError: Cannot read properties of null (reading 'addEventListener')
  at useEventListener (/src/hooks/useEventListener.ts:12:18)
  at Dashboard (/src/pages/Dashboard.tsx:34:3)`,
    fix: "The ref was null on first render because the DOM element hadn't mounted yet. Wrapped the addEventListener call in a null check: if (element) element.addEventListener(...). Also added cleanup in the useEffect return.",
    language: "typescript",
    framework: "react",
    projectId: "proj-alpha",
    tags: ["null", "ref", "useEffect", "event-listener", "dom"],
  },
  {
    rawError: `Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
  at checkForNestedUpdates (/node_modules/react-dom/cjs/react-dom.development.js:25837:9)
  at scheduleUpdateOnFiber (/node_modules/react-dom/cjs/react-dom.development.js:25780:5)
  at UserProfile (/src/components/UserProfile.tsx:28:5)`,
    fix: "setState was being called directly in the render body instead of inside a useEffect. Moved the state update inside useEffect with the correct dependency array: useEffect(() => { setUser(props.user) }, [props.user]).",
    language: "typescript",
    framework: "react",
    projectId: "proj-alpha",
    tags: ["infinite-loop", "re-render", "setState", "useEffect", "react"],
  },
  {
    rawError: `AxiosError: Request failed with status code 401
  at settle (/node_modules/axios/lib/core/settle.js:19:12)
  at XMLHttpRequest.onloadend (/node_modules/axios/lib/adapters/xhr.js:117:7)
  at /src/api/client.ts:45:12`,
    fix: "The JWT token was expired but we weren't catching 401s globally. Added an Axios response interceptor that checks for 401, clears localStorage, and redirects to /login. Also added token refresh logic before expiry using a setTimeout.",
    language: "typescript",
    framework: "react",
    projectId: "proj-alpha",
    tags: ["401", "auth", "jwt", "axios", "interceptor"],
  },
  {
    rawError: `TypeError: Cannot destructure property 'id' of 'user' as it is undefined.
  at Header (/src/components/Header.tsx:15:11)
  at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:14985:18)`,
    fix: "The user object from context was undefined during initial load before the auth check completed. Added a loading state to AuthContext and rendered a skeleton/null in Header while loading: const { user, loading } = useAuth(); if (loading) return null;",
    language: "typescript",
    framework: "react",
    projectId: "proj-alpha",
    tags: ["destructure", "undefined", "context", "auth", "loading-state"],
  },

  // ─── Project: proj-beta (Python / FastAPI) ────────────────────────────────

  {
    rawError: `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) 
FATAL: remaining connection slots are reserved for non-replication superuser connections
[SQL: SELECT users.id FROM users WHERE users.email = %(email_1)s]
File "/app/routers/auth.py", line 34, in login`,
    fix: "Hit PostgreSQL's max_connections limit. The SQLAlchemy engine was creating a new connection pool per request instead of being shared. Moved engine creation to a module-level singleton and configured pool_size=10, max_overflow=20. Also added connection pooling via PgBouncer in staging.",
    language: "python",
    framework: "fastapi",
    projectId: "proj-beta",
    tags: ["postgres", "connection-pool", "sqlalchemy", "max-connections", "db"],
  },
  {
    rawError: `pydantic.error_wrappers.ValidationError: 1 validation error for UserCreate
email
  value is not a valid email address (type=value_error.email)
File "/app/routers/users.py", line 67, in create_user`,
    fix: "The email field in the Pydantic model used EmailStr but pydantic[email] extra wasn't installed. Ran: pip install pydantic[email]. Also added a try/except around the endpoint to return a proper 422 with the validation error details instead of a 500.",
    language: "python",
    framework: "fastapi",
    projectId: "proj-beta",
    tags: ["pydantic", "validation", "email", "422", "dependencies"],
  },
  {
    rawError: `asyncio.exceptions.TimeoutError
  File "/app/services/email.py", line 23, in send_welcome_email
    await asyncio.wait_for(smtp_client.send(msg), timeout=5.0)
  File "/usr/lib/python3.11/asyncio/tasks.py", line 489, in wait_for`,
    fix: "The SMTP server was taking longer than 5s during peak load. Increased timeout to 30s and moved email sending to a background task using FastAPI's BackgroundTasks so it doesn't block the HTTP response. The welcome email now sends after the 201 response is returned.",
    language: "python",
    framework: "fastapi",
    projectId: "proj-beta",
    tags: ["async", "timeout", "smtp", "background-tasks", "email"],
  },
  {
    rawError: `RecursionError: maximum recursion depth exceeded while calling a Python object
  File "/app/models/category.py", line 45, in __repr__
  File "/app/models/category.py", line 45, in __repr__
  File "/app/models/category.py", line 45, in __repr__`,
    fix: "The Category model had a self-referential relationship (parent/children) and the __repr__ method was calling itself recursively through the relationship. Fixed by limiting __repr__ to only scalar fields: return f'Category(id={self.id}, name={self.name})' without traversing relationships.",
    language: "python",
    framework: "fastapi",
    projectId: "proj-beta",
    tags: ["recursion", "sqlalchemy", "self-referential", "repr", "orm"],
  },
  {
    rawError: `jwt.exceptions.ExpiredSignatureError: Signature has expired
  File "/app/core/security.py", line 28, in verify_token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
  File "/app/middleware/auth.py", line 19, in authenticate`,
    fix: "JWT tokens were expiring but the frontend wasn't refreshing them. Added a /auth/refresh endpoint that accepts a long-lived refresh token and issues a new access token. Also fixed the token expiry check to return 401 instead of 500 so the frontend interceptor could handle it.",
    language: "python",
    framework: "fastapi",
    projectId: "proj-beta",
    tags: ["jwt", "expired", "401", "refresh-token", "auth"],
  },

  // ─── Project: proj-gamma (Go / Gin) ──────────────────────────────────────

  {
    rawError: `panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x6f3a21]
goroutine 1 [running]:
main.(*UserService).GetUser(...)
	/app/services/user_service.go:34 +0x89`,
    fix: "The db query returned nil when no user was found but we dereferenced the result without checking. Added a nil check after the query: if user == nil { return nil, ErrUserNotFound }. Also updated the handler to return 404 instead of panicking.",
    language: "go",
    framework: "gin",
    projectId: "proj-gamma",
    tags: ["nil-pointer", "panic", "segfault", "db-query", "error-handling"],
  },
  {
    rawError: `goroutine leak detected: 847 goroutines running
GOroutine LEAK at /app/workers/processor.go:67
goroutine 847 [chan receive]:
main.processJob(0xc0001234, 0xc0005678)
	/app/workers/processor.go:67 +0x45`,
    fix: "Worker goroutines were blocking on channel receive with no timeout or cancellation. Fixed by passing a context with cancellation to each worker and selecting on both the job channel and ctx.Done(). Added defer wg.Done() to ensure WaitGroup is always decremented.",
    language: "go",
    framework: "gin",
    projectId: "proj-gamma",
    tags: ["goroutine-leak", "channel", "context", "cancellation", "concurrency"],
  },
  {
    rawError: `Error: dial tcp 10.0.0.5:5432: connect: connection refused
main.initDB()
	/app/database/db.go:23 +0x134
main.main()
	/app/main.go:45 +0x89
exit status 1`,
    fix: "The app was starting before the database container was ready in Docker Compose. Added a retry loop with exponential backoff in initDB(): retry up to 10 times with 2s delay, doubling each attempt. Also added depends_on with health check condition in docker-compose.yml.",
    language: "go",
    framework: "gin",
    projectId: "proj-gamma",
    tags: ["db", "connection-refused", "docker", "startup", "retry"],
  },
  {
    rawError: `json: cannot unmarshal string into Go value of type int64
main.(*OrderHandler).CreateOrder()
	/app/handlers/order.go:89 +0x2a1
github.com/gin-gonic/gin.(*Context).ShouldBindJSON()`,
    fix: "The client was sending price as a string (\"1999\") but the Go struct expected int64. Fixed the struct tag to use json.Number and parse it explicitly, or updated the API contract to always send numeric types. Added input validation middleware to catch type mismatches early.",
    language: "go",
    framework: "gin",
    projectId: "proj-gamma",
    tags: ["json", "type-mismatch", "unmarshal", "validation", "api"],
  },

  // ─── Project: proj-delta (Node.js / Express) ─────────────────────────────

  {
    rawError: `UnhandledPromiseRejectionWarning: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
    at NativeConnection.Connection.openUri (/app/node_modules/mongoose/lib/connection.js:846:32)
    at /app/src/database.js:12:16`,
    fix: "MongoDB wasn't running or the connection string was wrong. Added MONGODB_URI to .env and used process.env.MONGODB_URI in the connection string. Also added mongoose connection event listeners for 'connected', 'error', and 'disconnected' to improve observability, and wrapped connection in a try/catch.",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["mongodb", "mongoose", "connection-refused", "env", "database"],
  },
  {
    rawError: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (_http_outgoing.js:573:11)
    at /app/src/middleware/errorHandler.js:23:7
    at Layer.handle_error (/app/node_modules/express/lib/router/layer.js:71:5)`,
    fix: "The route handler was calling res.json() and then calling next(err) after, causing headers to be sent twice. Fixed by adding return before every res.json() call and removing the next(err) call after a response was already sent. Added a check: if (res.headersSent) return;",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["headers-sent", "express", "middleware", "response", "error-handler"],
  },
  {
    rawError: `PayloadTooLargeError: request entity too large
    at readStream (/app/node_modules/raw-body/index.js:155:17)
    at /app/node_modules/body-parser/lib/types/json.js:101:7
    status: 413`,
    fix: "The default Express body-parser limit is 100kb. Our endpoint was receiving base64-encoded images. Fixed by increasing the limit: app.use(express.json({ limit: '10mb' })). Long-term fix: moved image uploads to multipart/form-data with multer and stored in S3 instead of base64 in JSON.",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["413", "payload-too-large", "body-parser", "upload", "limit"],
  },
  {
    rawError: `ReferenceError: Cannot access 'router' before initialization
    at Object.<anonymous> (/app/src/routes/users.js:3:18)
    at Module._compile (node:internal/modules/cjs/loader:1356:14)`,
    fix: "Circular dependency between routes/users.js and middleware/auth.js — each was requiring the other at the top level. Fixed by moving the auth middleware require inside the route handler function instead of at module level, breaking the circular reference.",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["circular-dependency", "require", "initialization", "modules", "routing"],
  },
  {
    rawError: `ValidationError: \"password\" length must be at least 8 characters long
    at Object.assert (/app/node_modules/@hapi/hoek/lib/assert.js:33:11)
    at /app/src/validators/userValidator.js:34:5
    status: 400`,
    fix: "The Joi validation error was being thrown but not caught in the route handler, causing an unhandled rejection. Added a validateRequest middleware that wraps Joi validation in try/catch and returns a structured 400 response with the validation error details. Applied it to all POST/PUT routes.",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["validation", "joi", "400", "middleware", "error-handling"],
  },
  {
    rawError: `Error: ENOENT: no such file or directory, open '/app/uploads/avatar_tmp_1234.jpg'
    at Object.openSync (node:fs:590:3)
    at /app/src/services/imageService.js:45:12
    errno: -2, syscall: 'open'`,
    fix: "The uploads directory didn't exist in the production container (only in local dev). Added a startup check: if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }). Also added the uploads directory to .dockerignore but pre-created it in the Dockerfile with RUN mkdir -p /app/uploads.",
    language: "javascript",
    framework: "express",
    projectId: "proj-delta",
    tags: ["enoent", "file-not-found", "uploads", "docker", "filesystem"],
  },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`🌱 Seeding ${bugs.length} bugs into DebugMind...\n`);
  console.log("⚠️  Each bug takes ~45s to process (Cognee cognify step).");
  console.log("    Total estimated time: ~15 minutes.\n");
  console.log("    Tip: Run this and go grab a coffee ☕\n");
  console.log("─".repeat(60));

  let success = 0;
  let failed = 0;

  for (let i = 0; i < bugs.length; i++) {
    const bug = bugs[i];
    const num = `[${i + 1}/${bugs.length}]`;

    try {
      process.stdout.write(
        `${num} Submitting: ${bug.language}/${bug.framework ?? "core"} — ${bug.projectId}... `
      );

      const res = await fetch(`${BASE_URL}/api/bugs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bug),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      const data = await res.json() as { bug: { id: string } };
      console.log(`✅ ${data.bug.id.slice(0, 8)}...`);
      success++;

    } catch (err: any) {
      console.log(`❌ FAILED`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }

    // Small delay between bugs to avoid hammering Cognee+Gemini
    if (i < bugs.length - 1) {
      process.stdout.write(`    ⏳ Waiting 5s before next submission...\r`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log(`\n🌱 Seeding complete!`);
  console.log(`   ✅ Success: ${success}/${bugs.length}`);
  if (failed > 0) {
    console.log(`   ❌ Failed:  ${failed}/${bugs.length}`);
    console.log(`   Re-run the seed script to retry failed entries.`);
  }
  console.log(`\n   Run some recall queries to test similarity matching:`);
  console.log(`   curl -X POST http://localhost:3001/bugs/recall \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"rawError": "TypeError: Cannot read properties of null"}'`);
}

seed().catch(console.error);