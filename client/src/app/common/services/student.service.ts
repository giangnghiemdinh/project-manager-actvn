import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { PaginationPayload, PaginationResponse, Student } from '../models';

@Injectable({
    providedIn: 'root'
})
export class StudentService extends AbstractService {
    getStudents(payload: PaginationPayload) {
        return this.get<PaginationResponse<Student>>('student', { payload });
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
}
