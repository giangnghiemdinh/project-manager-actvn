import { Injectable } from '@angular/core';
import { AbstractService } from '../../../common/abstracts';
import { PaginationPayload, PaginationResponse, Progress } from '../../../common/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProgressService extends AbstractService {
    getProgresses(payload: PaginationPayload) {
        return this.get<PaginationResponse<Progress>>('progress', { payload });
    }

    getProgress(id: number) {
        return this.get<Progress>(`progress/${ id }`);
    }

    createProgress(payload: Progress) {
        return this.post<Progress>('progress', { payload });
    }

    updateProgress(payload: Progress) {
        return this.put<Progress>(`progress/${ payload.id }`, { payload });
    }

    deleteProgress(id: number): Observable<void> {
        return this.delete(`progress/${ id }`);
    }
}
