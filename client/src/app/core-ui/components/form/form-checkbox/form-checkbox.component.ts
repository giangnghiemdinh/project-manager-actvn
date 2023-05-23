import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@Component({
    selector: 'app-form-checkbox',
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
            <label nz-checkbox
                   [formControlName]="control"
                   [class]="className"
                   [nzId]="id"
                   (nzCheckedChange)="checkedChange.emit($event)"
                   (ngModelChange)="valueChange.emit({ form: form, value: $event })">
                <ng-content></ng-content>
            </label>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        FormErrorComponent,
        FormWrapperComponent,
        NgTemplateOutlet,
        ReactiveFormsModule,
        NzCheckboxModule,
        NgIf
    ],
    standalone: true
})
export class FormCheckboxComponent extends FormItemComponent {
    @Input() override initialValue: number | boolean | null = false;
    @Output() checkedChange = new EventEmitter();
}
