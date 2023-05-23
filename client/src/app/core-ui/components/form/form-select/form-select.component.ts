import { Component, Input, TemplateRef } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { inputToBoolean } from '../form.util';
import { FormErrorComponent } from '../form-error/form-error.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CallbackFnPipe } from './callback-fn.pipe';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-select',
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
            <nz-select
                    [class]="className"
                    [style]="style"
                    [nzId]="id"
                    [nzSize]="size"
                    [formControlName]="control"
                    [nzAllowClear]="allowClear"
                    [nzPlaceHolder]="placeholder"
                    [compareWith]="compareWith"
                    [nzShowArrow]="showArrow"
                    [nzOptionHeightPx]="optionHeightPx"
                    [nzMaxMultipleCount]="maxMultipleCount"
                    [nzMaxTagCount]="maxTagCount"
                    [nzMaxTagPlaceholder]="tagPlaceHolder"
                    [nzMode]="isMultiple ? 'multiple' : 'default'"
                    [nzSuffixIcon]="suffixIcon"
                    (blur)="blur.emit(form)"
                    (focus)="focus.emit(form)"
                    (ngModelChange)="valueChange.emit({ form: form, value: $event, option: getSelectedOption($event) })"
                    nzShowSearch>
                <ng-container *ngIf="optionGroups.length; else singleOption">
                    <nz-option-group *ngFor="let group of optionGroups"
                                     [nzLabel]="group.label">
                        <nz-option *ngFor="let option of group.options"
                                   [nzCustomContent]="!!optionTemplate"
                                   [nzLabel]="optionLabel ? (optionLabel | callbackFn: option) : option[selectLabel]"
                                   [nzValue]="optionValue ? (optionValue | callbackFn: option) : option[selectValue]">
                            <ng-container
                                    *ngTemplateOutlet="optionTemplate; context: { $implicit: option }"></ng-container>
                        </nz-option>
                    </nz-option-group>
                </ng-container>
                <ng-template #singleOption>
                    <nz-option *ngFor="let option of options"
                               [nzCustomContent]="!!optionTemplate"
                               [nzLabel]="optionLabel ? (optionLabel | callbackFn: option) : option[selectLabel]"
                               [nzValue]="optionValue ? (optionValue | callbackFn: option) : option[selectValue]">
                        <ng-container *ngTemplateOutlet="optionTemplate; context: { $implicit: option }"></ng-container>
                    </nz-option>
                </ng-template>
                <ng-template #tagPlaceHolder let-selectedList>+{{ selectedList.length }}</ng-template>
            </nz-select>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [displayWhenDirty]="true"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        FormErrorComponent,
        NzSelectModule,
        CallbackFnPipe,
        NgTemplateOutlet,
        ReactiveFormsModule,
        NgIf,
        FormWrapperComponent,
        NgForOf
    ],
    standalone: true
})
export class FormSelectComponent extends FormItemComponent {
    @Input() override className = 'w-full';
    @Input() options: any[] | null = [];
    @Input() optionGroups: { label: string, options: any[] }[] = [];
    @Input() selectValue = 'value';
    @Input() selectLabel = 'label';
    @Input() optionHeightPx = 32;
    @Input() optionTemplate: TemplateRef<any> | null = null;
    @Input() optionLabel?: (option: any) => string;
    @Input() optionValue?: (option: any) => any;
    @Input() maxMultipleCount: number = Infinity;
    @Input() maxTagCount: number = Infinity;
    @Input() suffixIcon: TemplateRef<NzSafeAny> | string | null = null;
    @Input() compareWith: (o1: NzSafeAny, o2: NzSafeAny) => boolean = (o1: NzSafeAny, o2: NzSafeAny) => o1 == o2;

    @Input()
    set showArrow(value: string | boolean | undefined) {
        this._showArrow = inputToBoolean(value);
    }
    get showArrow(): boolean {
        return this._showArrow;
    }
    private _showArrow = true;

    @Input()
    set isMultiple(value: string | boolean | undefined) {
        this._isMultiple = inputToBoolean(value);
    }
    get isMultiple(): boolean {
        return this._isMultiple;
    }
    private _isMultiple = false;

    @Input()
    set allowClear(value: string | boolean | undefined) {
        this._allowClear = inputToBoolean(value);
    }
    get allowClear(): boolean {
        return this._allowClear;
    }
    private _allowClear = false;

    getSelectedOption(value: any) {
        if (this.optionGroups.length > 0) {
            let current;
            this.optionGroups.forEach(g => {
                let find = g.options.find(i => i[this.selectValue] === value);
                if (find) { current = { ...find, groupName: g.label }; }
            });
            return current;
        }
        return this.options?.find(i => i[this.selectValue] === value);
    }
}
