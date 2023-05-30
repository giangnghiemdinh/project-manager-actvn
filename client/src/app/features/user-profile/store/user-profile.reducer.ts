import { createFeature, createReducer, on } from '@ngrx/store';
import { UserProfileActions } from './user-profile.actions';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, User, UserEvent, UserSession } from '../../../common/models';

export interface UserProfileState extends AbstractState {
    user: User | null;
    events: UserEvent[];
    eventPagination: MetaPagination | null;
    sessions: UserSession[];
    sessionPagination: MetaPagination | null;
    isVisible: boolean;
    isVisibleEmail: boolean;
    isVisiblePass: boolean;
    isVisible2FA: boolean;
}

export const initialState: UserProfileState = {
    user: null,
    events: [],
    eventPagination: null,
    sessions: [],
    sessionPagination: null,
    isLoading: true,
    isVisible: false,
    isVisibleEmail: false,
    isVisiblePass: false,
    isVisible2FA: false,
    errors: null
};

export const userProfileFeature = createFeature({
    name: 'userProfile',
    reducer: createReducer(
        initialState,
        on(UserProfileActions.loadUser, (state) => ({
            ...state,
            user: null,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.loadUserSuccess, (state, { response }) => ({
            ...state,
            user: response,
            errors: null,
            isLoading: false,
        })),

        on(UserProfileActions.loadUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.updateUser, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.updateUserSuccess, (state, { response }) => ({
            ...state,
            user: response,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(UserProfileActions.updateUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.updateProfile, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.updateProfileSuccess, (state, { response }) => ({
            ...state,
            user: response,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(UserProfileActions.updateUserFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.loadSessions, (state) => ({
            ...state,
            sessions: [],
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.loadSessionsSuccess, (state, { response }) => ({
            ...state,
            sessions: response.data,
            sessionPagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(UserProfileActions.loadSessionsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.loadEvents, (state) => ({
            ...state,
            events: [],
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.loadEventsSuccess, (state, { response }) => ({
            ...state,
            events: response.data,
            eventPagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(UserProfileActions.loadEventsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.verifyNewEmail, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.verifyNewEmailSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(UserProfileActions.verifyNewEmailFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.changeEmail, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.changeEmailSuccess, (state) => ({
            ...state,
            errors: null,
            isVisibleEmail: false,
            isLoading: false,
        })),

        on(UserProfileActions.changeEmailFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.changePassword, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.changePasswordSuccess, (state) => ({
            ...state,
            errors: null,
            isVisiblePass: false,
            isLoading: false,
        })),

        on(UserProfileActions.changePasswordFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.change2FA, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.change2FASuccess, (state) => ({
            ...state,
            errors: null,
            isVisible2FA: false,
            isLoading: false,
        })),

        on(UserProfileActions.change2FAFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.deleteSession, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(UserProfileActions.deleteSessionSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(UserProfileActions.deleteSessionFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(UserProfileActions.updateVisible, (state, { isVisible, modal }) => {
            const newState = { ...state };
            switch (modal) {
                case 'email':
                    newState.isVisibleEmail = isVisible;
                    break;
                case 'password':
                    newState.isVisiblePass = isVisible;
                    break;
                case '2fa':
                    newState.isVisible2FA = isVisible;
                    break;
                default:
                    newState.isVisible = isVisible;
            }
            return newState;
        }),
    ),
});

export const {
    selectUser,
    selectSessions,
    selectSessionPagination,
    selectEvents,
    selectEventPagination,
    selectIsVisible,
    selectIsVisiblePass,
    selectIsVisibleEmail,
    selectIsVisible2FA,
    selectIsLoading,
    selectErrors,
} = userProfileFeature;
