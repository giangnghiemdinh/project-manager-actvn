import { Component, Input } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-form-wrapper',
    template: `
        <nz-form-item [class]="itemClass">
            <nz-form-label *ngIf="showLabel" [nzSpan]="24" [nzFor]="id">
                <ng-content select="[label]"></ng-content>
            </nz-form-label>
            <nz-form-control [nzSpan]="24" [nzValidateStatus]="validateStatus">
                <ng-content select="[control]"></ng-content>
            </nz-form-control>
        </nz-form-item>
    `,
    imports: [
        NzFormModule,
        NgIf
    ],
    standalone: true
})
export class FormWrapperComponent {
    @Input() validateStatus = '';
    @Input() errorTip = '';
    @Input() itemClass = '';
    @Input() showLabel = true;
    @Input() id = '';
}
