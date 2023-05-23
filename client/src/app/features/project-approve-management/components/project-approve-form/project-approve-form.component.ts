import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Department, Project } from '../../../../common/models';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormComponent } from '../../../../core-ui/components';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Semester } from '../../../../common/models/semester.model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ProjectStatus } from '../../../../common/constants/project.constant';

@Component({
    selector: 'app-project-approve-form',
    standalone: true,
    imports: [
        NzModalModule,
        NzSpinModule,
        NzButtonModule,
        FormComponent,
        NgIf,
        NgForOf,
        NzFormModule,
        NzInputModule,
        FormsModule,
        DatePipe
    ],
    templateUrl: './project-approve-form.component.html',
})
export class ProjectApproveFormComponent {
    private readonly modal = inject(NzModalService);
    @ViewChild('refuseContent') refuseContent!: TemplateRef<any>;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Input() project: Project | null = null;
    @Input() departments: Department[] | null = null;
    @Input() semesters: Semester[] | null = null;
    @Output() cancel = new EventEmitter();
    @Output() ok = new EventEmitter();

    onRefuse() {
        const ref = this.modal.create({
            nzContent: this.refuseContent,
            nzFooter: null,
            nzMaskClosable: false,
            nzClosable: true,
            nzCentered: true,
            nzComponentParams: {
                reason: ''
            }
        });
        ref.afterClose
            .pipe(take(1))
            .subscribe(params => {
                this.ok.emit({
                    id: this.project!.id,
                    status: ProjectStatus.REFUSE,
                    reason: params.reason
                });
            });
    }

    onApprove() {
        this.ok.emit({
            id: this.project!.id,
            status: this.project!.students?.length ? ProjectStatus.IN_PROGRESS : ProjectStatus.PENDING,
            reason: ''
        });
    }

    onClose() {
        this.isVisible = false;
        this.cancel.emit(false);
    }
}
