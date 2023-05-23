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
}

export const initialState: UserProfileState = {
    user: null,
    events: [],
    eventPagination: null,
    sessions: [],
    sessionPagination: null,
    isLoading: true,
    isVisible: false,
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

        on(UserProfileActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible: isVisible,
        })),
    ),
});

export const {
    selectUser,
    selectSessions,
    selectSessionPagination,
    selectEvents,
    selectEventPagination,
    selectIsVisible,
    selectIsLoading,
    selectErrors,
} = userProfileFeature;
