import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAI, generateDailySummary } from "./gemini";
import {
  insertConversationSchema,
  insertMessageSchema,
  insertGoalSchema,
  insertNoteSchema,
  insertActivitySchema,
  type ChatResponse,
  type DailySummary,
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Conversations
  app.get("/api/conversations", async (_req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.updateConversation(req.params.id, req.body);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const success = await storage.deleteConversation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Chat endpoint - handles sending messages and getting AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Create or get conversation
      let convId = conversationId;
      let conversation;

      if (!convId) {
        // Create new conversation
        const title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
        conversation = await storage.createConversation({ title });
        convId = conversation.id;
      } else {
        conversation = await storage.getConversation(convId);
        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: convId,
        role: "user",
        content: message,
      });

      // Get conversation history
      const messages = await storage.getMessages(convId);
      const conversationHistory = messages
        .filter((m) => m.id !== userMessage.id)
        .map((m) => ({ role: m.role, content: m.content }));

      // Get AI response
      const aiResponse = await chatWithAI(message, conversationHistory);

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: convId,
        role: "assistant",
        content: aiResponse,
      });

      // Update conversation timestamp
      await storage.updateConversation(convId, {
        updatedAt: new Date(),
      });

      // Log activity
      await storage.createActivity({
        type: "chat",
        description: `Had a conversation about: ${message.substring(0, 60)}${message.length > 60 ? "..." : ""}`,
      });

      const response: ChatResponse = {
        message: aiMessage,
        conversationId: convId,
      };

      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Goals
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(data);

      // Log activity
      await storage.createActivity({
        type: "goal_created",
        description: `Created goal: ${goal.title}`,
      });

      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const existingGoal = await storage.getGoal(req.params.id);
      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      const goal = await storage.updateGoal(req.params.id, req.body);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Log activity
      if (req.body.completed === true && !existingGoal.completed) {
        await storage.createActivity({
          type: "goal_completed",
          description: `Completed goal: ${goal.title}`,
        });
      } else {
        await storage.createActivity({
          type: "goal_updated",
          description: `Updated goal: ${goal.title}`,
        });
      }

      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Notes
  app.get("/api/notes", async (_req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const data = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(data);

      // Log activity
      await storage.createActivity({
        type: "note_created",
        description: `Created note: ${note.title}`,
      });

      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Log activity
      await storage.createActivity({
        type: "note_updated",
        description: `Updated note: ${note.title}`,
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const success = await storage.deleteNote(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Activities
  app.get("/api/activities", async (_req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const data = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(data);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ error: "Invalid activity data" });
    }
  });

  // Daily Summary
  app.get("/api/summary/daily", async (_req, res) => {
    try {
      const activities = await storage.getActivities();
      const today = format(new Date(), "yyyy-MM-dd");

      // Filter today's activities
      const todayActivities = activities.filter(
        (a) => format(new Date(a.createdAt), "yyyy-MM-dd") === today
      );

      const totalChats = todayActivities.filter((a) => a.type === "chat").length;
      const goalsCompleted = todayActivities.filter((a) => a.type === "goal_completed").length;
      const notesCreated = todayActivities.filter((a) => a.type === "note_created").length;

      const insights = await generateDailySummary(totalChats, goalsCompleted, notesCreated);

      const summary: DailySummary = {
        date: today,
        totalChats,
        goalsCompleted,
        notesCreated,
        insights,
      };

      res.json(summary);
    } catch (error) {
      console.error("Daily summary error:", error);
      res.status(500).json({ error: "Failed to generate daily summary" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
