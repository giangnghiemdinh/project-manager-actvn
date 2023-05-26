import { Component, Input } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-form-password',
    standalone: true,
    imports: [
        FormErrorComponent,
        FormWrapperComponent,
        NgIf,
        NgTemplateOutlet,
        NzInputModule,
        ReactiveFormsModule,
        NzIconModule
    ],
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
            <nz-input-group
                    [nzSize]="size"
                    [class]="className"
                    [style]="style"
                    [nzSuffix]="suffixTemplate">
                <input [attr.id]="id"
                       [formControlName]="control"
                       [maxlength]="maxLength"
                       [minlength]="minLength"
                       [placeholder]="placeholder"
                       [type]="passwordVisible ? 'text' : 'password'"
                       (blur)="blur.emit(form)"
                       (focus)="focus.emit(form)"
                       (ngModelChange)="valueChange.emit({ form: form, value: $event })"
                       nz-input type="text">
            </nz-input-group>
            <ng-template #suffixTemplate>
                <span nz-icon [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" 
                      (click)="passwordVisible = !passwordVisible"
                ></span>
            </ng-template>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `
})
export class FormPasswordComponent extends FormItemComponent {
    @Input() override initialValue: string | null = '';
    @Input() maxLength: string | number | null = null;
    @Input() minLength: string | number | null = null;

    passwordVisible = false;
}
