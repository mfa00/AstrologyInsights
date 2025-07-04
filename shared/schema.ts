import { pgTable, text, serial, integer, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  authorRole: text("author_role").notNull(),
  imageUrl: text("image_url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameGeorgian: text("name_georgian").notNull(),
  description: text("description"),
  color: text("color").notNull(),
});

export const horoscopes = pgTable("horoscopes", {
  id: serial("id").primaryKey(),
  zodiacSign: text("zodiac_sign").notNull(),
  zodiacSignGeorgian: text("zodiac_sign_georgian").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").notNull(),
});

export const articleViews = pgTable("article_views", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  sessionId: text("session_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure unique combination of article and session
  unq: unique().on(table.articleId, table.sessionId),
}));

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  likes: true,
  comments: true,
  views: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertHoroscopeSchema = createInsertSchema(horoscopes).omit({
  id: true,
});

export const insertArticleViewSchema = createInsertSchema(articleViews).omit({
  id: true,
  viewedAt: true,
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Horoscope = typeof horoscopes.$inferSelect;
export type InsertHoroscope = z.infer<typeof insertHoroscopeSchema>;
export type ArticleView = typeof articleViews.$inferSelect;
export type InsertArticleView = z.infer<typeof insertArticleViewSchema>;
