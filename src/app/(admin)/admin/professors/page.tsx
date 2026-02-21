import { getProfessors } from "@/actions/admin/professor-actions";
import { getDepartments } from "@/actions/admin/course-actions"; // Reuse getDepartments
import ProfessorClient from "@/components/admin/professors/ProfessorClient";

export default async function AdminProfessorsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";

    const { professors, pagination } = await getProfessors(page, 10, search);
    const departments = await getDepartments();

    return (
        <ProfessorClient
            initialProfessors={professors}
            departments={departments}
            pagination={pagination}
        />
    );
}
