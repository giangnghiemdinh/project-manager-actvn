import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
    User,
    UserForgotPayload,
    UserLoginPayload,
    UserLoginResponse,
    UserResetPayload,
    UserVerifyPayload,
    UserVerifyResponse
} from '../../models';

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
        'Login': props<{ payload: UserLoginPayload }>(),
        'Login Success': props<{ response: UserLoginResponse }>(),
        'Login Failure': props<{ errors: any }>(),

        'Forgot Password': props<{ payload: UserForgotPayload }>(),
        'Forgot Password Success': emptyProps(),
        'Forgot Password Failure': props<{ errors: any }>(),

        'Reset Password': props<{ payload: UserResetPayload }>(),
        'Reset Password Success': emptyProps(),
        'Reset Password Failure': props<{ errors: any }>(),

        'Resend Email': props<{ payload: UserLoginPayload }>(),
        'Resend Email Success': emptyProps(),
        'Resend Email Failure': props<{ errors: any }>(),

        'Load OTP Token': props<{ payload: { email: string } }>(),
        'Load OTP Token Success': props<{ response: string }>(),
        'Load OTP Token Failure': props<{ errors: any }>(),

        'Two Factor Verify': props<{ payload: UserVerifyPayload }>(),
        'Two Factor Verify Success': props<{ response: UserVerifyResponse }>(),
        'Two Factor Verify Failure': props<{ errors: any }>(),

        'Load Profile': emptyProps(),
        'Load Profile Success': props<{ response: User }>(),
        'Load Profile Failure': props<{ errors: any }>(),

        'Update Profile': props<{ profile: User }>(),
        'Clear Errors': emptyProps(),
        'Logout': emptyProps(),
    }
});

