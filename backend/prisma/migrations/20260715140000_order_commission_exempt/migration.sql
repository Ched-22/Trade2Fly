-- AlterTable
ALTER TABLE "Order" ADD COLUMN "commissionExempt" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: first completed sale per seller is commission-exempt
UPDATE "Order" o
SET "commissionExempt" = true
FROM (
  SELECT DISTINCT ON (l."sellerId") o2.id AS id
  FROM "Order" o2
  INNER JOIN "Listing" l ON l.id = o2."listingId"
  WHERE o2.status = 'completed'
  ORDER BY l."sellerId", o2."completedAt" ASC NULLS LAST, o2.id ASC
) AS first_sale
WHERE o.id = first_sale.id;
