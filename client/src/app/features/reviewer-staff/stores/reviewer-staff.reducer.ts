import { createFeature, createReducer, on } from '@ngrx/store';
import { ReviewerStaffActions } from './reviewer-staff.actions';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Project, ReviewerStaff } from '../../../common/models';

export interface ReviewerStaffState extends AbstractState {
    projects: Project[];
    isLoaded: boolean;
    reviewerStaffs: ReviewerStaff[];
    pagination: MetaPagination | null;
    reviewerStaff: ReviewerStaff | null;
    isVisible: boolean;
}

export const initialState: ReviewerStaffState = {
    projects: [],
    isLoaded: false,
    reviewerStaffs: [],
    pagination: null,
    reviewerStaff: null,
    isVisible: false,
    isLoading: false,
    errors: null
};

export const reviewerStaffFeature = createFeature({
    name: 'reviewer-staff',
    reducer: createReducer(
        initialState,

        on(ReviewerStaffActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            reviewerStaff: isVisible ? null : state.reviewerStaff,
        })),

        on(ReviewerStaffActions.loadAllProjects, (state, { response }) => ({
            ...state,
            isLoaded: false,
            projects: response ? [...state.projects, ...response.data] : [],
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.loadAllProjectsSuccess, (state, { response }) => ({
            ...state,
            projects: [...state.projects, ...response.data],
            isLoaded: true,
            errors: null,
            isLoading: false,
        })),

        on(ReviewerStaffActions.loadAllProjectsFailure, (state, { errors }) => ({
            ...state,
            errors,
            projects: [],
            isLoading: false,
        })),

        on(ReviewerStaffActions.loadReviewerStaffs, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.loadReviewerStaffsSuccess, (state, { response }) => ({
            ...state,
            reviewerStaffs: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(ReviewerStaffActions.loadReviewerStaffsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ReviewerStaffActions.loadReviewerStaff, (state) => ({
            ...state,
            reviewerStaff: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(ReviewerStaffActions.loadReviewerStaffSuccess, (state, { response }) => ({
            ...state,
            reviewerStaff: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(ReviewerStaffActions.loadReviewerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ReviewerStaffActions.createReviewerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.createReviewerStaffSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            managerStaff: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ReviewerStaffActions.createReviewerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ReviewerStaffActions.createMultipleReviewerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.createMultipleReviewerStaffSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ReviewerStaffActions.createMultipleReviewerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ReviewerStaffActions.updateReviewerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.updateReviewerStaffSuccess, (state) => ({
            ...state,
            errors: null,
            managerStaff: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ReviewerStaffActions.updateReviewerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
        on(ReviewerStaffActions.deleteReviewerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ReviewerStaffActions.deleteReviewerStaffSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ReviewerStaffActions.deleteReviewerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectProjects,
    selectIsLoading,
    selectReviewerStaffs,
    selectPagination,
    selectReviewerStaff,
    selectIsVisible,
    selectErrors,
    selectIsLoaded,
} = reviewerStaffFeature;
