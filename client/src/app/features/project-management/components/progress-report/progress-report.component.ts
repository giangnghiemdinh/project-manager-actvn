import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgForOf, NgIf } from '@angular/common';
import { ProjectProgress } from 'src/app/common/models/project-progress.model';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { SortPipe } from '../../../../core-ui/pipes';
import { FormComponent, FormFileComponent, FormTextareaComponent } from '../../../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ReportNamePipe } from './report-name.pipe';
import { NotificationService } from '../../../../common/services';
import { ProjectProgressType } from '../../../../common/constants/project.constant';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
    selector: 'app-progress-report',
    standalone: true,
    imports: [
        NzModalModule,
        NzSpinModule,
        NgForOf,
        NzCollapseModule,
        SortPipe,
        FormComponent,
        FormTextareaComponent,
        NzButtonModule,
        FormFileComponent,
        ReportNamePipe,
        NgIf,
        NzToolTipModule,
    ],
    templateUrl: './progress-report.component.html',
})
export class ProgressReportComponent {

    private readonly notification = inject(NotificationService);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() report: ProjectProgress | null = null;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    type = ProjectProgressType;
    accept = ['.pdf', '.doc', '.docx', '.zip', '.rar'];
    maxSize = 10;

    onCancel() {
        if (this.isLoading) { return; }
        this.cancel.emit();
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        const value: any = this.formComponent.value;
        if (!value.wordFile?.originObject && !value.reportFile?.originObject && !value.otherFile?.originObject) {
            this.notification.error('Vui lòng cập nhật tệp đính kèm');
            return;
        }
        this.ok.emit({
            ...value,
            type: this.report?.type,
            id: this.report?.projectId
        });
    }
}
