import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormItemComponent } from '../form-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonService, NotificationService } from '../../../../common/services';
import { toNonAccentVietnamese } from '../../../../common/utilities';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-form-file',
    standalone: true,
    imports: [
        FormErrorComponent,
        FormWrapperComponent,
        NgForOf,
        NgIf,
        NgTemplateOutlet,
        NzOutletModule,
        NzRadioModule,
        ReactiveFormsModule,
        NgClass
    ],
    template: `
        <app-form-wrapper [id]="id"
                          [itemClass]="itemClass"
                          [showLabel]="showLabel"
                          *ngIf="!noFormWrapper; else noFormWrapperTmpl">
            <ng-container label>
                {{ label }}&nbsp;<ng-content select="[label]"></ng-content>
            </ng-container>
            <ng-container control *ngTemplateOutlet="controlTmpl"></ng-container>
        </app-form-wrapper>

        <ng-template #noFormWrapperTmpl>
            <ng-container *ngTemplateOutlet="controlTmpl"></ng-container>
        </ng-template>

        <ng-template #controlTmpl [formGroup]="form">
            <div class="w-full h-[40px] cursor-pointer ant-input ant-input-lg"
                [ngClass]="isDeleting ? 'opacity-60 pointer-events-none' : ''">
                <div *ngIf="formControl?.value as value; else inputPlaceholder"
                     class="px-2 max-w-full w-fit flex items-center justify-between gap-1 rounded-md bg-gray-200 text-gray-500">
                    <span class="mr-2 flex-1 max-w-4/5 truncate">{{ value.name }}</span>
                    <i (click)="onRemove(); $event.stopPropagation();" class='flex-shrink-0 bx bx-x text-gray-400 hover:text-gray-700 transition-all duration-300'></i>
                </div>
                <ng-template #inputPlaceholder>
                    <div class="text-[#bfbfbf] flex items-center gap-1 w-full" (click)="file.click()">
                        <i class='bx bx-paperclip -rotate-45'></i>
                        <span>Chọn tệp</span>
                    </div>
                </ng-template>
            </div>
            <input #file type="file"
                   class="hidden"
                   [accept]="accept.join(',')"
                   (change)="onFileChange($event)"/>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
})
export class FormFileComponent extends FormItemComponent {

    private readonly notification = inject(NotificationService);
    private readonly commonService = inject(CommonService);

    @Input() accept: string[] = [];
    @Input() maxSize?: number; // MB
    @Output() filesChange = new EventEmitter();
    @Output() download = new EventEmitter();
    @Output() view = new EventEmitter();
    isDeleting = false;

    onFileChange(event: any) {
        const [ file ] = event.target.files;
        if (!file) {
            this.onRemove();
            return;
        }
        const extension = this.getExtension(file);
        const name = toNonAccentVietnamese(file.name || '');
        if (this.accept.length && !this.accept.includes(extension)) {
            this.notification.error(`Vui lòng đính kèm tệp ${this.accept.join(', ')}!`);
            event.target.value = '';
            return;
        }
        const size = file.size / 1024;
        if (this.maxSize && size > this.maxSize * 1024) {
            this.notification.error(`Tệp đính kèm tối đa ${this.maxSize}MB!`);
            event.target.value = '';
            return;
        }
        const f = {
            id: null,
            name,
            originObject: file
        };
        this.formControl?.setValue(f);
        this.formControl?.markAsDirty();
        this.filesChange.emit(f);
        event.target.value = '';
    }

    onRemove() {
        if (!this.formControl) { return; }
        const value = this.formControl.value
        if (!value) { return; }
        if (!value.id) {
            this.formControl?.reset();
            return;
        }
        this.isDeleting = true;
        this.commonService.deleteFile(value.id)
            .pipe(finalize(() => this.isDeleting = false))
            .subscribe({
                next: _ => {
                    this.formControl?.reset();
                    this.formControl?.markAsDirty();
                },
                error: err => this.notification.error(err.message || 'Có lỗi xảy ra! Vui lòng thử lại sau.')
            });
    }

    private getExtension(file: any) {
        return '.' + file.name.split('.').pop().toLowerCase();
    }
}
