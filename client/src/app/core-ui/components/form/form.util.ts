import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { isEmpty } from 'lodash';

export function getValidators(validators: { [key: string]: any } | null) {
    if (!validators) { return []; }
    const composes: any = [];
    for (const [key, value] of Object.entries(validators)) {
        switch (key) {
            case 'required':
                composes.push(Validators.required);
                break;
            case 'min':
                composes.push(Validators.min(value));
                break;
            case 'max':
                composes.push(Validators.max(value));
                break;
            case 'minLength':
                composes.push(Validators.minLength(value));
                break;
            case 'maxLength':
                composes.push(Validators.maxLength(value));
                break;
            case 'email':
                composes.push(Validators.email);
                break;
            case 'pattern':
                composes.push(Validators.pattern(value));
                break;
            default:
                composes.push(value);
                break
        }
    }
    return composes;
}

export function validateAllFormFields(formGroup: FormGroup) {
    for (const control of Object.values(formGroup.controls)) {
        if (control instanceof FormControl) {
            control.markAsDirty();
            control.markAsTouched();
            control.updateValueAndValidity();
        } else if (control instanceof FormGroup) {
            validateAllFormFields(control);
        } else if (control instanceof FormArray) {
            control.controls.forEach(item => validateAllFormFields(item as FormGroup));
        }
    }
}

export function inputToBoolean(value: unknown): boolean {
    return value != null && `${value}` !== 'false';
}

export function assertFormItem(component: any): void {
    if (!component.formContainer && !component.formGroup) {
        throw new RuntimeError(
            303,
            `${component.id || 'Item'} must be in Form Container or Form Group`);
    }
}

export function assertFormControl(component: any): void {
    if (isEmpty(component.control)) {
        throw new RuntimeError(
            303,
            `Control of ${component.id || 'Item'} must be not empty`);
    }
}
