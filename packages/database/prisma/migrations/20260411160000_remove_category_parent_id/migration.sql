-- RemoveCategoryHierarchy
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";

DROP INDEX IF EXISTS "Category_parentId_idx";

ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";
