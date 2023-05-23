import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, User } from '../../../common/models';
import { UserActions } from './user.actions';

export interface UserState extends AbstractState {
    users: User[],
    pagination: MetaPagination | null,
    user: User | null,
    isVisible: boolean,
    isImportVisible: boolean
}

export const initialState: UserState = {
    users: [],
    pagination: null,
    user: null,
    isVisible: false,
    isImportVisible: false,
    isLoading: false,
    errors: null
};

export const userFeature = createFeature({
    name: 'user',
    reducer: createReducer(
        initialState,

        on(UserActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            user: isVisible ? null : state.user,
        })),

        on(UserActions.updateImportVisible, (state, { isVisible }) => ({
            ...state,
            isImportVisible: isVisible,
        })),

        on(UserActions.loadUsers, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserActions.loadUsersSuccess, (state, { response }) => ({
            ...state,
            users: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(UserActions.loadUsersFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserActions.loadUser, (state) => ({
            ...state,
            user: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(UserActions.loadUserSuccess, (state, { response }) => ({
            ...state,
            user: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(UserActions.loadUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserActions.createUser, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserActions.createUserSuccess, (state, _) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(UserActions.createUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserActions.updateUser, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserActions.updateUserSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(UserActions.updateUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserActions.changeStatusUser, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserActions.changeStatusUserSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(UserActions.changeStatusUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserActions.importUser, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserActions.importUserSuccess, (state, _) => ({
            ...state,
            errors: null,
            isImportVisible: false,
            isLoading: false,
        })),

        on(UserActions.importUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectUsers,
    selectPagination,
    selectUser,
    selectIsVisible,
    selectIsImportVisible,
    selectIsLoading,
    selectErrors,
} = userFeature;
