import { createFeature, createReducer, on } from '@ngrx/store';
import { ManagerStaffActions } from './manager-staff.actions';
import { AbstractState } from '../../../common/abstracts';
import { ManagerStaff, MetaPagination, Project } from '../../../common/models';

export interface ManagerStaffState extends AbstractState {
    projects: Project[];
    isLoaded: boolean;
    managerStaffs: ManagerStaff[];
    pagination: MetaPagination | null;
    managerStaff: ManagerStaff | null;
    isVisible: boolean;
}

export const initialState: ManagerStaffState = {
    projects: [],
    isLoaded: false,
    managerStaffs: [],
    pagination: null,
    managerStaff: null,
    isVisible: false,
    isLoading: false,
    errors: null
};

export const managerStaffFeature = createFeature({
    name: 'manager-staff',
    reducer: createReducer(
        initialState,

        on(ManagerStaffActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            managerStaff: isVisible ? null : state.managerStaff,
        })),

        on(ManagerStaffActions.loadAllProjects, (state, { response }) => ({
            ...state,
            isLoaded: false,
            projects: response ? [...state.projects, ...response.data] : [],
            errors: null,
            isLoading: true,
        })),

        on(ManagerStaffActions.loadAllProjectsSuccess, (state, { response }) => ({
            ...state,
            projects: [...state.projects, ...response.data],
            isLoaded: true,
            errors: null,
            isLoading: false,
        })),

        on(ManagerStaffActions.loadAllProjectsFailure, (state, { errors }) => ({
            ...state,
            errors,
            projects: [],
            isLoading: false,
        })),

        on(ManagerStaffActions.loadManagerStaffs, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ManagerStaffActions.loadManagerStaffsSuccess, (state, { response }) => ({
            ...state,
            managerStaffs: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(ManagerStaffActions.loadManagerStaffsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ManagerStaffActions.loadManagerStaff, (state) => ({
            ...state,
            managerStaff: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(ManagerStaffActions.loadManagerStaffSuccess, (state, { response }) => ({
            ...state,
            managerStaff: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(ManagerStaffActions.loadManagerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ManagerStaffActions.createManagerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ManagerStaffActions.createManagerStaffSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            managerStaff: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ManagerStaffActions.createManagerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(ManagerStaffActions.updateManagerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ManagerStaffActions.updateManagerStaffSuccess, (state) => ({
            ...state,
            errors: null,
            managerStaff: null,
            isVisible: false,
            isLoading: false,
        })),

        on(ManagerStaffActions.updateManagerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
        on(ManagerStaffActions.deleteManagerStaff, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(ManagerStaffActions.deleteManagerStaffSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(ManagerStaffActions.deleteManagerStaffFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectProjects,
    selectIsLoading,
    selectManagerStaffs,
    selectPagination,
    selectManagerStaff,
    selectIsVisible,
    selectErrors,
    selectIsLoaded,
} = managerStaffFeature;
