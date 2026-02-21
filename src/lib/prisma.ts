import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getTestSafeDatabaseUrl() {
  if (process.env.NODE_ENV !== "test") {
    return undefined;
  }

  // Mümkünse pooler yerine doğrudan DB bağlantısını kullan.
  const directUrl = process.env.DIRECT_URL;
  if (directUrl) {
    return directUrl;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return undefined;
  }

  const [base, query = ""] = databaseUrl.split("?");
  const params = new URLSearchParams(query);

  // Testlerde bağlantı tüketimini minimize et.
  if (!params.has("connection_limit")) {
    params.set("connection_limit", "1");
  }

  const serializedParams = params.toString();
  return serializedParams ? `${base}?${serializedParams}` : base;
}

const testSafeDatabaseUrl = getTestSafeDatabaseUrl();
const prismaClientOptions = testSafeDatabaseUrl
  ? {
      datasources: {
        db: {
          url: testSafeDatabaseUrl,
        },
      },
    }
  : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
