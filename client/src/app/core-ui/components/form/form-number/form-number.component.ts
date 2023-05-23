import { Component, Input } from '@angular/core';
import { FormItemComponent } from '../form-item.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormWrapperComponent } from '../form-wrapper/form-wrapper.component';

@Component({
    selector: 'app-form-number',
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
            <nz-input-number
                    [class]="className"
                    [style]="style"
                    [nzId]="id"
                    [nzSize]="size"
                    [formControlName]="control"
                    [nzPlaceHolder]="placeholder"
                    [nzMax]="max"
                    [nzMin]="min"
                    [nzPrecision]="precision"
                    [nzParser]="parser"
                    [nzStep]="step"
                    (nzBlur)="blur.emit(form)"
                    (nzFocus)="focus.emit(form)"
                    (ngModelChange)="valueChange.emit({ form: form, value: $event })"
            ></nz-input-number>
            <app-form-error [label]="errorLabel || label"
                            [customMessage]="errors"
                            [formControlName]="control"
            ></app-form-error>
        </ng-template>
    `,
    imports: [
        FormErrorComponent,
        ReactiveFormsModule,
        NgTemplateOutlet,
        NgIf,
        NzInputNumberModule,
        FormWrapperComponent
    ],
    standalone: true
})
export class FormNumberComponent extends FormItemComponent {

    @Input() override className = 'w-full';
    @Input() min: number = -Infinity;
    @Input() max: number = Infinity;
    @Input() step = 1;
    @Input() precision?: number;
    @Input() parser = (value: string): string => value
        .trim()
        .replace(/。/g, '.')
        .replace(/[^0-9\.-]+/g, '');

}
