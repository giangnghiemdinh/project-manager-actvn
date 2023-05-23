import { createAction, props } from '@ngrx/store';
import { PaginationResponse, Progress } from '../../../common/models';

export const updateVisible = createAction(
  '[Progress] Update Visible',
  props<{ isVisible: boolean }>()
);

export const loadProgresses = createAction(
  '[Progress] Load Progresses'
);

export const loadProgressesSuccess = createAction(
  '[Progress/API] Load Progresses Success',
  props<{ response: PaginationResponse<Progress> }>()
);

export const loadProgressesFailure = createAction(
  '[Progress/API] Load Progresses Failure',
  props<{ errors: any }>()
);

export const loadProgress = createAction(
  '[Progress] Load Progress',
  props<{ payload: { id: number } }>()
);

export const loadProgressSuccess = createAction(
  '[Progress/API] Load Progress Success',
  props<{ response: Progress }>()
);

export const loadProgressFailure = createAction(
  '[Progress/API] Load Progress Failure',
  props<{ errors: any }>()
);

export const createProgress = createAction(
  '[Progress] Create Progress',
  props<{ payload: Progress }>()
);

export const createProgressSuccess = createAction(
  '[Progress/API] Create Progress Success',
  props<{ response: Progress }>()
);

export const createProgressFailure = createAction(
  '[Progress/API] Create Progress Failure',
  props<{ errors: any }>()
);

export const updateProgress = createAction(
  '[Progress] Update Progress',
  props<{ payload: Progress }>()
);

export const updateProgressSuccess = createAction(
  '[Progress/API] Update Progress Success'
);

export const updateProgressFailure = createAction(
  '[Progress/API] Update Progress Failure',
  props<{ errors: any }>()
);

export const deleteProgress = createAction(
  '[Progress] Delete Progress',
  props<{ payload: { id: number } }>()
);

export const deleteProgressSuccess = createAction(
  '[Progress/API] Delete Progress Success'
);

export const deleteProgressFailure = createAction(
  '[Progress/API] Delete Progress Failure',
  props<{ errors: any }>()
);
