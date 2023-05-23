import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Observable } from 'rxjs';
import { PaginationPayload, PaginationResponse, Student } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends AbstractService {
  getStudents(payload: PaginationPayload): Observable<PaginationResponse<Student>> {
    return this.get('student', {...payload});
  }

  getStudent(id: number): Observable<Student> {
    return this.get(`student/${id}`);
  }

  createStudent(payload: Student): Observable<Student> {
    return this.post('student', payload);
  }

  updateStudent(payload: Student): Observable<Student> {
    return this.put(`student/${payload.id}`, payload);
  }

  deleteStudent(id: number): Observable<void> {
    return this.delete(`student/${id}`);
  }
}
