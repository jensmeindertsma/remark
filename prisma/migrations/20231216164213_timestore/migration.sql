/*
  Warnings:

  - Added the required column `created` to the `Remark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `edited` to the `Remark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Remark" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "edited" TIMESTAMP(3) NOT NULL;
