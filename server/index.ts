import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { v4 as uuidv4 } from 'uuid';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testDatabaseConnection } from "./db";
import { storage } from "./storage";
import { 
  corsMiddleware, 
  securityHeaders, 
  requestLogger, 
  sanitizeInput, 
  rateLimit 
} from "./middleware/security";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(requestLogger);
app.use(rateLimit());

// Session middleware for view tracking
app.use(session({
  secret: process.env.SESSION_SECRET || 'astrology-insights-session-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  },
  genid: () => {
    return uuidv4(); // Generate unique session IDs
  }
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sanitizeInput);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection and initialize
  console.log('🔄 Starting Astrology Insights server...');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  // Initialize database with seed data
  await storage.initializeDatabase();
  
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const env = process.env.NODE_ENV || "development";
  if (env === "development") {
    log("🎨 Setting up Vite development server for frontend...");
    await setupVite(app, server);
  } else {
    log("📦 Serving static files...");
    serveStatic(app);
  }

  // Error handling middleware (must be last, after Vite setup)
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, () => {
    log(`🚀 Server running on http://localhost:${port}`);
    log(`📚 API available at http://localhost:${port}/api`);
    log(`🔑 Admin login: username: admin, password: admin123`);
  });
})();
