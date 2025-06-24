CREATE TABLE "article_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_views_article_id_session_id_unique" UNIQUE("article_id","session_id")
); 