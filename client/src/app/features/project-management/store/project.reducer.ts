import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Project } from '../../../common/models';
import { ProjectActions } from './project.actions';
import { ProjectProgress } from '../../../common/models/project-progress.model';
import { ProjectProgressType } from '../../../common/constants/project.constant';

export interface ProjectState extends AbstractState {
    projects: Project[],
    pagination: MetaPagination | null,
    project: Project | null,
    report: ProjectProgress | null,
    isVisible: boolean;
    isVisibleImport: boolean;
    isVisibleReport: boolean;
    isVisibleReview: boolean;
    isVisibleCouncilReview: boolean
}

export const initialState: ProjectState = {
    projects: [],
    pagination: null,
    project: null,
    report: null,
    isVisible: false,
    isVisibleImport: false,
    isVisibleReport: false,
    isVisibleReview: false,
    isVisibleCouncilReview: false,
    isLoading: false,
    errors: null
};

export const projectFeature = createFeature({
    name: 'project',
    reducer: createReducer(
        initialState,

        on(ProjectActions.updateVisible, (state, { isVisible, modal }) => {
            const newState = {...state};
            switch (modal) {
                case 'import':
                    newState.isVisibleImport = isVisible;
                    break;
                case 'report':
                    newState.isVisibleReport = isVisible;
                    break;
                case 'review':
                    newState.isVisibleReview = isVisible;
                    break;
                case 'council':
                    newState.isVisibleCouncilReview = isVisible;
                    break;
                default:
                    newState.isVisible = isVisible;
                    newState.project = isVisible ? null : state.project;
                    break;
            }
            return newState;
        }),

        on(ProjectActions.loadProjects, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.loadProjectsSuccess, (state, { response }) => ({
            ...state,
            projects: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(ProjectActions.loadProjectsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.loadProject, (state) => ({
            ...state,
            project: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(ProjectActions.loadProjectSuccess, (state, { response, modal }) => ({
            ...state,
            project: response,
            errors: null,
            isVisible: modal === 'form',
            isVisibleCouncilReview: modal === 'council',
            isLoading: false,
        })),

        on(ProjectActions.loadProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.loadReport, (state) => ({
            ...state,
            report: null,
            isVisibleReport: false,
            isLoading: true,
        })),

        on(ProjectActions.loadReportSuccess, (state, { response }) => ({
            ...state,
            report: response,
            errors: null,
            isVisibleReport: ![
                ProjectProgressType.INSTRUCTOR_REVIEW,
                ProjectProgressType.REVIEWER_REVIEW
            ].includes(response.type!),
            isVisibleReview: [
                ProjectProgressType.INSTRUCTOR_REVIEW,
                ProjectProgressType.REVIEWER_REVIEW
            ].includes(response.type!),
            isLoading: false,
        })),

        on(ProjectActions.loadReportFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.createProject, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.createProjectSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ProjectActions.createProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.updateProject, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.updateProjectSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ProjectActions.updateProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.deleteProject, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.deleteProjectSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ProjectActions.deleteProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.report, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.reportSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisibleReport: false,
            isLoading: false,
        })),

        on(ProjectActions.reportFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.review, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.reviewSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisibleReview: false,
            isLoading: false,
        })),

        on(ProjectActions.reviewFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.deleteFile, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.deleteFileSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ProjectActions.deleteFileFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.importProject, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.importProjectSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
            isVisibleImport: false,
        })),

        on(ProjectActions.importProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ProjectActions.councilReview, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ProjectActions.councilReviewSuccess, (state) => ({
            ...state,
            errors: null,
            isVisibleCouncilReview: false,
            isLoading: false,
        })),

        on(ProjectActions.councilReviewFailure, (state, { errors }) => ({
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
    selectReport,
    selectIsVisible,
    selectIsVisibleImport,
    selectIsVisibleReport,
    selectIsVisibleReview,
    selectIsVisibleCouncilReview,
    selectIsLoading,
    selectErrors,
} = projectFeature;
