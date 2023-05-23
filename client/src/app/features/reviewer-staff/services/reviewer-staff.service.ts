import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { PaginationPayload, PaginationResponse, ReviewerStaff } from '../../../common/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReviewerStaffService extends AbstractService {
    getReviewerStaffs(payload: PaginationPayload): Observable<PaginationResponse<ReviewerStaff>> {
        return this.get('reviewer-staff', {...payload});
    }

    getReviewerStaff(id: number): Observable<ReviewerStaff> {
        return this.get(`reviewer-staff/${id}`);
    }

    createReviewerStaff(payload: ReviewerStaff): Observable<ReviewerStaff> {
        return this.post('reviewer-staff', payload);
    }

    createMultipleReviewerStaff(payload: ReviewerStaff[]): Observable<ReviewerStaff> {
        return this.post('reviewer-staff/multiple', payload);
    }

    updateReviewerStaff(payload: ReviewerStaff): Observable<ReviewerStaff> {
        return this.put(`reviewer-staff/${payload.id}`, payload);
    }

    deleteReviewerStaff(id: number): Observable<void> {
        return this.delete(`reviewer-staff/${id}`);
    }
}
