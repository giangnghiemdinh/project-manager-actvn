import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, take, takeUntil, timer } from 'rxjs';
import { cloneDeep, isEmpty } from 'lodash';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { environment } from '../../../../environments/environment';
import { getValidators, validateAllFormFields } from './form.util';

let id = 1000;
function getUiqName() { return `form_${id++}`; }

@Component({
    selector: 'app-form',
    standalone: true,
    template: '<nz-spin [nzSpinning]="isLoading"><ng-content></ng-content></nz-spin>',
    imports: [
        NzSpinModule
    ]
})
export class FormComponent implements OnChanges, OnDestroy, AfterViewInit {

    private valueChanges$ = new Subject<void>();
    @Input() debounceTime = 0;
    @Input() data: any = null;
    @Input() name = getUiqName();
    @Input() disabled = false;
    @Input() isLoading = false;
    @Input() emitChangesPatching = true;
    @Input() hidden: { [key: string]: any } = {};
    @Input() logger = !environment.production;
    @Input() validators: ValidatorFn[] = [];
    @Input() compareChangedFn = (current: any, data: any): boolean => {
        for (let [key, value] of Object.entries(current)) {
            if ((!isEmpty(value) || !isEmpty(data[key]))
                && JSON.stringify(value) !== JSON.stringify(data[key])
            ) {
                this.log(`${key} is changed from ${data[key]} to ${value}`);
                return true;
            }
        }
        return false;
    };
    @Output() valueChanges = new EventEmitter();
    @Output() submit = new EventEmitter();
    form = new FormGroup({});
    initialData: any = {};
    initialized = false;

    get f() {
        return this.form.controls;
    }

    get value() {
        return this.form.value as any;
    }

    get rawValue() {
        return this.form.getRawValue();
    }

    get isChanged() {
        return this.compareChangedFn(this.value, this.data || this.initialData);
    }

    get isPristine() {
        return this.form.pristine;
    }

    get isValid() {
        const valid = this.form.valid;
        !valid && validateAllFormFields(this.form);
        return valid;
    }

    ngAfterViewInit(): void {
        timer(0).subscribe(_ => {
            this.initialized = true;
            this.log(`Initialized | ${JSON.stringify(this.initialData)}`);
            this.validators.length
                ? this.form.setValidators(this.validators)
                : this.form.clearValidators();
            this.form.updateValueAndValidity();
            this.form[this.disabled ? 'disable' : 'enable']();
            !isEmpty(this.data)
                ? this.patchValue(this.data)
                : this.valueChangesListener();
        });
    }

    ngOnDestroy(): void {
        this.valueChangesDestroy();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { data, hidden, disabled, validators } = changes;
        if (data) {
            if (!this.data && !data.isFirstChange()) {
                this.reset();
            }
            this.patchValue(this.data).then();
        }
        if (disabled && this.initialized) {
            this.form[this.disabled ? 'disable' : 'enable']();
        }
        if (hidden) {
            if (isEmpty(this.hidden) && !isEmpty(hidden.previousValue)) {
                Object.keys(hidden.previousValue).forEach(control => this.removeControl(control));
                return;
            }
            if (!isEmpty(this.hidden)) {
                for (const [key, config] of Object.entries(this.hidden)) {
                    let value = null;
                    let validators = {};
                    let disabled = false;
                    if (typeof config == 'object' && config
                        && ('value' in config || 'disabled' in config
                            || 'validators' in config)) {
                        value = config.value || null;
                        disabled = config.disabled || false;
                        validators = config.validators || {};
                    } else {
                        value = config;
                    }
                    this.addControl(key, value, disabled, validators);
                }
            }
        }
        if (validators && this.initialized) {
            this.validators.length
                ? this.form.setValidators(this.validators)
                : this.form.clearValidators();
            this.form.updateValueAndValidity();
        }
    }

    onSubmit() {
        const { status, statusChanges } = this.form;
        switch (status) {
            case 'INVALID':
                validateAllFormFields(this.form);
                break;
            case 'PENDING':
                statusChanges
                    .pipe(take(1))
                    .subscribe(_ => this.onSubmit());
                break;
            default:
                this.submit.emit(this.form);
        }
    }

    addControl(
        control: string,
        value: any,
        disabled: boolean,
        validators: { [key: string]: any } | null,
        clearOnDestroy?: { value?: boolean, validator?: boolean } | boolean
    ) {
        if (!control) { return; }
        if (this.form.contains(control)) {
            if (typeof clearOnDestroy !== 'boolean' && clearOnDestroy && clearOnDestroy.validator) {
                const formControl = this.getControl(control);
                formControl!.setValidators(getValidators(validators));
                formControl!.updateValueAndValidity();
                this.log(`Update validator ${control} | ${JSON.stringify(formControl!.value)}`);
            }
            return;
        }
        this.log(`Add control ${control} | ${JSON.stringify(value)}`);
        this.initialData[control] = value;
        this.form.addControl(control, new FormControl({ value, disabled }, getValidators(validators)));
    }

    removeControl(control: string) {
        this.log(`Remove control ${control}`);
        this.form.removeControl(control);
    }

    getControl(control: string) {
        return this.form.get(control);
    }

    removeValidator(control: string) {
        const formControl = this.getControl(control);
        if (!formControl) { return; }
        this.log(`Clear validator ${control}`);
        formControl.clearValidators();
        formControl.updateValueAndValidity();
    }

    getValue(control: string) {
        return this.getControl(control)?.value;
    }

    setValue(control: string, value: any) {
        const formControl = this.getControl(control);
        if (!formControl) { return; }
        this.log(`Set value ${control} | ${JSON.stringify(value)}`);
        formControl.setValue(value);
    }

    reset() {
        this.form.reset();
        this.patchValue(this.initialData).then();
    }

    async patchValue(data: any) {
        if (!this.initialized || isEmpty(data)) { return; }

        const value = cloneDeep(data);
        this.valueChangesDestroy();

        if (this.emitChangesPatching) {
            // Make all valueChange emitted
            this.log(`Emit all valueChange | ${JSON.stringify(value)}`);
            for (const [controlName, control] of Object.entries(this.form.controls)) {
                (control as AbstractControl).setValue(value[controlName]);
                // delete value[controlName];
                await Promise.resolve(); // Resolve NG-100 Error
            }

            // Update value after all valueChanges executed
            timer(0).subscribe(_ => {
                this.log(`Start patch`);
                this.form.patchValue(value);
                this.log(`End patch | ${JSON.stringify(data)}`);
                this.form.markAsPristine();
                this.valueChangesListener();
            });
            return;
        }
        this.log(`Start patch`);
        for (const [controlName, control] of Object.entries(this.form.controls)) {
            (control as AbstractControl).setValue(value[controlName], { emitViewToModelChange: false });
        }
        this.log(`End patch | ${JSON.stringify(data)}`);
        this.valueChangesListener();
    }

    markAsDirty() {
        this.form.markAsDirty();
    }

    private log(message: string) {
        if (!this.logger) { return; }
        console.log(`%c${this.name} %c${message}`, 'color: yellow', 'color: white');
    }

    private valueChangesListener() {
        this.valueChanges$ = new Subject<void>();
        this.form.valueChanges
            .pipe(
                debounceTime(this.debounceTime),
                distinctUntilChanged(),
                takeUntil(this.valueChanges$)
            ).subscribe(_ => this.valueChanges.emit(this.value));
    }

    private valueChangesDestroy() {
        this.valueChanges$.next();
        this.valueChanges$.complete();
    }
}
