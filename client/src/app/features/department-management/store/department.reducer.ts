import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { Department } from '../../../common/models';
import { DepartmentActions } from './department.actions';

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

        on(DepartmentActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            department: isVisible ? null : state.department,
        })),

        on(DepartmentActions.loadDepartment, (state) => ({
            ...state,
            department: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(DepartmentActions.loadDepartmentSuccess, (state, { response }) => ({
            ...state,
            department: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(DepartmentActions.loadDepartmentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(DepartmentActions.createDepartment, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(DepartmentActions.createDepartmentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(DepartmentActions.createDepartmentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(DepartmentActions.updateDepartment, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(DepartmentActions.updateDepartmentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(DepartmentActions.updateDepartmentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(DepartmentActions.deleteDepartment, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(DepartmentActions.deleteDepartmentSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(DepartmentActions.deleteDepartmentFailure, (state, { errors }) => ({
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
