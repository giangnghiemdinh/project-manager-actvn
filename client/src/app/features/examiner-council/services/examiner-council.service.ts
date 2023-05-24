import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { ExaminerCouncil, PaginationPayload, PaginationResponse } from '../../../common/models';

@Injectable({
    providedIn: 'root'
})
export class ExaminerCouncilService extends AbstractService {
    getExaminerCouncils(payload: PaginationPayload) {
        return this.get<PaginationResponse<ExaminerCouncil>>('examiner-council', { payload });
    }

    getExaminerCouncil(id: number) {
        return this.get<ExaminerCouncil>(`examiner-council/${ id }`);
    }

    createExaminerCouncil(payload: ExaminerCouncil) {
        return this.post<ExaminerCouncil>('examiner-council', { payload });
    }

    createMultipleExaminerCouncil(payload: ExaminerCouncil[]) {
        return this.post<ExaminerCouncil>('examiner-council/multiple', { payload });
    }

    updateExaminerCouncil(payload: ExaminerCouncil) {
        return this.put<ExaminerCouncil>(`examiner-council/${ payload.id }`, { payload });
    }

    deleteExaminerCouncil(id: number) {
        return this.delete<void>(`examiner-council/${ id }`);
    }
}
