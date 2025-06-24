import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all articles with optional filters
  app.get("/api/articles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
      
      const articles = await storage.getArticles(limit, offset, category, featured);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get single article by ID
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Update view count
      await storage.updateArticleViews(id);
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Search articles
  app.get("/api/articles/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const articles = await storage.searchArticles(query);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Get popular articles
  app.get("/api/articles/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await storage.getPopularArticles(limit);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular articles" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by name
  app.get("/api/categories/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const category = await storage.getCategory(name);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get daily horoscope
  app.get("/api/horoscopes/:zodiacSign", async (req, res) => {
    try {
      const zodiacSign = req.params.zodiacSign;
      const horoscope = await storage.getDailyHoroscope(zodiacSign);
      
      if (!horoscope) {
        return res.status(404).json({ message: "Horoscope not found for this zodiac sign" });
      }
      
      res.json(horoscope);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch horoscope" });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email address is required" });
      }
      
      // In a real app, you would save this to a database or send to an email service
      console.log(`Newsletter subscription: ${email}`);
      
      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
