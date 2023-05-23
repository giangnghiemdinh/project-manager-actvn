export interface ProjectImportPayload {
    semesterId: number;
    departmentId: number;
    duplicateName: number;
    studentNotExist: number;
    instrNotExist: number;
    projects: {
        name: string,
        description: string,
        requirement: string,
        instructor: string
    }[],
}
