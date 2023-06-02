import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Project } from '../../../common/models';
import { ProjectApproveActions } from './project-approve.actions';

export interface ProjectApproveState extends AbstractState {
  projects: Project[],
  pagination: MetaPagination | null,
  project: Project | null,
  isVisible: boolean;
}

export const initialState: ProjectApproveState = {
  projects: [],
  pagination: null,
  project: null,
  isVisible: false,
  isLoading: false,
  errors: null
};

export const projectApproveFeature = createFeature({
  name: 'project-approve',
  reducer: createReducer(
    initialState,

    on(ProjectApproveActions.updateVisible, (state, { isVisible }) => ({
      ...state,
      isVisible,
      project: isVisible ? null : state.project,
    })),

    on(ProjectApproveActions.loadProjects, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(ProjectApproveActions.loadProjectsSuccess, (state, { response }) => ({
      ...state,
      projects: response.data,
      pagination: response.meta,
      errors: null,
      isLoading: false,
    })),

    on(ProjectApproveActions.loadProjectsFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(ProjectApproveActions.loadProject, (state) => ({
      ...state,
      project: null,
      errors: null,
      isVisible: false,
      isLoading: true,
    })),

    on(ProjectApproveActions.loadProjectSuccess, (state, { response }) => ({
      ...state,
      project: response,
      errors: null,
      isVisible: true,
      isLoading: false,
    })),

    on(ProjectApproveActions.loadProjectFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(ProjectApproveActions.approveProject, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(ProjectApproveActions.approveProjectSuccess, (state, { response }) => ({
      ...state,
      errors: null,
      isVisible: false,
      isLoading: false,
    })),

    on(ProjectApproveActions.approveProjectFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),
  )
});

export const {
  selectProjects,
  selectPagination,
  selectProject,
  selectIsVisible,
  selectIsLoading,
  selectErrors,
} = projectApproveFeature;
