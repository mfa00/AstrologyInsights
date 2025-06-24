import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  authenticateToken, 
  optionalAuth, 
  requireAdmin, 
  requireEditor,
  generateToken,
  authenticateUser 
} from "./middleware/auth";
import { 
  asyncHandler, 
  ValidationError, 
  NotFoundError,
  validateRequiredFields 
} from "./middleware/errorHandler";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===== AUTHENTICATION ROUTES =====
  
  // Login endpoint
  app.post("/api/auth/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    validateRequiredFields(['username', 'password'], req.body);
    
    const user = authenticateUser(username, password);
    if (!user) {
      throw new ValidationError('Invalid username or password');
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      data: {
        user,
        token,
        expiresIn: '7d'
      }
    });
  }));

  // Get current user info
  app.get("/api/auth/me", authenticateToken, asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: { user: req.user }
    });
  }));

  // Logout endpoint (client-side token removal)
  app.post("/api/auth/logout", asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }));

  // ===== ARTICLE ROUTES =====
  
  // Get all articles with optional filters
  app.get("/api/articles", optionalAuth, asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
    
    const articles = await storage.getArticles(limit, offset, category, featured);
    res.json({
      success: true,
      data: articles,
      pagination: {
        limit,
        offset,
        total: articles.length
      }
    });
  }));

  // Get popular articles (must be before /:id route)
  app.get("/api/articles/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await storage.getPopularArticles(limit);
      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to fetch popular articles",
          code: "INTERNAL_ERROR",
          statusCode: 500
        }
      });
    }
  });

  // Search articles (must be before /:id route)
  app.get("/api/articles/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const articles = await storage.searchArticles(query);
      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to search articles",
          code: "INTERNAL_ERROR",
          statusCode: 500
        }
      });
    }
  });

  // Get single article by ID (must be after specific routes)
  app.get("/api/articles/:id", optionalAuth, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }

    // First check if article exists
    const articleExists = await storage.getArticle(id);
    if (!articleExists) {
      throw new NotFoundError("Article not found");
    }

    // Update view count with session tracking
    const sessionId = req.sessionID; // Use sessionID instead of session.id
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    console.log(`📊 Article ${id} accessed by session: ${sessionId}, IP: ${ipAddress}`);
    console.log(`🔍 Session object:`, { 
      sessionID: req.sessionID, 
      session: req.session, 
      cookie: req.session?.cookie 
    });
    
    const viewCounted = await storage.updateArticleViews(id, sessionId, ipAddress, userAgent);
    
    // Get article with updated view count
    const article = await storage.getArticle(id);
    
    res.json({
      success: true,
      data: article,
      viewCounted // Include whether view was counted for debugging
    });
  }));

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

  // Get all horoscopes
  app.get("/api/horoscopes", async (req, res) => {
    try {
      const horoscopes = await storage.getAllHoroscopes();
      res.json({
        success: true,
        data: horoscopes
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to fetch horoscopes",
          code: "INTERNAL_ERROR",
          statusCode: 500
        }
      });
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

  // ===== ADMIN ROUTES =====
  
  // Protected admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const users = await storage.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  }));

  app.get("/api/admin/statistics", authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const stats = await storage.getViewStatistics();
    res.json({
      success: true,
      data: stats
    });
  }));

  app.post("/api/admin/initialize-views", authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    await storage.initializeHistoricalViewCounts();
    res.json({
      success: true,
      message: "Historical view counts initialized successfully"
    });
  }));

  app.post("/api/admin/users", authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    validateRequiredFields(['username', 'email', 'role'], req.body);
    
    const user = await storage.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  }));

  // ===== ARTICLE MANAGEMENT ROUTES =====

  // Create new article (editors and admins)
  app.post("/api/articles", authenticateToken, requireEditor, asyncHandler(async (req, res) => {
    validateRequiredFields(['title', 'content', 'category'], req.body);
    
    const articleData = {
      ...req.body,
      author: req.body.author || req.user.username,
      authorRole: req.body.authorRole || req.user.role,
      publishedAt: new Date()
    };
    
    const article = await storage.createArticle(articleData);
    res.status(201).json({
      success: true,
      data: article
    });
  }));

  // Update article (editors and admins)
  app.put("/api/articles/:id", authenticateToken, requireEditor, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }
    
    const updatedArticle = await storage.updateArticle(id, req.body);
    if (!updatedArticle) {
      throw new NotFoundError("Article not found");
    }
    
    res.json({
      success: true,
      data: updatedArticle
    });
  }));

  // Delete article (admin only)
  app.delete("/api/articles/:id", authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }
    
    const deleted = await storage.deleteArticle(id);
    if (!deleted) {
      throw new NotFoundError("Article not found");
    }
    
    res.json({
      success: true,
      message: "Article deleted successfully"
    });
  }));

  const httpServer = createServer(app);
  return httpServer;
}
