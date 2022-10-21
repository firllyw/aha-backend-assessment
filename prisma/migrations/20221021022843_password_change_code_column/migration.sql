/*
  Warnings:

  - A unique constraint covering the columns `[password_change_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_change_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_password_change_code_key" ON "User"("password_change_code");
