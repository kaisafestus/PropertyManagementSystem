/*
  Warnings:

  - You are about to drop the `Lease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaseDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaseHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaseStatusHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "public"."Lease" DROP CONSTRAINT "Lease_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeaseDocument" DROP CONSTRAINT "LeaseDocument_leaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeaseHistory" DROP CONSTRAINT "LeaseHistory_leaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeaseStatusHistory" DROP CONSTRAINT "LeaseStatusHistory_leaseId_fkey";

-- DropTable
DROP TABLE "public"."Lease";

-- DropTable
DROP TABLE "public"."LeaseDocument";

-- DropTable
DROP TABLE "public"."LeaseHistory";

-- DropTable
DROP TABLE "public"."LeaseStatusHistory";

-- DropEnum
DROP TYPE "public"."LeaseStatus";

-- CreateTable
CREATE TABLE "public"."ApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."RentalApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."RentalApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
