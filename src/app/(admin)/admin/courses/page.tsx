import { getCourses, getDepartments } from "@/actions/admin/course-actions";
import { getAllProfessors } from "@/actions/admin/professor-actions";
import CourseClient from "@/components/admin/courses/CourseClient";

export default async function AdminCoursesPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";

    const { courses, pagination } = await getCourses(page, 10, search);
    const departments = await getDepartments();
    const professors = await getAllProfessors();

    return (
        <CourseClient
            initialCourses={courses}
            departments={departments}
            professors={professors}
            pagination={pagination}
        />
    );
}
