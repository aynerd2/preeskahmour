-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY');

-- CreateEnum
CREATE TYPE "FabricFamily" AS ENUM ('ANKARA', 'ASO_OKE', 'ADIRE', 'AKWETE', 'GEORGE', 'KENTE', 'WOOL', 'LINEN', 'SATIN');

-- CreateEnum
CREATE TYPE "FabricWeight" AS ENUM ('LIGHT', 'MID', 'HEAVY');

-- CreateEnum
CREATE TYPE "DesignOptionCategory" AS ENUM ('LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM');

-- CreateEnum
CREATE TYPE "FitPreference" AS ENUM ('REGULAR', 'SLIM', 'RELAXED', 'MATERNITY');

-- CreateEnum
CREATE TYPE "MeasurementSource" AS ENUM ('MANUAL', 'ESTIMATED', 'ATELIER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'IN_ATELIER', 'CUTTING', 'STITCHING', 'FINISHING', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProviderKind" AS ENUM ('PAYSTACK', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "postcode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'My measurements',
    "source" "MeasurementSource" NOT NULL DEFAULT 'MANUAL',
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "fitPreference" "FitPreference" NOT NULL DEFAULT 'REGULAR',
    "braBandCm" DOUBLE PRECISION,
    "torsoLength" TEXT,
    "shoulderSlope" TEXT,
    "bustCm" DOUBLE PRECISION,
    "underbustCm" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipCm" DOUBLE PRECISION,
    "shoulderCm" DOUBLE PRECISION,
    "backWidthCm" DOUBLE PRECISION,
    "jacketLengthCm" DOUBLE PRECISION,
    "sleeveLengthCm" DOUBLE PRECISION,
    "bicepCm" DOUBLE PRECISION,
    "wristCm" DOUBLE PRECISION,
    "neckCm" DOUBLE PRECISION,
    "inseamCm" DOUBLE PRECISION,
    "outseamCm" DOUBLE PRECISION,
    "thighCm" DOUBLE PRECISION,
    "kneeCm" DOUBLE PRECISION,
    "ankleCm" DOUBLE PRECISION,
    "skirtLengthCm" DOUBLE PRECISION,
    "pregnancyWeeks" INTEGER,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "family" "FabricFamily" NOT NULL,
    "weight" "FabricWeight" NOT NULL DEFAULT 'MID',
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#0B4D3F',
    "colorTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "swatchImage" TEXT,
    "textureImage" TEXT,
    "detailImage" TEXT,
    "pricePerMeterKobo" INTEGER NOT NULL,
    "composition" TEXT,
    "gsm" INTEGER,
    "widthCm" INTEGER,
    "origin" TEXT,
    "artisanNote" TEXT,
    "occasions" "Occasion"[] DEFAULT ARRAY[]::"Occasion"[],
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseStyle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "basePriceKobo" INTEGER NOT NULL,
    "yardageMeters" DOUBLE PRECISION NOT NULL DEFAULT 3.2,
    "thumbnailImage" TEXT,
    "previewMaskUrl" TEXT,
    "previewShadingUrl" TEXT,
    "occasions" "Occasion"[] DEFAULT ARRAY[]::"Occasion"[],
    "supportedFits" "FitPreference"[] DEFAULT ARRAY['REGULAR', 'SLIM', 'RELAXED']::"FitPreference"[],
    "optionCategories" "DesignOptionCategory"[] DEFAULT ARRAY[]::"DesignOptionCategory"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignOption" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DesignOptionCategory" NOT NULL,
    "description" TEXT,
    "priceModifierKobo" INTEGER NOT NULL DEFAULT 0,
    "iconUrl" TEXT,
    "overlayUrl" TEXT,
    "colorHex" TEXT,
    "zIndex" INTEGER NOT NULL DEFAULT 10,
    "baseStyleId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "season" TEXT,
    "heroImage" TEXT,
    "tileImage" TEXT,
    "occasion" "Occasion",
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "storyNote" TEXT,
    "priceKobo" INTEGER NOT NULL,
    "compareAtKobo" INTEGER,
    "occasion" "Occasion" NOT NULL,
    "silhouette" TEXT NOT NULL,
    "baseStyleId" TEXT,
    "fabricId" TEXT,
    "collectionId" TEXT,
    "isMadeToMeasure" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 21,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "briefNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDesign" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Untitled design',
    "baseStyleId" TEXT NOT NULL,
    "fabricId" TEXT NOT NULL,
    "fit" "FitPreference" NOT NULL DEFAULT 'REGULAR',
    "measurementProfileId" TEXT,
    "monogram" TEXT,
    "notes" TEXT,
    "totalPriceKobo" INTEGER NOT NULL DEFAULT 0,
    "snapshot" JSONB,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDesignOption" (
    "id" TEXT NOT NULL,
    "customDesignId" TEXT NOT NULL,
    "designOptionId" TEXT NOT NULL,

    CONSTRAINT "CustomDesignOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "addressId" TEXT,
    "shipFullName" TEXT NOT NULL,
    "shipLine1" TEXT NOT NULL,
    "shipLine2" TEXT,
    "shipCity" TEXT NOT NULL,
    "shipState" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL DEFAULT 'Nigeria',
    "shipPostcode" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "subtotalKobo" INTEGER NOT NULL,
    "shippingKobo" INTEGER NOT NULL DEFAULT 0,
    "discountKobo" INTEGER NOT NULL DEFAULT 0,
    "totalKobo" INTEGER NOT NULL,
    "paymentProvider" "PaymentProviderKind",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "paymentRaw" JSONB,
    "paidAt" TIMESTAMP(3),
    "atelierNotes" TEXT,
    "customerNote" TEXT,
    "trackingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "customDesignId" TEXT,
    "name" TEXT NOT NULL,
    "descriptor" TEXT,
    "imageUrl" TEXT,
    "unitPriceKobo" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalKobo" INTEGER NOT NULL,
    "measurementSnapshot" JSONB,
    "designSnapshot" JSONB,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverAlt" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Journal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorName" TEXT NOT NULL DEFAULT 'Prisca Ogunlade',
    "readMinutes" INTEGER NOT NULL DEFAULT 4,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookbookImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "briefNote" TEXT,
    "collectionId" TEXT,
    "season" TEXT,
    "occasion" "Occasion",
    "spanHint" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookbookImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "location" TEXT,
    "imageUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeTile" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT NOT NULL,
    "imageUrl" TEXT,
    "briefNote" TEXT,
    "occasion" "Occasion",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'General',
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "B2BEnquiry" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "industry" TEXT,
    "headcount" INTEGER,
    "garmentTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "neededBy" TIMESTAMP(3),
    "budgetNote" TEXT,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "B2BEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "topic" TEXT NOT NULL DEFAULT 'General',
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "MeasurementProfile_userId_idx" ON "MeasurementProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Fabric_slug_key" ON "Fabric"("slug");

-- CreateIndex
CREATE INDEX "Fabric_family_idx" ON "Fabric"("family");

-- CreateIndex
CREATE INDEX "Fabric_inStock_isFeatured_idx" ON "Fabric"("inStock", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "BaseStyle_slug_key" ON "BaseStyle"("slug");

-- CreateIndex
CREATE INDEX "BaseStyle_isActive_idx" ON "BaseStyle"("isActive");

-- CreateIndex
CREATE INDEX "DesignOption_category_isActive_idx" ON "DesignOption"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DesignOption_slug_baseStyleId_key" ON "DesignOption"("slug", "baseStyleId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_isActive_isFeatured_idx" ON "Collection"("isActive", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_isActive_occasion_idx" ON "Product"("isActive", "occasion");

-- CreateIndex
CREATE INDEX "Product_collectionId_idx" ON "Product"("collectionId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "CustomDesign_userId_isDraft_idx" ON "CustomDesign"("userId", "isDraft");

-- CreateIndex
CREATE INDEX "CustomDesignOption_customDesignId_idx" ON "CustomDesignOption"("customDesignId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDesignOption_customDesignId_designOptionId_key" ON "CustomDesignOption"("customDesignId", "designOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "LookbookImage_isActive_idx" ON "LookbookImage"("isActive");

-- CreateIndex
CREATE INDEX "B2BEnquiry_status_idx" ON "B2BEnquiry"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementProfile" ADD CONSTRAINT "MeasurementProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignOption" ADD CONSTRAINT "DesignOption_baseStyleId_fkey" FOREIGN KEY ("baseStyleId") REFERENCES "BaseStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_baseStyleId_fkey" FOREIGN KEY ("baseStyleId") REFERENCES "BaseStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesign" ADD CONSTRAINT "CustomDesign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesign" ADD CONSTRAINT "CustomDesign_baseStyleId_fkey" FOREIGN KEY ("baseStyleId") REFERENCES "BaseStyle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesign" ADD CONSTRAINT "CustomDesign_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesign" ADD CONSTRAINT "CustomDesign_measurementProfileId_fkey" FOREIGN KEY ("measurementProfileId") REFERENCES "MeasurementProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesignOption" ADD CONSTRAINT "CustomDesignOption_customDesignId_fkey" FOREIGN KEY ("customDesignId") REFERENCES "CustomDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDesignOption" ADD CONSTRAINT "CustomDesignOption_designOptionId_fkey" FOREIGN KEY ("designOptionId") REFERENCES "DesignOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_customDesignId_fkey" FOREIGN KEY ("customDesignId") REFERENCES "CustomDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookbookImage" ADD CONSTRAINT "LookbookImage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

