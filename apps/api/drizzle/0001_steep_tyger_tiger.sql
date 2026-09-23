-- Hand-written: integer identity ids become uuid in the four tables that have
-- one. Postgres cannot ALTER an identity column to uuid (nor cast integer to
-- uuid), so the tables are dropped and recreated. Safe only because they are
-- still empty at this point; catalog_items and the enums are left untouched.
-- Dropped in reverse dependency order, without CASCADE, so an unexpected
-- dependent object makes this fail instead of silently disappearing.
DROP TABLE "orders";--> statement-breakpoint
DROP TABLE "purchase_request_items";--> statement-breakpoint
DROP TABLE "purchase_requests";--> statement-breakpoint
DROP TABLE "knowledge_documents";--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar NOT NULL,
	"byte_size" integer NOT NULL,
	"path_file" varchar NOT NULL,
	"status" "document_status" DEFAULT 'processing' NOT NULL,
	"extracted_text" varchar,
	"failure_reason" varchar,
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_purchaseRequestId_unique" UNIQUE("purchase_request_id")
);
--> statement-breakpoint
CREATE TABLE "purchase_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"sku" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_text" varchar NOT NULL,
	"status" "request_status" DEFAULT 'received' NOT NULL,
	"knowledge_document_id" uuid,
	"proposal" jsonb,
	"decision" jsonb,
	"total_cents" integer,
	"inngest_run_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_sku_catalog_items_sku_fk" FOREIGN KEY ("sku") REFERENCES "public"."catalog_items"("sku") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_knowledge_document_id_knowledge_documents_id_fk" FOREIGN KEY ("knowledge_document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE no action ON UPDATE no action;
