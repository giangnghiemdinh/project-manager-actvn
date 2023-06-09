import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { PaginationPayload, PaginationResponse, Student, StudentImport } from '../models';

@Injectable({
    providedIn: 'root'
})
export class StudentService extends AbstractService {
    getStudents(params: PaginationPayload) {
        return this.get<PaginationResponse<Student>>('student', { params });
    }

    getStudent(id: number) {
        return this.get<Student>(`student/${ id }`);
    }

    createStudent(payload: Student) {
        return this.post<Student>('student', { payload });
    }

    updateStudent(payload: Student) {
        return this.put<Student>(`student/${ payload.id }`, { payload });
    }

    deleteStudent(id: number) {
        return this.delete<void>(`student/${ id }`);
    }

    importStudent(payload: StudentImport) {
        return this.post<void>(`student/import`, { payload });
    }
}
