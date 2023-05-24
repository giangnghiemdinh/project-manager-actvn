import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Department, User } from '../../../common/models';
import { Genders, Roles } from '../../../common/constants';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
    FormComponent,
    FormDateComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormTextComponent
} from '../form';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        NzModalModule,
        NzSpinModule,
        FormTextComponent,
        FormDateComponent,
        FormSelectComponent,
        NzButtonModule,
        FormComponent,
        FormTextareaComponent
    ],
    templateUrl: './user-form.component.html'
})
export class UserFormComponent {
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() user: User | null = null;
    @Input() departments: Department[] | null = [];
    @Input() isSelf = false;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();

    genders = Genders;
    roles = Roles;

    onClose() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) {
            return;
        }
        this.ok.emit({ ...this.formComponent.rawValue, id: this.user?.id });
    }
}
