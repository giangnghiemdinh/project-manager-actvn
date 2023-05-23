import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Department } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends AbstractService {
  getDepartments(): Observable<Department[]> {
    return this.get('department');
  }

  getDepartment(id: number): Observable<Department> {
    return this.get(`department/${id}`);
  }

  createDepartment(payload: Department): Observable<Department> {
    return this.post('department', payload);
  }

  updateDepartment(payload: Department): Observable<Department> {
    return this.put(`department/${payload.id}`, payload);
  }
}
