import { Component, Input } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormErrorComponent } from '../form-error/form-error.component';

@Component({
    selector: 'app-form-textarea',
    template: `
        <app-form-wrapper [id]="id"
                      [itemClass]="itemClass"
                      [showLabel]="showLabel"
                      [validateStatus]="hasError ? 'error' : ''"
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
            <textarea [attr.id]="id"
                      [nzSize]="size"
                      [class]="className"
                      [style]="style"
                      [formControlName]="control"
                      [maxlength]="maxLength"
                      [minlength]="minLength"
                      [nzAutosize]="autoSize"
                      [placeholder]="placeholder"
                      (blur)="blur.emit(form)"
                      (focus)="focus.emit(form)"
                      (ngModelChange)="valueChange.emit({ form: form, value: $event })"
                      nz-input
            ></textarea>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        NgTemplateOutlet,
        FormWrapperComponent,
        NgIf,
        ReactiveFormsModule,
        NzInputModule,
        FormErrorComponent
    ],
    standalone: true
})
export class FormTextareaComponent extends FormItemComponent {
    @Input() override initialValue: string | null = '';
    @Input() maxLength: string | number | null = null;
    @Input() minLength: string | number | null = null;
    @Input() autoSize: string | boolean | { minRows?: number, maxRows?: number } = '';
}
