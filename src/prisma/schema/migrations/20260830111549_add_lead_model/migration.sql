-- CreateEnum
CREATE TYPE "GoldPurity" AS ENUM ('K18', 'K22', 'K24');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('SUBMITTED');

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "gross_weight_grams" DECIMAL(10,3) NOT NULL,
    "net_weight_grams" DECIMAL(10,3) NOT NULL,
    "purity_karat" "GoldPurity" NOT NULL,
    "pure_gold_weight" DECIMAL(10,3) NOT NULL,
    "max_eligible_loan" DECIMAL(14,2) NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'SUBMITTED',
    "selected_plan_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_mobile_number_created_at_idx" ON "leads"("mobile_number", "created_at");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_selected_plan_id_fkey" FOREIGN KEY ("selected_plan_id") REFERENCES "loan_schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
