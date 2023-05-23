import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { Department } from '../../../common/models';
import * as departmentActions from './department.actions';

export interface DepartmentState extends AbstractState {
  department: Department | null,
  isVisible: boolean;
}

export const initialState: DepartmentState = {
  department: null,
  isVisible: false,
  isLoading: false,
  errors: null
};

export const departmentFeature = createFeature({
  name: 'department',
  reducer: createReducer(
    initialState,

    on(departmentActions.updateVisible, (state, { isVisible }) => ({
      ...state,
      isVisible,
      department: isVisible ? null : state.department,
    })),

    on(departmentActions.loadDepartment, (state) => ({
      ...state,
      department: null,
      errors: null,
      isVisible: false,
      isLoading: true,
    })),

    on(departmentActions.loadDepartmentSuccess, (state, { response }) => ({
      ...state,
      department: response,
      errors: null,
      isVisible: true,
      isLoading: false,
    })),

    on(departmentActions.loadDepartmentFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(departmentActions.createDepartment, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(departmentActions.createDepartmentSuccess, (state) => ({
      ...state,
      errors: null,
      isVisible: false,
      isLoading: false,
    })),

    on(departmentActions.createDepartmentFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),

    on(departmentActions.updateDepartment, (state) => ({
      ...state,
      errors: null,
      isLoading: true,
    })),

    on(departmentActions.updateDepartmentSuccess, (state) => ({
      ...state,
      errors: null,
      isVisible: false,
      isLoading: false,
    })),

    on(departmentActions.updateDepartmentFailure, (state, { errors }) => ({
      ...state,
      errors,
      isLoading: false,
    })),
  )
});

export const {
  selectDepartment,
  selectIsVisible,
  selectIsLoading,
  selectErrors,
} = departmentFeature;
