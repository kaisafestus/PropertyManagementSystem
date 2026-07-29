/*
  Warnings:

  - The values [ADMIN,APPLICANT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Applicant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "public"."UserStatus" ADD VALUE 'INVITED';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- DropForeignKey
ALTER TABLE "public"."Applicant" DROP CONSTRAINT "Applicant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ApplicationDocument" DROP CONSTRAINT "ApplicationDocument_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ApplicationStatusHistory" DROP CONSTRAINT "ApplicationStatusHistory_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RentalApplication" DROP CONSTRAINT "RentalApplication_applicantId_fkey";

-- DropTable
DROP TABLE "public"."Applicant";

-- DropTable
DROP TABLE "public"."ApplicationDocument";

-- DropTable
DROP TABLE "public"."ApplicationStatusHistory";

-- DropTable
DROP TABLE "public"."PermissionGroup";

-- DropTable
DROP TABLE "public"."RentalApplication";

-- DropEnum
DROP TYPE "public"."ApplicationStatus";

-- AlterEnum: Rename old type, create new type with only LANDLORD/TENANT/VENDOR
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
CREATE TYPE "public"."UserRole" AS ENUM ('LANDLORD', 'TENANT', 'VENDOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole" USING ("role"::text::"public"."UserRole");
DROP TYPE "public"."UserRole_old";

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "public"."Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_organizationId_key" ON "public"."Invitation"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
