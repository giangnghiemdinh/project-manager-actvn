import { createFeature, createReducer, on } from '@ngrx/store';
import * as examinerCouncilActions from './examiner-council.actions';
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

    on(examinerCouncilActions.updateVisible, (state, { isVisible }) => ({
      ...state,
      isVisible,
      examinerCouncil: isVisible ? null : state.examinerCouncil,
    })),

    on(examinerCouncilActions.loadAllProjects, (state, { response }) => ({
      ...state,
      isLoaded: false,
      projects: response ? [...state.projects, ...response.data] : [],
      errors: null,
      isLoading: true,
    })),

    on(examinerCouncilActions.loadAllProjectSuccess, (state, { response }) => ({
      ...state,
      projects: [...state.projects, ...response.data],
      isLoaded: true,
      errors: null,
      isLoading: false,
    })),

    on(examinerCouncilActions.loadAllProjectFailure, (state, { errors }) => ({
      ...state,
      errors,
      projects: [],
      isLoading: false,
    })),

    on(examinerCouncilActions.loadExaminerCouncils, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(examinerCouncilActions.loadExaminerCouncilsSuccess, (state, { response }) => ({
      ...state,
      examinerCouncils: response.data,
      pagination: response.meta,
      errors: null,
      isLoading: false,
    })),

    on(examinerCouncilActions.loadExaminerCouncilsFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(examinerCouncilActions.loadExaminerCouncil, (state) => ({
      ...state,
      examinerCouncil: null,
      errors: null,
      isVisible: false,
      isLoading: true,
    })),

    on(examinerCouncilActions.loadExaminerCouncilSuccess, (state, { response }) => ({
      ...state,
      examinerCouncil: response,
      errors: null,
      isVisible: true,
      isLoading: false,
    })),

    on(examinerCouncilActions.loadExaminerCouncilFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(examinerCouncilActions.createExaminerCouncil, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(examinerCouncilActions.createExaminerCouncilSuccess, (state, { response }) => ({
      ...state,
      errors: null,
      examinerCouncil: null,
      isVisible: false,
      isLoading: false,
    })),

    on(examinerCouncilActions.createExaminerCouncilFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(examinerCouncilActions.updateExaminerCouncil, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(examinerCouncilActions.updateExaminerCouncilSuccess, (state) => ({
      ...state,
      errors: null,
      examinerCouncil: null,
      isVisible: false,
      isLoading: false,
    })),

    on(examinerCouncilActions.updateExaminerCouncilFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),
    on(examinerCouncilActions.deleteExaminerCouncil, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(examinerCouncilActions.deleteExaminerCouncilSuccess, (state) => ({
      ...state,
      errors: null,
      isLoading: false,
    })),

    on(examinerCouncilActions.deleteExaminerCouncilFailure, (state, { errors }) => ({
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
