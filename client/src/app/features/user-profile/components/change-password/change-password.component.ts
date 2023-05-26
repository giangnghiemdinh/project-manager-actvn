import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormComponent, FormPasswordComponent, FormTextComponent } from '../../../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ConfirmPasswordMatched, NoWhitespaceValidator } from '../../../../common/validators';
import { UserChangePassword } from '../../../../common/models';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        NzModalModule,
        FormComponent,
        NzButtonModule,
        FormTextComponent,
        FormPasswordComponent
    ],
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
    @ViewChild('form') form!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Output() cancel = new EventEmitter();
    @Output() change = new EventEmitter<UserChangePassword>();
    validators = [ ConfirmPasswordMatched() ];
    noWhitespaceValidator = NoWhitespaceValidator();

    onCancel() {
        this.cancel.emit();
    }

    onSave() {
        if (!this.form.isValid) { return; }
        const value = this.form.value;
        this.change.emit(value);
    }
}
