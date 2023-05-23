import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts/service.abstract';
import { PaginationPayload, PaginationResponse, Progress } from '../../../common/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService extends AbstractService {
  getProgresses(payload: PaginationPayload): Observable<PaginationResponse<Progress>> {
    return this.get('progress', {...payload});
  }

  getProgress(id: number): Observable<Progress> {
    return this.get(`progress/${id}`);
  }

  createProgress(payload: Progress): Observable<Progress> {
    return this.post('progress', payload);
  }

  updateProgress(payload: Progress): Observable<Progress> {
    return this.put(`progress/${payload.id}`, payload);
  }

  deleteProgress(id: number): Observable<void> {
    return this.delete(`progress/${id}`);
  }
}
