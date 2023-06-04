import { createFeature, createReducer, on } from '@ngrx/store';
import { ExaminerCouncilActions } from './examiner-council.actions';
import { AbstractState } from '../../../common/abstracts';
import { ExaminerCouncil, MetaPagination, Project } from '../../../common/models';

export interface ExaminerCouncilState extends AbstractState {
    projects: Project[];
    isLoaded: boolean;
    examinerCouncils: ExaminerCouncil[];
    pagination: MetaPagination | null;
    examinerCouncil: ExaminerCouncil | null;
    isVisible: boolean;
}

export const initialState: ExaminerCouncilState = {
    projects: [],
    isLoaded: false,
    examinerCouncils: [],
    pagination: null,
    examinerCouncil: null,
    isVisible: false,
    isLoading: false,
    errors: null
};

export const examinerCouncilFeature = createFeature({
    name: 'examiner-council',
    reducer: createReducer(
        initialState,

        on(ExaminerCouncilActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            examinerCouncil: isVisible ? null : state.examinerCouncil,
        })),

        on(ExaminerCouncilActions.loadAllProject, (state, { response }) => ({
            ...state,
            isLoaded: false,
            projects: response ? [...state.projects, ...response.data] : [],
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.loadAllProjectSuccess, (state, { response }) => ({
            ...state,
            projects: [...state.projects, ...response.data],
            isLoaded: true,
            errors: null,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.loadAllProjectFailure, (state, { errors }) => ({
            ...state,
            errors,
            projects: [],
            isLoading: false,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncils, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncilsSuccess, (state, { response }) => ({
            ...state,
            examinerCouncils: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncilsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncil, (state) => ({
            ...state,
            examinerCouncil: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncilSuccess, (state, { response }) => ({
            ...state,
            examinerCouncil: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.loadExaminerCouncilFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.createExaminerCouncil, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.createExaminerCouncilSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            examinerCouncil: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.createExaminerCouncilFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.createMultipleExaminerCouncil, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.createMultipleExaminerCouncilSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.createMultipleExaminerCouncilFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.updateExaminerCouncil, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.updateExaminerCouncilSuccess, (state) => ({
            ...state,
            errors: null,
            examinerCouncil: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.updateExaminerCouncilFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
        on(ExaminerCouncilActions.deleteExaminerCouncil, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ExaminerCouncilActions.deleteExaminerCouncilSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ExaminerCouncilActions.deleteExaminerCouncilFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectProjects,
    selectIsLoading,
    selectExaminerCouncils,
    selectPagination,
    selectExaminerCouncil,
    selectIsVisible,
    selectErrors,
    selectIsLoaded,
} = examinerCouncilFeature;
