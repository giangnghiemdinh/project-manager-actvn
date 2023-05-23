import { createAction, props } from '@ngrx/store';
import { Department } from '../../../common/models';

export const updateVisible = createAction(
  '[Department] Update Visible',
  props<{ isVisible: boolean }>()
);

export const loadDepartment = createAction(
  '[Department] Load Department',
  props<{ payload: { id: number } }>()
);

export const loadDepartmentSuccess = createAction(
  '[Department/API] Load Department Success',
  props<{ response: Department }>()
);

export const loadDepartmentFailure = createAction(
  '[Department/API] Load Department Failure',
  props<{ errors: any }>()
);

export const createDepartment = createAction(
  '[Department] Create Department',
  props<{ payload: Department }>()
);

export const createDepartmentSuccess = createAction(
  '[Department/API] Create Department Success',
  props<{ response: Department }>()
);

export const createDepartmentFailure = createAction(
  '[Department/API] Create Department Failure',
  props<{ errors: any }>()
);

export const updateDepartment = createAction(
  '[Department] Update Department',
  props<{ payload: Department }>()
);

export const updateDepartmentSuccess = createAction(
  '[Department/API] Update Department Success'
);

export const updateDepartmentFailure = createAction(
  '[Department/API] Update Department Failure',
  props<{ errors: any }>()
);
