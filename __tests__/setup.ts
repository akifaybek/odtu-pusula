import prisma from "@/lib/prisma";

// Global test setup
beforeAll(async () => {
  // Veritabanı bağlantısını kontrol et
  try {
    await prisma.$connect();
    console.log("✓ Test database connected");
  } catch (error) {
    console.error("✗ Failed to connect to test database:", error);
    throw error;
  }
});

afterAll(async () => {
  // Bağlantıyı kapat
  await prisma.$disconnect();
});

// Global error handler for unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
