CREATE TABLE "article_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_views_article_id_session_id_unique" UNIQUE("article_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"author" text NOT NULL,
	"author_role" text NOT NULL,
	"image_url" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"views" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_georgian" text NOT NULL,
	"description" text,
	"color" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "horoscopes" (
	"id" serial PRIMARY KEY NOT NULL,
	"zodiac_sign" text NOT NULL,
	"zodiac_sign_georgian" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp NOT NULL
);
