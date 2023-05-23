import { Component, Input } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { NzDateMode, NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { inputToBoolean } from '../form.util';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-date',
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
            <ng-container *ngIf="isRange; else datePickerTmpl">
                <nz-range-picker [nzId]="id"
                                 [class]="className"
                                 [style]="style"
                                 [formControlName]="control"
                                 [nzDisabledDate]="disabledDate"
                                 [nzFormat]="dateFormat"
                                 [nzSize]="size"
                                 [nzMode]="dateMode"
                                 [nzPlaceHolder]="rangePlaceholder"
                                 [nzAllowClear]="allowClear"
                                 [nzRanges]="ranges"
                                 (blur)="blur.emit(form)"
                                 (focus)="focus.emit(form)"
                                 (ngModelChange)="valueChange.emit({ form: form, value: $event })"
                ></nz-range-picker>
            </ng-container>
            <ng-template #datePickerTmpl>
                <nz-date-picker
                        [nzId]="id"
                        [class]="className"
                        [style]="style"
                        [formControlName]="control"
                        [nzDisabledDate]="disabledDate"
                        [nzFormat]="dateFormat"
                        [nzSize]="size"
                        [nzMode]="dateMode"
                        [nzPlaceHolder]="placeholder"
                        [nzAllowClear]="allowClear"
                        (blur)="blur.emit(form)"
                        (focus)="focus.emit(form)"
                        (ngModelChange)="valueChange.emit({ form: form, value: $event })"
                ></nz-date-picker>
            </ng-template>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        NzDatePickerModule,
        NgIf,
        ReactiveFormsModule,
        NgTemplateOutlet,
        FormErrorComponent,
        FormWrapperComponent
    ],
    standalone: true
})
export class FormDateComponent extends FormItemComponent {
    @Input() override className = 'w-full';
    @Input() disabledDate?: (d: Date) => boolean;
    @Input() dateMode?: NzDateMode;
    @Input() dateFormat = 'dd/MM/yyyy';

    @Input()
    set allowClear(value: string | boolean | undefined) {
        this._allowClear = inputToBoolean(value);
    }
    get allowClear(): boolean {
        return this._allowClear;
    }
    private _allowClear = false;

    @Input() rangePlaceholder: string | string[] = ' ';
    @Input() ranges?: { [ key: string ]: Date[] } | { [ key: string ]: () => Date[] };

    @Input()
    set isRange(value: string | boolean | undefined) {
        this._isRange = inputToBoolean(value);
    }
    get isRange(): boolean {
        return this._isRange;
    }
    private _isRange = false;
}
