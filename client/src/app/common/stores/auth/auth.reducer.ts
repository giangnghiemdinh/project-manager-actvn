import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../abstracts';
import { TwoFactorMethod } from '../../constants';
import { AuthActions } from './auth.actions';
import { User } from '../../models';

export interface AuthState extends AbstractState {
    credentials: {
        email?: string,
        twoFactorMethod?: TwoFactorMethod,
        requireOtpToken?: boolean
    } | null;
    otpToken: string;
    profile: User | null;
}

export const initialAuthState: AuthState = {
    credentials: null,
    otpToken: '',
    profile: null,
    isLoading: false,
    errors: null
};

export const authFeature = createFeature({
    name: 'auth',
    reducer: createReducer(
        initialAuthState,

        on(AuthActions.login, (state, { payload }) => ({
            ...state,
            credentials: { email: payload.email },
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.loginSuccess, (state, { response }) => ({
            ...state,
            credentials: {
                ...state.credentials,
                twoFactorMethod: response.twoFactoryMethod,
                requireOtpToken: response.requiredOtpToken
            },
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.loginFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.loadOTPToken, (state) => ({
            ...state,
            otpToken: '',
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.loadOTPTokenSuccess, (state, { response }) => ({
            ...state,
            otpToken: response,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.loadOTPTokenFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.twoFactorVerify, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.twoFactorVerifySuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.twoFactorVerifyFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.forgotPassword, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.forgotPasswordSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.forgotPasswordFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.resendEmail, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.resendEmailSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.resendEmailFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.resetPassword, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.resetPasswordSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.resetPasswordFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.loadProfile, (state) => ({
            ...state,
            profile: null,
            errors: null,
            isLoading: true,
        })),

        on(AuthActions.loadProfileSuccess, (state, { response }) => ({
            ...state,
            credentials: null,
            otpToken: '',
            profile: response,
            errors: null,
            isLoading: false,
        })),

        on(AuthActions.loadProfileFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(AuthActions.updateProfile, (state, { profile }) => ({
            ...state,
            profile: profile,
        })),

        on(AuthActions.clearErrors, (state) => ({
            ...state,
            isLoading: false,
            errors: null
        })),
    )
});

export const {
    reducer: authReducer,
    selectProfile,
    selectCredentials,
    selectOtpToken,
    selectIsLoading: selectAuthLoading,
    selectErrors: selectAuthErrors
} = authFeature;

