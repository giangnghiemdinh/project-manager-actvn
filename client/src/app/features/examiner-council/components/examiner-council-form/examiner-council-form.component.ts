import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { Department, ExaminerCouncil, ExaminerCouncilUser, Project, Semester, User } from '../../../../common/models';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { uniqBy } from 'lodash';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormGroup, FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../common/services';
import { NgForOf } from '@angular/common';
import { ExaminerCouncilPosition, ExaminerCouncilPositions, ProjectStatus } from '../../../../common/constants';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CouncilPositionPipe } from '../../council-position.pipe';
import { first, lastValueFrom, timer } from 'rxjs';
import { RankFullNamePipe, RankPipe } from '../../../../core-ui/pipes';

@Component({
    selector: 'app-manager-council-form',
    standalone: true,
    imports: [
        NzModalModule,
        NzSpinModule,
        FormComponent,
        FormTextComponent,
        FormSelectComponent,
        NzButtonModule,
        SearchUserComponent,
        TableComponent,
        TableColumnDirective,
        NzFormModule,
        SearchProjectComponent,
        TableCellDirective,
        NgForOf,
        FormWrapperComponent,
        NzSelectModule,
        FormsModule,
        CouncilPositionPipe,
        RankFullNamePipe,
        RankPipe,
    ],
    templateUrl: './examiner-council-form.component.html',
})
export class ExaminerCouncilFormComponent implements OnChanges {
    readonly #notification = inject(NotificationService);
    readonly #modal = inject(NzModalService);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() examinerCouncil: ExaminerCouncil | null = null;
    @Input() departments: Department[] | null = null;
    @Input() semesters: Semester[] | null = null;
    @Input() projects: Project[] | null = [];
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() loadProject = new EventEmitter();
    isVisibleSearchUser = false;
    isVisibleSearchProject = false;
    selectedUsers: ExaminerCouncilUser[] = [];
    selectedProjects: Project[] = [];
    currentDepartment = 0;
    currentSemester = 0;
    hiddenIds: number[] = [];
    data: any;
    editId: number | null = null;
    editLocationId: number | null = null;
    positions = ExaminerCouncilPositions;

    ngOnChanges(changes: SimpleChanges): void {
        const { examinerCouncil, isVisible } = changes;
        if (isVisible && !this.isVisible) {
            timer(200).subscribe(_ => {
                this.data = null;
                this.currentDepartment = 0;
                this.currentSemester = 0;
                this.selectedUsers = [];
                this.selectedProjects = [];
            });
        }
        if (examinerCouncil && this.examinerCouncil) {
            this.currentDepartment = this.examinerCouncil.departmentId!;
            this.currentSemester = this.examinerCouncil.semesterId!;
            this.selectedUsers = this.examinerCouncil.users || [];
            this.selectedProjects = this.examinerCouncil.projects || [];
            this.data = {
                departmentId: this.currentDepartment,
                semesterId: this.currentSemester,
                location: this.examinerCouncil.location || ''
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
            state: 'cne',
            status: ProjectStatus.IN_REVIEW
        });
    }

    onSearchUser() {
        if (this.selectedUsers.length >= 6) { return; }
        this.isVisibleSearchUser = true;
    }

    onSearchProject() {
        if (!this.currentDepartment || !this.currentSemester) {
            this.#notification.error('Vui lòng chọn khoa và học kỳ!');
            return;
        }
        if (this.projects && this.examinerCouncil
            && this.currentSemester === this.examinerCouncil.semesterId
            && this.currentDepartment === this.examinerCouncil.departmentId
            && this.examinerCouncil.projects) {
            this.projects = uniqBy([...this.examinerCouncil.projects, ...this.projects], 'id');
        }
        this.hiddenIds = this.selectedProjects.map(p => p.id!);
        this.isVisibleSearchProject = true;
    }

    onSelectProject(projects: Project[]) {
        if (!projects.length) { return; }
        this.selectedProjects = [...this.selectedProjects, ...projects];
    }

    onRemoveProject(project: Project) {
        if (project.conclusionScore) {
            this.#notification.error('Không thể xoá đề tài đã có điểm bảo vệ khỏi nhóm!')
            return;
        }
        this.selectedProjects = this.selectedProjects.filter(p => p.id !== project.id);
    }

    onRemoveUser(userId: number) {
        this.selectedUsers = this.selectedUsers.filter(p => p.userId !== userId);
    }

    onSelectUser(users: User[]) {
        if (!users.length) { return; }
        const newUsers = users
            .map(u => ({ user: u, userId: u.id, position: ExaminerCouncilPosition.MEMBER}));
        this.selectedUsers = (uniqBy([...this.selectedUsers, ...newUsers], 'userId')).slice(0, 6);
    }

    onCancel() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    async onSave() {
        if (!this.formComponent.isValid) { return; }
        if (!this.selectedUsers.length) {
            this.#notification.error('Vui lòng chọn thành viên hội đồng!');
            return;
        }
        const chairPersonLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.CHAIRPERSON).length;
        if (chairPersonLength > 1) {
            this.#notification.error('Hội đồng có tối đa 01 chủ tịch!');
            return;
        }
        if (!chairPersonLength) {
            this.#notification.error('Vui lòng chọn chủ tịch!');
            return;
        }

        const adSecretaryLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.ADMINISTRATIVE_SECRETARY).length;
        if (adSecretaryLength > 1) {
            this.#notification.error('Hội đồng có tối đa 01 thư ký hành chính!');
            return;
        }
        if (!adSecretaryLength) {
            this.#notification.error('Vui lòng chọn thư ký hành chính!');
            return;
        }

        const secretaryLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.SECRETARY).length;
        if (secretaryLength > 1) {
            this.#notification.error('Hội đồng có tối đa 01 thư ký!');
            return;
        }
        if (!secretaryLength) {
            this.#notification.error('Vui lòng chọn thư ký!');
            return;
        }

        if (!this.selectedProjects.length) {
            this.#notification.error('Vui lòng chọn danh sách đề tài!');
            return;
        }
        if (this.examinerCouncil && this.selectedProjects.some(p => p.conclusionScore)) {
            const confirm = await lastValueFrom(this.#modal.create({
                nzWidth: 400,
                nzContent: ConfirmComponent,
                nzFooter: null,
                nzClosable: false,
                nzCentered: true,
                nzAutofocus: null,
                nzData: {
                    title: `Có đề tài đã có điểm bảo vệ. Bạn có chắc chắn muốn lưu thay đổi không?`,
                    okText: 'Đồng ý',
                    okDanger: false
                }
            }).afterClose);
            if (!confirm) { return; }
        }
        const value: any = this.formComponent.value;
        this.ok.emit({
            ...value,
            id: this.examinerCouncil?.id,
            users: this.selectedUsers || [],
            projects: this.selectedProjects || []
        });
    }
}
