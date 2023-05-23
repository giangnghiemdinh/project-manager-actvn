import { createAction, props } from '@ngrx/store';
import { ExaminerCouncil, PaginationPayload, PaginationResponse, Project } from '../../../common/models';

export const loadAllProjects = createAction(
  '[ExaminerCouncil] Load All Project',
  props<{
    payload: PaginationPayload,
    response?: PaginationResponse<Project>
  }>()
);

export const loadAllProjectSuccess = createAction(
  '[ExaminerCouncil] Load All Project Success',
  props<{ response: PaginationResponse<Project> }>()
);

export const loadAllProjectFailure = createAction(
  '[ExaminerCouncil] Load All Project Failure',
  props<{ errors: any }>()
);

export const loadExaminerCouncils = createAction(
  '[ExaminerCouncil] Load Examiner Councils'
);

export const loadExaminerCouncilsSuccess = createAction(
  '[ExaminerCouncil] Load Examiner Councils Success',
  props<{ response: PaginationResponse<ExaminerCouncil> }>()
);

export const loadExaminerCouncilsFailure = createAction(
  '[ExaminerCouncil] Load Examiner Councils Failure',
  props<{ errors: any }>()
);

export const loadExaminerCouncil = createAction(
  '[ExaminerCouncil] Load Examiner Council',
  props<{ payload: { id: number } }>()
);

export const loadExaminerCouncilSuccess = createAction(
  '[ExaminerCouncil] Load Examiner Council Success',
  props<{ response: ExaminerCouncil }>()
);

export const loadExaminerCouncilFailure = createAction(
  '[ExaminerCouncil] Load Examiner Council Failure',
  props<{ errors: any }>()
);

export const createExaminerCouncil = createAction(
  '[ExaminerCouncil] Create Examiner Council',
  props<{ payload: ExaminerCouncil }>()
);

export const createExaminerCouncilSuccess = createAction(
  '[ExaminerCouncil] Create Examiner Council Success',
  props<{ response: ExaminerCouncil }>()
);

export const createExaminerCouncilFailure = createAction(
  '[ExaminerCouncil] Create Examiner Council Failure',
  props<{ errors: any }>()
);

export const createMultipleExaminerCouncil = createAction(
  '[ExaminerCouncil] Create Multiple Examiner Council',
  props<{ payload: ExaminerCouncil[] }>()
);

export const createMultipleExaminerCouncilSuccess = createAction(
  '[ExaminerCouncil] Create Multiple Examiner Council Success',
  // props<{ response: ExaminerCouncil[] }>()
);

export const createMultipleExaminerCouncilFailure = createAction(
  '[ExaminerCouncil] Create Multiple Examiner Council Failure',
  props<{ errors: any }>()
);

export const updateExaminerCouncil = createAction(
  '[ExaminerCouncil] Update Examiner Council',
  props<{ payload: ExaminerCouncil }>()
);

export const updateExaminerCouncilSuccess = createAction(
  '[ExaminerCouncil] Update Examiner Council Success'
);

export const updateExaminerCouncilFailure = createAction(
  '[ExaminerCouncil] Update Examiner Council Failure',
  props<{ errors: any }>()
);

export const deleteExaminerCouncil = createAction(
  '[ExaminerCouncil] Delete Examiner Council',
  props<{ payload: { id: number } }>()
);

export const deleteExaminerCouncilSuccess = createAction(
  '[ExaminerCouncil] Delete Examiner Council Success'
);

export const deleteExaminerCouncilFailure = createAction(
  '[ExaminerCouncil] Delete Examiner Council Failure',
  props<{ errors: any }>()
);

export const updateVisible = createAction(
  '[ExaminerCouncil] Update Visible',
  props<{ isVisible: boolean }>()
);

