import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Department } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends AbstractService {
    getDepartments() {
        return this.get<Department[]>('department');
    }

    getDepartment(id: number) {
        return this.get<Department>(`department/${ id }`);
    }

    createDepartment(payload: Department) {
        return this.post<Department>('department', { payload });
    }

    updateDepartment(payload: Department) {
        return this.put<Department>(`department/${ payload.id }`, { payload });
    }
}
