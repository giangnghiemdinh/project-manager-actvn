import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { ExaminerCouncil, PaginationPayload, PaginationResponse } from '../../../common/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExaminerCouncilService extends AbstractService {
  getExaminerCouncils(payload: PaginationPayload): Observable<PaginationResponse<ExaminerCouncil>> {
    return this.get('examiner-council', {...payload});
  }

  getExaminerCouncil(id: number): Observable<ExaminerCouncil> {
    return this.get(`examiner-council/${id}`);
  }

  createExaminerCouncil(payload: ExaminerCouncil): Observable<ExaminerCouncil> {
    return this.post('examiner-council', payload);
  }

  createMultipleExaminerCouncil(payload: ExaminerCouncil[]): Observable<ExaminerCouncil> {
    return this.post('examiner-council/multiple', payload);
  }

  updateExaminerCouncil(payload: ExaminerCouncil): Observable<ExaminerCouncil> {
    return this.put(`examiner-council/${payload.id}`, payload);
  }

  deleteExaminerCouncil(id: number): Observable<void> {
    return this.delete(`examiner-council/${id}`);
  }
}
