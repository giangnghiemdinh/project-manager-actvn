import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { ManagerStaff, PaginationPayload, PaginationResponse } from '../../../common/models';

@Injectable({
    providedIn: 'root'
})
export class ManagerStaffService extends AbstractService {
    getManagerStaffs(payload: PaginationPayload) {
        return this.get<PaginationResponse<ManagerStaff>>('manager-staff', { payload });
    }

    getManagerStaff(id: number) {
        return this.get<ManagerStaff>(`manager-staff/${ id }`);
    }

    createManagerStaff(payload: ManagerStaff) {
        return this.post<ManagerStaff>('manager-staff', { payload });
    }

    createMultipleManagerStaff(payload: ManagerStaff[]) {
        return this.post<ManagerStaff>('manager-staff/multiple', { payload });
    }

    updateManagerStaff(payload: ManagerStaff) {
        return this.put<ManagerStaff>(`manager-staff/${ payload.id }`, { payload });
    }

    deleteManagerStaff(id: number) {
        return this.delete<void>(`manager-staff/${ id }`);
    }
}
