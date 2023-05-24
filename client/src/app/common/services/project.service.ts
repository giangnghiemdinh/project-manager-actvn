import { Injectable } from '@angular/core';
import { PaginationPayload, PaginationResponse, Project, ProjectImportPayload, ProjectProgress } from '../models';
import { Observable } from 'rxjs';
import { ProjectProgressType, ProjectStatus } from '../constants';
import { AbstractService } from '../abstracts';

@Injectable({
    providedIn: 'root'
})
export class ProjectService extends AbstractService {
    getProjects(params: PaginationPayload) {
        return this.get<PaginationResponse<Project>>('project', { params });
    }

    getProject(id: number, extra: string = '') {
        return this.get<Project>(`project/${ id }`, { params: { extra } });
    }

    createProject(payload: Project) {
        return this.post<Project>('project', { payload });
    }

    approveProject(payload: { id: number, status: ProjectStatus, reason: string }) {
        return this.post<Project>('project/approve', { payload });
    }

    updateProject(payload: Project): Observable<Project> {
        return this.put<Project>(`project/${ payload.id }`, { payload });
    }

    deleteProject(id: number) {
        return this.delete<void>(`project/${ id }`);
    }

    import(payload: ProjectImportPayload) {
        return this.post<void>(`project/import`, { payload });
    }

    report(id: number, payload: any) {
        return this.post<ProjectProgress>(`project/${ id }/report`, payload);
    }

    review(payload: any) {
        return this.post<ProjectProgress>(`project/${ payload.id }/review`, payload);
    }

    councilReview(payload: any) {
        return this.post<ProjectProgress>(`project/${ payload.id }/council-review`, payload);
    }

    getReport(payload: { id: number, type: ProjectProgressType }) {
        return this.get<ProjectProgress>(`project/${ payload.id }/${ payload.type }`);
    }
}
