import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
    SkipSelf
} from '@angular/core';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { assertFormControl, assertFormItem, inputToBoolean } from './form.util';
import { FormComponent } from './form.component';
import { isPure } from '../../../common/utilities';
import { FormGroupComponent } from './form-group.component';

let id = 1000;

function getUniqId() { return `item_${id++}`; }

@Component({ template: '', standalone: true })
export class FormItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() initialValue: any = null;
    @Input() id = getUniqId();
    @Input({ required: true }) control = '';
    @Input() placeholder = ' ';
    @Input() disabled = false;
    @Input() className = '';
    @Input() itemClass = '';
    @Input() style = '';
    @Input() label = '';
    @Input() errorLabel = '';
    @Input() errors: { [key: string]: any } | null = null;
    @Input() size: NzSizeLDSType = 'large';
    @Input() validators: { [key: string]: any } | null = null;
    @Input() clearOnDestroy?: { value?: boolean, validator?: boolean } | boolean;
    @Output() valueChange = new EventEmitter<any>();
    @Output() blur = new EventEmitter<any>();
    @Output() focus = new EventEmitter<any>();

    @Input()
    set showLabel(value: string | boolean | undefined) {
        this._showLabel = inputToBoolean(value);
    }
    get showLabel(): boolean {
        return this._showLabel;
    }
    private _showLabel = true;

    @Input()
    set noFormWrapper(value: string | boolean | undefined) {
        this._noFormWrapper = inputToBoolean(value);
    }
    get noFormWrapper(): boolean {
        return this._noFormWrapper;
    }
    private _noFormWrapper = false;

    constructor(
        @Optional()
        @SkipSelf()
        protected readonly formContainer: FormComponent,

        @Optional()
        @SkipSelf()
        protected readonly formGroup: FormGroupComponent,
    ) {
        assertFormItem(this);
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { disabled, initialValue } = changes;
        if (disabled && this.formControl) {
            this.formControl[this.disabled ? 'disable' : 'enable']();
        }
        if (initialValue && this.formControl) {
            this.formControl.setValue(this.initialValue);
            this.parent.initialData[this.control] = this.initialValue;
        }
    }

    ngOnInit(): void {
        assertFormControl(this);
        this.parent.addControl(this.control, this.initialValue, this.disabled, this.validators, this.clearOnDestroy);
    }

    ngOnDestroy(): void {
        const formControl = this.formControl;
        if (!this.clearOnDestroy || !formControl) { return; }

        if (typeof this.clearOnDestroy === 'boolean') {
            this.parent.removeControl(this.control);
            return;
        }
        if (this.clearOnDestroy.value) {
            formControl.setValue(this.initialValue);
            formControl.markAsUntouched();
            formControl.markAsPristine();
        }
        if (this.clearOnDestroy.validator) {
            formControl.clearValidators();
            formControl.updateValueAndValidity();
        }
    }

    get formControl() {
        return this.parent.getControl(this.control) || null;
    }

    get hasError() {
        return !!this.formControl && this.formControl.touched && this.formControl.invalid;
    }

    @isPure
    get form() {
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
