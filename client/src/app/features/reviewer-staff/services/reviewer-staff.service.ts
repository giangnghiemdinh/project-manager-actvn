import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { PaginationPayload, PaginationResponse, ReviewerStaff } from '../../../common/models';

@Injectable({
    providedIn: 'root'
})
export class ReviewerStaffService extends AbstractService {
    getReviewerStaffs(params: PaginationPayload) {
        return this.get<PaginationResponse<ReviewerStaff>>('reviewer-staff', { params });
    }

    getReviewerStaff(id: number) {
        return this.get<ReviewerStaff>(`reviewer-staff/${ id }`);
    }

    createReviewerStaff(payload: ReviewerStaff) {
        return this.post<ReviewerStaff>('reviewer-staff', { payload });
    }

    createMultipleReviewerStaff(payload: ReviewerStaff[]) {
        return this.post<ReviewerStaff>('reviewer-staff/multiple', { payload });
    }

    updateReviewerStaff(payload: ReviewerStaff) {
        return this.put<ReviewerStaff>(`reviewer-staff/${ payload.id }`, { payload });
    }

    deleteReviewerStaff(id: number) {
        return this.delete<void>(`reviewer-staff/${ id }`);
    }
}
