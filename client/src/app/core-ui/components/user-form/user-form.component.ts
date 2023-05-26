import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { DriverUrlPipe } from '../../pipes';
import { NgIf } from '@angular/common';
import { NotificationService } from '../../../common/services';
import { getBase64 } from '../../../common/utilities';

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
        FormTextareaComponent,
        DriverUrlPipe,
        NgIf
    ],
    templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnChanges {
    readonly #notification = inject(NotificationService);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() user: User | null = null;
    @Input() departments: Department[] | null = [];
    @Input() isAdministrator: boolean | null = true;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();

    genders = Genders;
    roles = Roles;
    avatar: { id?: string, base64?: string, file?: any } | null = null;
    acceptFiles = [ '.jpg', '.jpeg', '.png' ];
    defaultAvatarUrl = 'assets/images/avatars/default-avatar.jpg';

    ngOnChanges(changes: SimpleChanges): void {
        const { user } = changes;
        if (user) {
            this.avatar = this.user && this.user.avatar
                ? { id: this.user.avatar }
                : null;
        }
    }

    onCancel() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) {
            return;
        }
        const payload: any = {
            ...this.formComponent.rawValue,
            avatar: this.avatar?.id || '',
            id: this.user?.id,
        };
        this.avatar?.file && (payload.avatarFile = this.avatar.file);
        this.ok.emit(payload);
    }

    onRemoveAvatar() {
        this.avatar = null;
    }

    async onFileChange(event: any) {
        if (event.target.files && event.target.files[0]) {
            const [ file ] = event.target.files;
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (this.acceptFiles.indexOf(extension) === -1) {
                this.#notification.error('Bạn chỉ có thể tải tệp ảnh!');
                event.target.value = '';
                return;
            }
            const size = file.size / 1024;
            if (size > 3 * 1_024) {
                this.#notification.error('Tệp phải có kích thước nhỏ hơn 3MB');
                event.target.value = '';
                return;
            }
            this.avatar = {
                file,
                base64: await getBase64(file) + '',
                id: this.avatar?.id || undefined
            };
        }
        event.target.value = '';
    }
}
