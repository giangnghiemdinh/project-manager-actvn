import { Component, Input, TemplateRef } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { inputToBoolean } from '../form.util';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ReactiveFormsModule } from '@angular/forms';
import { InputParserDirective } from '../../../directives';
import { FormErrorComponent } from '../form-error/form-error.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-form-text',
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
                    [nzAddOnAfter]="addOnAfter"
                    [nzAddOnBefore]="addOnBefore"
                    [nzPrefix]="prefix"
                    [nzPrefixIcon]="prefixIcon"
                    [nzSuffix]="allowClear ? inputClearTpl : suffix"
                    [nzSuffixIcon]="suffixIcon">
                <input [attr.id]="id"
                       [formControlName]="control"
                       [lowerCase]="lowerCase"
                       [upperCase]="upperCase"
                       [readonly]="readonly"
                       [maxlength]="maxLength"
                       [minlength]="minLength"
                       [parser]="parser"
                       [placeholder]="placeholder"
                       (blur)="blur.emit(form)"
                       (focus)="focus.emit(form)"
                       (ngModelChange)="valueChange.emit({ form: form, value: $event })"
                       input-parser nz-input type="text">
            </nz-input-group>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>

        <ng-template #inputClearTpl>
            <i nz-icon
               class="ant-input-clear-icon"
               nzTheme="fill"
               nzType="close-circle"
               *ngIf="allowClear && formControl && formControl.value"
               (click)="$event.stopPropagation(); formControl.setValue(initialValue); valueChange.emit({ form: form, value: initialValue })"
            ></i>
        </ng-template>
    `,
    imports: [
        FormWrapperComponent,
        NgIf,
        NgTemplateOutlet,
        NzInputModule,
        ReactiveFormsModule,
        InputParserDirective,
        FormErrorComponent,
        NzIconModule
    ],
    standalone: true
})
export class FormTextComponent extends FormItemComponent {
    @Input() override initialValue: string | null = '';
    @Input() readonly = false;
    @Input() parser?: (value: string) => string;
    @Input() maxLength: string | number | null = null;
    @Input() minLength: string | number | null = null;
    @Input() prefix?: string | TemplateRef<void>;
    @Input() prefixIcon: string | null = null;
    @Input() suffix?: string | TemplateRef<void>;
    @Input() suffixIcon: string | null = null;
    @Input() addOnBefore?: string | TemplateRef<void>;
    @Input() addOnAfter?: string | TemplateRef<void>;

    @Input()
    set allowClear(value: string | boolean | undefined) {
        this._allowClear = inputToBoolean(value);
    }
    get allowClear(): boolean {
        return this._allowClear;
    }
    private _allowClear = false;

    @Input()
    set upperCase(value: string | boolean | undefined) {
        this._upperCase = inputToBoolean(value);
    }
    get upperCase(): boolean {
        return this._upperCase;
    }
    private _upperCase = false;

    @Input()
    set lowerCase(value: string | boolean | undefined) {
        this._lowerCase = inputToBoolean(value);
    }
    get lowerCase(): boolean {
        return this._lowerCase;
    }
    private _lowerCase = false;
}
