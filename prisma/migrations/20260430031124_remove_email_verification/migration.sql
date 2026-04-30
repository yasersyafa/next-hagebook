-- DropTable
DROP TABLE "EmailVerificationToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerifiedAt";
