/*
  Warnings:

  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Team";

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "minecraft_name" TEXT NOT NULL,
    "discord_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);
