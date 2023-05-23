import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Observable } from 'rxjs';
import { Semester } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SemesterService extends AbstractService {
  getSemesters(): Observable<Semester[]> {
    return this.get('semester');
  }

  getSemester(id: number): Observable<Semester> {
    return this.get(`semester/${id}`);
  }

  createSemester(payload: Semester): Observable<Semester> {
    return this.post('semester', payload);
  }

  updateSemester(payload: Semester): Observable<Semester> {
    return this.put(`semester/${payload.id}`, payload);
  }
}
