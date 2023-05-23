import { createAction, props } from '@ngrx/store';
import { PaginationResponse, Project } from '../../../common/models';
import { ProjectStatus } from '../../../common/constants/project.constant';

export const updateVisible = createAction(
  '[Project Approve] Update Visible',
  props<{ isVisible: boolean }>()
);

export const loadProjects = createAction(
  '[Project Approve] Load Projects',
);

export const loadProjectsSuccess = createAction(
  '[Project Approve/API] Load Projects Success',
  props<{ response: PaginationResponse<Project> }>()
);

export const loadProjectsFailure = createAction(
  '[Project Approve/API] Load Projects Failure',
  props<{ errors: any }>()
);

export const loadProject = createAction(
  '[Project Approve] Load Project',
  props<{ payload: { id: number } }>()
);

export const loadProjectSuccess = createAction(
  '[Project Approve/API] Load Project Success',
  props<{ response: Project }>()
);

export const loadProjectFailure = createAction(
  '[Project Approve/API] Load Project Failure',
  props<{ errors: any }>()
);

export const approveProject = createAction(
  '[Project Approve] Approve Project',
  props<{ payload: { id: number, status: ProjectStatus, reason: string } }>()
);

export const approveProjectSuccess = createAction(
  '[Project Approve/API] Approve Project Success',
  props<{ response: Project }>()
);

export const approveProjectFailure = createAction(
  '[Project Approve/API] Approve Project Failure',
  props<{ errors: any }>()
);
