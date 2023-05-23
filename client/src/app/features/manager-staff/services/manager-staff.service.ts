import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { ManagerStaff, PaginationPayload, PaginationResponse } from '../../../common/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ManagerStaffService extends AbstractService {
    getManagerStaffs(payload: PaginationPayload): Observable<PaginationResponse<ManagerStaff>> {
        return this.get('manager-staff', {...payload});
    }

    getManagerStaff(id: number): Observable<ManagerStaff> {
        return this.get(`manager-staff/${id}`);
    }

    createManagerStaff(payload: ManagerStaff): Observable<ManagerStaff> {
        return this.post('manager-staff', payload);
    }

    createMultipleManagerStaff(payload: ManagerStaff[]): Observable<ManagerStaff> {
        return this.post('manager-staff/multiple', payload);
    }

    updateManagerStaff(payload: ManagerStaff): Observable<ManagerStaff> {
        return this.put(`manager-staff/${payload.id}`, payload);
    }

    deleteManagerStaff(id: number): Observable<void> {
        return this.delete(`manager-staff/${id}`);
    }
}
