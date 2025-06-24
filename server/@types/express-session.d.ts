import "express-session";

declare module "express-session" {
  interface SessionData {
    id: string;
    // Add other session properties as needed
  }
}

declare module "express" {
  interface Request {
    session: import("express-session").Session & Partial<import("express-session").SessionData>;
  }
} 