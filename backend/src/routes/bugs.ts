import { Hono } from "hono";
import { bugService } from "../services/bugService";
import { forgetProject } from "../services/cogneeClient";
import type {
  SubmitBugRequest,
  RecallRequest,
  FeedbackRequest,
  ArchiveProjectRequest,
} from "../types/index.ts";
import { projectStore } from "@/services/projectStore";
import { bugStore } from "@/services/bugStore";
import path from "path";
import fs from "fs/promises";

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

bugsRouter.get("/projects", (c) => {
  const projects = projectStore.getAll();
  return c.json({ projects }, 200);
});

// POST /bugs/archive — forget() a project (soft or hard delete)
bugsRouter.post("/archive", async (c) => {
  const body = await c.req.json<ArchiveProjectRequest>();

  if (!body.projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  const projects = projectStore.getAll();
  const project = projects.find((p) => p.id === body.projectId);

  if (!project) {
    return c.json({ error: `Project ${body.projectId} not found` }, 404);
  }

  // Call Cognee for hard delete
  await forgetProject(body.projectId, project.datasetId, body.hardDelete ?? false);

  if (body.hardDelete) {
    projectStore.delete(body.projectId);

    // Also remove all bugs for this project from local store
    const allBugs = bugStore.getAll();
    allBugs
      .filter((b) => b.projectId === body.projectId)
      .forEach((b) => bugStore.deleteById(b.id));
  }

  return c.json({
    success: true,
    projectId: body.projectId,
    hardDelete: body.hardDelete ?? false,
  }, 200);
});

// POST /bugs/unarchive — restore a soft-deleted project
bugsRouter.post("/unarchive", async (c) => {
  const body = await c.req.json<{ projectId: string }>();
  if (!body.projectId) return c.json({ error: "projectId is required" }, 400);

  const project = projectStore.unarchive(body.projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  return c.json({ success: true, project }, 200);
});

bugsRouter.get("/bugs-projects-file-check", async (c) => {
  try {
    // absolute path to data folder
    const dataFolderPath = path.resolve("data");

    console.log("========== DATA FOLDER PATH ==========");
    console.log(dataFolderPath);

    // list files inside data folder
    const dataFiles = await fs.readdir(dataFolderPath);

    console.log("========== DATA FOLDER FILES ==========");
    console.log(dataFiles);

    // optional: read bugs.json
    const bugsFilePath = path.resolve("data/bugs.json");

    const bugsContent = await fs.readFile(bugsFilePath, "utf-8");

    console.log("========== BUGS.JSON CONTENT ==========");
    console.log(bugsContent);

    return c.json({
      success: true,
      dataFolderPath,
      dataFiles,
    });
  } catch (error : any) {
    console.error("FILE CHECK ERROR:", error);

    return c.json(
      {
        success: false,
        error: error?.message || "",
      },
      500
    );
  }
});