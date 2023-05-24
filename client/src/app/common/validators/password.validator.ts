import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function NoWhitespaceValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
        let controlVal = control.value;
        if (typeof controlVal === 'number') {
            controlVal = `${ controlVal }`;
        }
        let isWhitespace = ( controlVal || '' ).trim().length === 0;
        let isValid = !isWhitespace;
        return isValid ? null : { whitespace: true };
    };
}

export function ConfirmPasswordMatched() {
    return (formGroup: FormGroup): ValidationErrors | null => {
        const { value: password } = formGroup.get('password') as AbstractControl;
        const { value: confirmPassword } = formGroup.get('confirmPassword') as AbstractControl;
        if (password && confirmPassword && password !== confirmPassword) {
            formGroup.get('confirmPassword')?.setErrors({ confirmPasswordNotMatched: true });
        }
        return null;
    };
}
