import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(validatedData);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/meetings", async (_req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.partial().parse(req.body);
      const meeting = await storage.updateMeeting(req.params.id, validatedData);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
