-- AlterTable Campaign
ALTER TABLE "Campaign" ADD COLUMN "subheadline" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerImage" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "theme" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "announcementText" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "announcementLink" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "conditionsText" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "showCountdown" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Campaign" ADD COLUMN "landingEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Campaign" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "seoDescription" TEXT;

-- CreateTable HomeSection
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeSection_campaignId_idx" ON "HomeSection"("campaignId");

-- CreateIndex
CREATE INDEX "HomeSection_enabled_order_idx" ON "HomeSection"("enabled", "order");

-- AddForeignKey
ALTER TABLE "HomeSection" ADD CONSTRAINT "HomeSection_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
