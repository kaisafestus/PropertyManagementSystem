-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('PROPERTY', 'TENANT', 'LEASE', 'VENDOR', 'INVOICE', 'RECEIPT', 'MAINTENANCE', 'INSURANCE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "public"."DocumentCategory" NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "description" TEXT,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_entityId_idx" ON "public"."Document"("entityId");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "public"."Document"("category");

-- CreateIndex
CREATE INDEX "Document_uploadedBy_idx" ON "public"."Document"("uploadedBy");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
