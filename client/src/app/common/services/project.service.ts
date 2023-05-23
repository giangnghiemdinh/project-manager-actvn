import { inject, Injectable } from '@angular/core';
import { PaginationPayload, PaginationResponse, ProjectImportPayload } from '../models';
import { Observable } from 'rxjs';
import { Project } from 'src/app/common/models';
import { ProjectProgressType, ProjectStatus } from '../constants/project.constant';
import { HttpClient } from '@angular/common/http';
import { ProjectProgress } from '../models/project-progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  readonly #http = inject(HttpClient);

  getProjects(params: PaginationPayload) {
    return this.#http.get<PaginationResponse<Project>>('project', { params });
  }

  getProject(id: number, extra?: string) {
    return this.#http.get<Project>(`project/${id}`, { params: { extra: extra || '' } });
  }

  createProject(payload: Project) {
    return this.#http.post<Project>('project', payload);
  }

  approveProject(payload: { id: number, status: ProjectStatus, reason: string }) {
    return this.#http.post<Project>('project/approve', payload);
  }

  updateProject(payload: Project): Observable<Project> {
    return this.#http.put<Project>(`project/${payload.id}`, payload);
  }

  deleteProject(id: number) {
    return this.#http.delete<void>(`project/${id}`);
  }

  import(payload: ProjectImportPayload) {
    return this.#http.post<void>(`project/import`, payload);
  }

  report(id: number, payload: any) {
    return this.#http.post<ProjectProgress>(`project/${id}/report`, payload);
  }

  review(payload: any) {
    return this.#http.post<ProjectProgress>(`project/${payload.id}/review`, payload);
  }

  councilReview(payload: any) {
    return this.#http.post<ProjectProgress>(`project/${payload.id}/council-review`, payload);
  }

  getReport(payload: { id: number, type: ProjectProgressType }) {
    return this.#http.get<ProjectProgress>(`project/${payload.id}/${payload.type}`);
  }
}
