import { Hono } from "hono";
import { bugService } from "../services/bugService";
import { forgetProject } from "../services/cogneeClient";
import type {
  SubmitBugRequest,
  RecallRequest,
  FeedbackRequest,
  ArchiveProjectRequest,
} from "../types/index.ts";

export const bugsRouter = new Hono();

// POST /bugs — submit a new bug + fix into memory
bugsRouter.post("/", async (c) => {
  const body = await c.req.json<SubmitBugRequest>();

  if (!body.rawError || !body.fix || !body.language || !body.projectId) {
    return c.json({ error: "rawError, fix, language, and projectId are required" }, 400);
  }

  const bug = await bugService.submit(body);
  return c.json({ success: true, bug }, 201);
});

// POST /bugs/recall — query memory for similar bugs
bugsRouter.post("/recall", async (c) => {
  const body = await c.req.json<RecallRequest>();

  if (!body.rawError) {
    return c.json({ error: "rawError is required" }, 400);
  }

  const results = await bugService.recall(body.rawError, body.projectId);
  return c.json({ results }, 200);
});

// POST /bugs/feedback — mark a recalled fix as worked/failed
bugsRouter.post("/feedback", async (c) => {
  const body = await c.req.json<FeedbackRequest>();

  if (!body.bugId || !body.outcome) {
    return c.json({ error: "bugId and outcome are required" }, 400);
  }

  if (body.outcome !== "worked" && body.outcome !== "failed") {
    return c.json({ error: "outcome must be 'worked' or 'failed'" }, 400);
  }

  await bugService.feedback(body);
  return c.json({ success: true }, 200);
});

// POST /bugs/archive — forget() a project (soft or hard delete)
bugsRouter.post("/archive", async (c) => {
  const body = await c.req.json<ArchiveProjectRequest>();

  if (!body.projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  await forgetProject(body.projectId, body.hardDelete ?? false);
  return c.json({ success: true, hardDelete: body.hardDelete ?? false }, 200);
});