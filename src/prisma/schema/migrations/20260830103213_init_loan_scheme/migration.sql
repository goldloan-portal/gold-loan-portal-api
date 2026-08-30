-- CreateTable
CREATE TABLE "loan_schemes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "max_ltv" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loan_schemes_name_key" ON "loan_schemes"("name");
