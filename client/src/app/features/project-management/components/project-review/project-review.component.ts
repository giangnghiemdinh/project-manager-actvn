import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
    FormCheckboxComponent,
    FormComponent,
    FormNumberComponent,
    FormRadioComponent,
    FormTextareaComponent,
    RadioDirective
} from '../../../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ProjectProgress } from '../../../../common/models';
import { ProjectProgressType } from '../../../../common/constants';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-project-review',
    standalone: true,
    imports: [ NzModalModule, FormComponent, FormTextareaComponent, NzButtonModule, FormRadioComponent, RadioDirective, FormNumberComponent, NgIf, FormCheckboxComponent ],
    templateUrl: './project-review.component.html',
})
export class ProjectReviewComponent {

    @ViewChild('form') formContainer!: FormComponent;
    @Input() report: ProjectProgress | null = null;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    type = ProjectProgressType;

    onCancel() {
        if (this.isLoading) { return; }
        this.cancel.emit();
    }

    onSave() {
        if (!this.formContainer.isValid) { return; }
        const value: any = this.formContainer.value;
        this.ok.emit({
            ...value,
            type: this.report?.type,
            id: this.report?.projectId
        });
    }
}
