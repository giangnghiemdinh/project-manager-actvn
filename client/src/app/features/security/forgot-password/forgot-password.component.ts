import { Component, inject } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { setTitle } from '../../../common/utilities';
import { RO_LOGIN_FULL } from '../../../common/constants';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from '../../../core-ui/components';
import { Store } from '@ngrx/store';
import { AuthActions, AuthState, selectAuthErrors } from '../../../common/stores';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ NzFormModule, NzInputModule, NzButtonModule, RouterLink, RecaptchaFormsModule, RecaptchaModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf, FormErrorComponent ],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {

    private readonly store = inject(Store<AuthState>);
    loginUrl = RO_LOGIN_FULL;
    errors$ = this.store.select(selectAuthErrors);

    form = new FormGroup({
        email: new FormControl<string>('', [ Validators.email, Validators.required ]),
        recaptcha: new FormControl<string | null>(null, Validators.required)
    });

    constructor() {
        setTitle('Quên mật khẩu');
        this.store.dispatch(AuthActions.clearErrors());
    }

    onForgot() {
        const { value, valid } = this.form;
        if (!valid) {
            this.form.markAsTouched();
            return;
        }
        this.store.dispatch(AuthActions.forgotPassword({
            payload: {
                email: value.email || ''
            }
        }));
    }
}
