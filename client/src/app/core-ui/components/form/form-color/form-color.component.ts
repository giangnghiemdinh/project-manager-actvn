import { Component } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-color',
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
            <input nz-input type="color"
                   [nzSize]="size"
                   [attr.id]="id"
                   [style]="style"
                   [class]="className"
                   [formControlName]="control"
                   (blur)="blur.emit(form)"
                   (focus)="focus.emit(form)"
                   (ngModelChange)="valueChange.emit({ form: form, value: $event })">
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        NzInputModule,
        FormErrorComponent,
        FormWrapperComponent,
        NgIf,
    ],
    standalone: true
})
export class FormColorComponent extends FormItemComponent {

}
