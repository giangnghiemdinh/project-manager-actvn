import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { RadioDirective } from './radio.directive';
import { FormErrorComponent } from '../form-error/form-error.component';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ReactiveFormsModule } from '@angular/forms';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-radio',
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
            <nz-radio-group
                    [attr.id]="id"
                    [class]="className"
                    [style]="style"
                    [formControlName]="control"
                    [nzSize]="size"
                    [nzDisabled]="disabled"
                    [nzButtonStyle]="buttonStyle"
                    (ngModelChange)="valueChange.emit({form: form, value: $event})">
                <label nz-radio
                       [nzValue]="radio.value"
                       [class]="radio.className"
                       *ngFor="let radio of listOfRadio">
                    <ng-container *nzStringTemplateOutlet="radio.label"></ng-container>
                </label>
            </nz-radio-group>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        FormErrorComponent,
        NzOutletModule,
        NgForOf,
        NzRadioModule,
        ReactiveFormsModule,
        NgTemplateOutlet,
        FormWrapperComponent,
        NgIf,
    ],
    standalone: true
})
export class FormRadioComponent extends FormItemComponent {
    @ContentChildren(RadioDirective) listOfRadio!: QueryList<RadioDirective>;
    @Input() buttonStyle: 'outline' | 'solid' = 'outline';
}
