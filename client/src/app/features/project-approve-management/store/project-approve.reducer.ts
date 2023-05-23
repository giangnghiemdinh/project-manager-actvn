import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Project } from '../../../common/models';
import * as projectApproveActions from './project-approve.actions';

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

    on(projectApproveActions.updateVisible, (state, { isVisible }) => ({
      ...state,
      isVisible,
      project: isVisible ? null : state.project,
    })),

    on(projectApproveActions.loadProjects, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(projectApproveActions.loadProjectsSuccess, (state, { response }) => ({
      ...state,
      projects: response.data,
      pagination: response.meta,
      errors: null,
      isLoading: false,
    })),

    on(projectApproveActions.loadProjectsFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(projectApproveActions.loadProject, (state) => ({
      ...state,
      project: null,
      errors: null,
      isVisible: false,
      isLoading: true,
    })),

    on(projectApproveActions.loadProjectSuccess, (state, { response }) => ({
      ...state,
      project: response,
      errors: null,
      isVisible: true,
      isLoading: false,
    })),

    on(projectApproveActions.loadProjectFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(projectApproveActions.approveProject, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(projectApproveActions.approveProjectSuccess, (state, { response }) => ({
      ...state,
      errors: null,
      isVisible: false,
      isLoading: false,
    })),

    on(projectApproveActions.approveProjectFailure, (state, { errors }) => ({
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
