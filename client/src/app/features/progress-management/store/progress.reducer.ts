import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Progress } from '../../../common/models';
import * as progressActions from './progress.actions';

export interface ProgressState extends AbstractState {
    progresses: Progress[],
    pagination: MetaPagination | null,
    progress: Progress | null,
    isVisible: boolean;
}

export const initialState: ProgressState = {
    progresses: [],
    pagination: null,
    progress: null,
    isVisible: false,
    isLoading: false,
    errors: null
};

export const progressFeature = createFeature({
    name: 'progress',
    reducer: createReducer(
        initialState,

        on(progressActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            progress: isVisible ? null : state.progress,
        })),

        on(progressActions.loadProgresses, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(progressActions.loadProgressesSuccess, (state, { response }) => ({
            ...state,
            progresses: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(progressActions.loadProgressesFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(progressActions.loadProgress, (state) => ({
            ...state,
            progress: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(progressActions.loadProgressSuccess, (state, { response }) => ({
            ...state,
            progress: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(progressActions.loadProgressFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(progressActions.createProgress, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(progressActions.createProgressSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(progressActions.createProgressFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(progressActions.updateProgress, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(progressActions.updateProgressSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(progressActions.updateProgressFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
        on(progressActions.deleteProgress, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(progressActions.deleteProgressSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(progressActions.deleteProgressFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectProgresses,
    selectPagination,
    selectProgress,
    selectIsVisible,
    selectIsLoading,
    selectErrors,
} = progressFeature;
