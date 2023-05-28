import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Semester } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SemesterService extends AbstractService {
    getSemesters() {
        return this.get<Semester[]>('semester');
    }

    getSemester(id: number) {
        return this.get<Semester>(`semester/${ id }`);
    }

    createSemester(payload: Semester) {
        return this.post<Semester>('semester', { payload });
    }

    updateSemester(payload: Semester) {
        return this.put<Semester>(`semester/${ payload.id }`, { payload });
    }

    deleteSemester(id: number) {
        return this.delete<void>(`semester/${ id }`);
    }

    lockSemester(id: number) {
        return this.post<void>(`semester/${ id }`);
    }
}
