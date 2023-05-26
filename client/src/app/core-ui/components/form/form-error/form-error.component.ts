import { Component, Inject, Input, Optional, Self } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { AbstractControl, FormArrayName, FormGroupDirective, FormGroupName, NgControl } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-form-error',
    template: `
        <div class="clear-both min-h-[24px] mt-1 text-red-600 text-xs transition-all duration-300" 
             *ngIf="computedError" @helpMotion>
            {{ errorMessage }}
        </div>
    `,
    styles: [
        `
            .invalid-feedback {
                clear: both;
                font-size: 12px;
                line-height: 1.5715;
                transition: color .3s cubic-bezier(.215, .61, .355, 1);
            }
        `
    ],
    animations: [
        trigger('helpMotion', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(-5px)'
                }),
                animate(
                    `0.3s cubic-bezier(0.645, 0.045, 0.355, 1)`,
                    style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    })
                )
            ])
        ])
    ],
    imports: [
        NgIf
    ],
    standalone: true
})
export class FormErrorComponent {

    @Input() label = '';
    @Input() displayWhenDirty = false;
    @Input() customMessage: { [key: string]: any } | null = null;

    constructor(
        @Optional()
        @Self()
        @Inject(NgControl)
        private readonly ngControl: NgControl | null,
        @Optional()
        @Self()
        @Inject(FormArrayName)
        private readonly formArrayName: FormArrayName | null,
        @Optional()
        @Self()
        @Inject(FormGroupName)
        private readonly formGroupName: FormGroupName | null,
        @Optional()
        @Self()
        @Inject(FormGroupDirective)
        private readonly formGroup: FormGroupDirective | null,
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    get computedError() {
        return (this.invalid && this.touchedOrDirty && this.controlErrors) || null;
    }

    get errorMessage() {
        const errors = this.control?.errors;
        if (!errors) { return ''; }

        if (this.customMessage) {
            for (const key in this.customMessage) {
                if (this.control?.hasError(key)) {
                    const error = this.control?.getError(key);
                    let message = this.customMessage[key];
                    for (const errorKey in error) {
                        message = message.replace(`{${errorKey}}`, error[errorKey]);
                    }
                    return message;
                }
            }
        }

        const label = this.label || 'Trường này';

        if (errors['required']) {
            return `${label} không được để trống`;
        }
        if (errors['email'] || errors['invalid'] || errors['pattern']) {
            return `${label} không hợp lệ`;
        }
        if (errors['max']) {
            return `${label} phải bé hơn ${errors['max'].max}`;
        }
        if (errors['min']) {
            return `${label} phải lớn hơn ${errors['min'].min}`;
        }
        if (errors['maxlength']) {
            return `${label} có tối đa ${errors['maxlength'].requiredLength} ký tự`;
        }
        if (errors['minlength']) {
            return `${label} có tối thiểu ${errors['minlength'].requiredLength} ký tự`;
        }
        if (errors['whitespace']) {
            return `${ label } không được chứa khoảng trắng`;
        }

        if (errors['confirmPasswordNotMatched']) {
            return `Mật khẩu không trùng khớp`;
        }

        return '';
    }

    private get invalid(): boolean {
        return !!this.control && this.control.invalid;
    }

    private get touchedOrDirty(): boolean {
        return !!this.control && (this.displayWhenDirty ? this.control.dirty : this.control.touched);
    }

    private get controlErrors() {
        return (this.control && this.control.errors);
    }

    private get control(): AbstractControl | null {

        if (this.ngControl) {
            return this.ngControl.control;
        }

        if (this.formArrayName) {
            return this.formArrayName.control;
        }

        if (this.formGroupName) {
            return this.formGroupName.control;
        }

        if (this.formGroup) {
            return this.formGroup.control;
        }

        return null;
    }

    registerOnChange() {
    }

    registerOnTouched() {
    }

    setDisabledState() {
    }

    writeValue() {
    }
}
