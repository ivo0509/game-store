ALTER TABLE "bank_accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bank_transactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "bank_accounts" CASCADE;--> statement-breakpoint
DROP TABLE "bank_transactions" CASCADE;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_bank_account_id_bank_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wallet_balance" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "bank_account_id";--> statement-breakpoint
DROP TYPE "public"."bank_tx_type";