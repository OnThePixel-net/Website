/*
  Warnings:

  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Member";

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "minecraft_name" TEXT NOT NULL,
    "discord_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
