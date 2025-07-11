CREATE TABLE "event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendee" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid,
	"temp_user_email" varchar(200),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	CONSTRAINT "event_attendee_event_id_user_id_temp_user_email_key" UNIQUE("event_id","user_id","temp_user_email"),
	CONSTRAINT "chk_user" CHECK (((user_id IS NOT NULL) AND (temp_user_email IS NULL)) OR ((user_id IS NULL) AND (temp_user_email IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "event_wishlist" (
	"event_id" uuid NOT NULL,
	"wishlist_id" uuid NOT NULL,
	CONSTRAINT "event_wishlist_event_id_wishlist_id_pk" PRIMARY KEY("event_id","wishlist_id")
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"url" varchar(1000),
	"is_suggested" boolean DEFAULT false NOT NULL,
	"score" integer,
	"wishlist_id" uuid NOT NULL,
	"taker_id" uuid,
	"taken_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"picture_url" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE "secret_santa" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"description" text,
	"budget" numeric,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "secret_santa_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "secret_santa_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"secret_santa_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"draw_user_id" uuid,
	"exclusions" uuid[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"birthday" date,
	"password_enc" varchar(500),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"authorities" varchar(100)[] DEFAULT '{"ROLE_USER"}' NOT NULL,
	"last_ip" varchar(50),
	"last_connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"picture_url" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE "user_email_setting" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_new_item_notification" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_setting_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_password_verification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(200) NOT NULL,
	"expired_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_social" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"social_id" varchar(1000) NOT NULL,
	"social_type" varchar(50) NOT NULL,
	"picture_url" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_social_user_id_social_type_key" UNIQUE("user_id","social_type"),
	CONSTRAINT "user_social_social_id_social_type_key" UNIQUE("social_id","social_type")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"owner_id" uuid NOT NULL,
	"hide_items" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"logo_url" varchar(1000)
);
--> statement-breakpoint
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_wishlist" ADD CONSTRAINT "event_wishlist_wishlist_id_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_wishlist" ADD CONSTRAINT "event_wishlist_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_wishlist_id_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_taker_id_user_id_fk" FOREIGN KEY ("taker_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_santa" ADD CONSTRAINT "secret_santa_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_santa_user" ADD CONSTRAINT "secret_santa_user_secret_santa_id_secret_santa_id_fk" FOREIGN KEY ("secret_santa_id") REFERENCES "public"."secret_santa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_santa_user" ADD CONSTRAINT "secret_santa_user_draw_user_id_secret_santa_user_id_fk" FOREIGN KEY ("draw_user_id") REFERENCES "public"."secret_santa_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_santa_user" ADD CONSTRAINT "secret_santa_user_attendee_id_event_attendee_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."event_attendee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_email_setting" ADD CONSTRAINT "user_email_setting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_password_verification" ADD CONSTRAINT "user_password_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_social" ADD CONSTRAINT "user_social_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "secret_santa_user_secret_santa_id_attendee_id_key" ON "secret_santa_user" USING btree ("secret_santa_id","attendee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique_idx" ON "user" USING btree (lower((email)::text));