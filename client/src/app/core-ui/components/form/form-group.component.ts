import { Component, Input, OnDestroy, OnInit, Optional, SkipSelf } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { assertFormControl, assertFormItem, getValidators } from './form.util';
import { FormComponent } from './form.component';
import { isPure } from '../../../common/utilities';

@Component({
    selector: 'form-group',
    standalone: true,
    template: `<ng-content></ng-content>`
})
export class FormGroupComponent implements OnInit, OnDestroy {

    @Input() control = '';
    @Input() clearOnDestroy = false;
    form!: FormGroup;
    initialData: any = {};

    constructor(
        @Optional()
        @SkipSelf()
        private readonly formContainer: FormComponent,

        @Optional()
        @SkipSelf()
        private readonly formGroup: FormGroupComponent,
    ) {
        assertFormItem(this);
    }

    ngOnInit(): void {
        assertFormControl(this);
        const parent = this.parent;
        parent.form.addControl(this.control, new FormGroup({}));
        this.form = parent.getControl(this.control) as FormGroup;
    }

    ngOnDestroy(): void {
        this.clearOnDestroy && this.parent.removeControl(this.control);
    }

    addControl(
        control: string,
        value: any,
        disabled: boolean,
        validators: { [key: string]: any } | null,
        clearOnDestroy?: { value?: boolean, validator?: boolean } | boolean) {
        if (this.form.contains(control)) {
            if (typeof clearOnDestroy !== 'boolean' && clearOnDestroy && clearOnDestroy.validator) {
                const formControl = this.getControl(control);
                formControl.setValidators(getValidators(validators));
                formControl.updateValueAndValidity();
            }
            return;
        }
        this.initialData[control] = value;
        this.parent.initialData[this.control] = this.initialData;
        this.form.addControl(control, new FormControl({ value, disabled }, getValidators(validators)));
    }

    removeControl(control: string) {
        this.form.removeControl(control);
    }

    getControl(control: string) {
        return this.form.controls[control];
    }

    @isPure
    get parentForm() {
        if (this.formGroup) {
            return this.formGroup.form;
        }
        return this.formContainer.form;
    }

    @isPure
    get parent() {
        return this.formGroup || this.formContainer;
    }
}
