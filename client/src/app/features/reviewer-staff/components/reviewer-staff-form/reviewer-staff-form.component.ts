import { Component, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NotificationService } from '../../../../common/services';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import {
    ConfirmComponent,
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    FormWrapperComponent,
    SearchProjectComponent,
    SearchUserComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent
} from '../../../../core-ui/components';
import { Department, Project, ReviewerStaff, Semester, User } from '../../../../common/models';
import { FormGroup } from '@angular/forms';
import { cloneDeep, uniqBy } from 'lodash';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgForOf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { first, lastValueFrom, timer } from 'rxjs';
import { ProjectStatus } from '../../../../common/constants';
import { rankFullName } from '../../../../common/utilities';
import { RankFullNamePipe } from '../../../../core-ui/pipes';

@Component({
    selector: 'app-reviewer-staff-form',
    standalone: true,
    imports: [
        NzModalModule,
        NzSpinModule,
        FormComponent,
        FormSelectComponent,
        FormTextComponent,
        FormWrapperComponent,
        TableComponent,
        TableColumnDirective,
        TableCellDirective,
        NgForOf,
        NzButtonModule,
        SearchUserComponent,
        SearchProjectComponent,
        RankFullNamePipe
    ],
    templateUrl: './reviewer-staff-form.component.html',
})
export class ReviewerStaffFormComponent {
    readonly #notification = inject(NotificationService);
    readonly #modal = inject(NzModalService);

    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() reviewerStaff: ReviewerStaff | null = null;
    @Input() departments: Department[] | null = null;
    @Input() semesters: Semester[] | null = null;
    @Input() projects: Project[] | null = [];
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() loadProject = new EventEmitter();
    isVisibleSearchUser = false;
    isVisibleSearchProject = false;
    selectedUser: User | null = null;
    selectedProjects: Project[] = [];
    currentDepartment = 0;
    currentSemester = 0;
    hiddenIds: number[] = [];
    data: any;

    ngOnChanges(changes: SimpleChanges): void {
        const { reviewerStaff, isVisible } = changes;
        if (isVisible && !this.isVisible) {
            timer(200).subscribe(_ => {
                this.data = null;
                this.currentDepartment = 0;
                this.currentSemester = 0;
                this.selectedUser = null;
                this.selectedProjects = [];
            });
        }
        if (reviewerStaff && this.reviewerStaff) {
            this.currentDepartment = this.reviewerStaff.departmentId!;
            this.currentSemester = this.reviewerStaff.semesterId!;
            this.selectedUser = this.reviewerStaff.user || null;
            this.selectedProjects = this.reviewerStaff.projects || [];
            this.data = {
                departmentId: this.currentDepartment,
                semesterId: this.currentSemester,
                instructorName: rankFullName(this.reviewerStaff.user),
            };
            Promise.resolve().then(_ => this.reloadProject());
        }
    }

    onDepartmentOrSemesterChanges(event: { form: FormGroup }) {
        const { departmentId, semesterId } = event.form.controls;
        if (this.selectedProjects.length && this.currentDepartment && this.currentSemester
            && departmentId.value && semesterId.value
            && (this.currentDepartment !== departmentId.value
                || this.currentSemester !== semesterId.value)) {
            const ref = this.#modal.create({
                nzWidth: 400,
                nzContent: ConfirmComponent,
                nzFooter: null,
                nzClosable: false,
                nzCentered: true,
                nzAutofocus: null,
                nzData: {
                    title: 'Bạn đã thay đổi khoa hoặc học kỳ. Bạn có muốn chọn lại danh sách?',
                    okText: 'Đồng ý',
                    okDanger: false
                }
            });
            ref.afterClose
                .pipe(first())
                .subscribe(confirm => {
                    if (confirm) {
                        this.selectedProjects = [];
                        this.currentDepartment = departmentId.value;
                        this.currentSemester = semesterId.value;
                        this.reloadProject();
                        return;
                    }
                    departmentId.setValue(this.currentDepartment, { emitViewToModelChange: false });
                    semesterId.setValue(this.currentSemester, { emitViewToModelChange: false });
                });
            return;
        }
        if (departmentId.value && semesterId.value) {
            this.currentDepartment = departmentId.value;
            this.currentSemester = semesterId.value;
            this.reloadProject();
        }
    }

    private reloadProject() {
        this.loadProject.emit({
            departmentId: this.currentDepartment,
            semesterId: this.currentSemester,
            state: 'rne'
        });
    }

    onSearchUser() {
        this.isVisibleSearchUser = true;
    }

    onSearchProject() {
        if (!this.currentDepartment || !this.currentSemester) {
            this.#notification.error('Vui lòng chọn khoa và học kỳ!');
            return;
        }
        if (this.projects && this.reviewerStaff
            && this.currentSemester === this.reviewerStaff.semesterId
            && this.currentDepartment === this.reviewerStaff.departmentId
            && this.reviewerStaff.projects) {
            this.projects = uniqBy([...this.reviewerStaff.projects, ...this.projects], 'id');
        }
        this.hiddenIds = this.selectedProjects.map(p => p.id!);
        this.isVisibleSearchProject = true;
    }

    onSelectProject(projects: Project[]) {
        if (!projects.length) { return; }
        this.selectedProjects = [...this.selectedProjects, ...projects];
    }

    async onRemoveProject(project: Project) {
        if (project.status === ProjectStatus.IN_PRESENTATION) {
            this.#notification.error('Không thể xoá đề tài đang bảo vệ khỏi nhóm!');
            return;
        }
        if (project.reportedCount) {
            const confirm = await lastValueFrom(this.#modal.create({
                nzWidth: 400,
                nzContent: ConfirmComponent,
                nzFooter: null,
                nzClosable: false,
                nzCentered: true,
                nzAutofocus: null,
                nzData: {
                    title: `Đề tài đã chấm phản biện. Bạn có chắc chắn muốn xoá đề tài khỏi nhóm không?`,
                    okText: 'Xoá',
                    okDanger: true
                }
            }).afterClose);
            if (!confirm) { return; }
        }
        this.selectedProjects = this.selectedProjects.filter(p => p.id !== project.id!);
    }

    onSelectUser(users: User[]) {
        if (!users.length) { return; }
        const [ user ] = users;
        this.selectedUser = cloneDeep(user);
        this.formComponent?.setValue('instructorName', rankFullName(this.selectedUser));
    }

    onCancel() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    async onSave() {
        if (!this.formComponent.isValid || !this.selectedUser) { return; }
        if (!this.selectedProjects.length) {
            this.#notification.error('Vui lòng chọn danh sách đề tài!');
            return;
        }
        if (this.reviewerStaff && this.selectedProjects.some(p => p.reportedCount)) {
            const confirm = await lastValueFrom(this.#modal.create({
                nzWidth: 400,
                nzContent: ConfirmComponent,
                nzFooter: null,
                nzClosable: false,
                nzCentered: true,
                nzAutofocus: null,
                nzData: {
                    title: `Có đề tài đã chấm phản biện. Bạn có chắc chắn muốn lưu thay đổi không?`,
                    okText: 'Đồng ý',
                    okDanger: false
                }
            }).afterClose);
            if (!confirm) { return; }
        }
        const value: any = this.formComponent.value;
        this.ok.emit({
            ...value,
            id: this.reviewerStaff?.id,
            userId: this.selectedUser.id,
            projects: this.selectedProjects.map(p => ({ id: p.id }))
        });
    }
}
