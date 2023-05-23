import { Component, Input } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { inputToBoolean } from '../form.util';
import { FormErrorComponent } from '../form-error/form-error.component';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-time',
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
            <nz-time-picker
                    [nzId]="id"
                    [formControlName]="control"
                    [nzSize]="size"
                    [class]="className"
                    [style]="style"
                    [nzAllowEmpty]="allowEmpty"
                    [nzFormat]="timeFormat"
                    [nzPlaceHolder]="placeholder"
                    (blur)="blur.emit(form)"
                    (focus)="focus.emit(form)"
                    (ngModelChange)="valueChange.emit({form: form, value: $event})"
            ></nz-time-picker>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        FormErrorComponent,
        NzTimePickerModule,
        ReactiveFormsModule,
        NgTemplateOutlet,
        FormWrapperComponent,
        NgIf
    ],
    standalone: true
})
export class FormTimeComponent extends FormItemComponent {
    @Input() timeFormat: string = 'HH:mm';
    @Input()
    set allowEmpty(value: string | boolean | undefined) {
        this._allowEmpty = inputToBoolean(value);
    }
    get allowEmpty(): boolean {
        return this._allowEmpty;
    }
    private _allowEmpty = false;
}
