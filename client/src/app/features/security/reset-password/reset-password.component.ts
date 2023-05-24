import { Component, inject } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { setTitle } from '../../../common/utilities';
import { Store } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';
import { selectQueryParams } from '../../../common/stores/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmPasswordMatched, NoWhitespaceValidator } from '../../../common/validators';
import { FormErrorComponent } from '../../../core-ui/components';
import { Params } from '@angular/router';
import { AuthActions, AuthState, selectAuthErrors } from '../../../common/stores';
import { LetDirective } from '../../../core-ui/directives';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ NzFormModule, NzInputModule, NzButtonModule, NgIf, AsyncPipe, FormsModule, ReactiveFormsModule, LetDirective, FormErrorComponent ],
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
    private readonly routerStore = inject(Store<RouterReducerState>);
    private readonly store = inject(Store<AuthState>);
    passwordVisible = false;
    confirmPasswordVisible = false;
    queryParams$ = this.routerStore.select(selectQueryParams);
    errors$ = this.store.select(selectAuthErrors);
    form = new FormGroup({
        password: new FormControl('', [ Validators.required, NoWhitespaceValidator ]),
        confirmPassword: new FormControl('', [ Validators.required, NoWhitespaceValidator ])
    }, [ ConfirmPasswordMatched ]);

    constructor() {
        setTitle('Đổi mật khẩu');
        this.store.dispatch(AuthActions.clearErrors());
    }

    onReset(params: Params) {
        const { value, valid } = this.form;
        if (!valid) {
            this.form.markAllAsTouched();
            return;
        }
        const { code, email } = params;
        this.store.dispatch(AuthActions.resetPassword({ payload: { code, email, password: value.password || '' } }));
    }
}
