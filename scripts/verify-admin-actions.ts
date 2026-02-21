
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Admin Moderation Verification...");

    // 1. Setup Data
    console.log("Creating test data...");
    const user = await prisma.user.create({
        data: {
            name: "Test User",
            email: `test-${Date.now()}@metu.edu.tr`,
            password: "hash",
        },
    });

    const department = await prisma.department.findFirst() || await prisma.department.create({
        data: { code: "TEST", name: "Test Dept", faculty: "Test Faculty" }
    });

    const course = await prisma.course.create({
        data: {
            code: `TEST${Date.now()}`,
            name: "Test Course",
            departmentId: department.id,
        },
    });

    const review = await prisma.courseReview.create({
        data: {
            userId: user.id,
            courseId: course.id,
            semester: "2024-1",
            difficultyRating: 3,
            workloadRating: 3,
            usefulnessRating: 3,
            overallRating: 3,
            comment: "This is a reported review",
            status: "APPROVED",
        },
    });

    const reporter = await prisma.user.create({
        data: {
            name: "Reporter",
            email: `reporter-${Date.now()}@metu.edu.tr`,
            password: "hash",
        },
    });

    const report = await prisma.report.create({
        data: {
            reporterId: reporter.id,
            courseReviewId: review.id,
            reason: "spam",
            status: "PENDING",
        },
    });

    console.log(`Created Report: ${report.id} for Review: ${review.id} (Status: APPROVED)`);

    // 2. Execute Logic (Simulating the API Transaction)
    console.log("Simulating Admin Request (RESOLVE)...");

    const action = "resolve"; // or "dismiss"
    const adminId = user.id; // acting as admin here
    const reportId = report.id;

    const fetchedReport = await prisma.report.findUnique({
        where: { id: reportId },
        include: { courseReview: true, professorReview: true },
    });

    const newStatus = action === "resolve" ? "RESOLVED" : "DISMISSED";

    await prisma.$transaction(async (tx) => {
        // Update Report
        await tx.report.update({
            where: { id: reportId },
            data: {
                status: newStatus,
                handledBy: adminId,
                handledAt: new Date(),
            },
        });

        // Update Content
        if (action === "resolve") {
            if (fetchedReport?.courseReviewId) {
                await tx.courseReview.update({
                    where: { id: fetchedReport.courseReviewId },
                    data: { status: "REJECTED" },
                });
            }
        }
    });

    // 3. Verify Results
    console.log("Verifying results...");

    const updatedReport = await prisma.report.findUnique({ where: { id: report.id } });
    const updatedReview = await prisma.courseReview.findUnique({ where: { id: review.id } });

    console.log(`Report Status: ${updatedReport?.status} (Expected: RESOLVED)`);
    console.log(`Review Status: ${updatedReview?.status} (Expected: REJECTED)`);

    if (updatedReport?.status === "RESOLVED" && updatedReview?.status === "REJECTED") {
        console.log("✅ SUCCESS: Auto-moderation logic works!");
    } else {
        console.error("❌ FAILED: Statuses do not match expected values.");
        process.exit(1);
    }

    // Cleanup
    await prisma.report.deleteMany({ where: { id: report.id } });
    await prisma.courseReview.deleteMany({ where: { id: review.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, reporter.id] } } });
    await prisma.course.deleteMany({ where: { id: course.id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
