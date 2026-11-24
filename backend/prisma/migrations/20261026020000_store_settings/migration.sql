-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "shippingCost" INTEGER NOT NULL DEFAULT 4500,
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 45000,
    "freePickupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transferDiscountPercent" INTEGER NOT NULL DEFAULT 10,
    "transferDiscountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priceHistoryDays" INTEGER NOT NULL DEFAULT 30,
    "generalTermsText" TEXT,
    "shippingNoticeText" TEXT,
    "bankTransferInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
