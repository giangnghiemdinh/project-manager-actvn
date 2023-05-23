import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
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
import { ProjectStatus } from '../../../../common/constants/project.constant';
import { ExaminerCouncilPosition, ExaminerCouncilPositions } from '../../../../common/constants/user.constant';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CouncilPositionPipe } from '../../council-position.pipe';

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
    ],
    templateUrl: './examiner-council-form.component.html',
})
export class ExaminerCouncilFormComponent implements OnChanges {
    private readonly notification = inject(NotificationService);
    private readonly modal = inject(NzModalService);
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
        const { examinerCouncil } = changes;
        if (examinerCouncil) {
            if (this.examinerCouncil) {
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
            } else {
                this.data = null;
                this.currentDepartment = 0;
                this.currentSemester = 0;
                this.selectedUsers = [];
                this.selectedProjects = [];
            }
        }
    }

    onDepartmentOrSemesterChanges(event: { form: FormGroup }) {
        const { departmentId, semesterId } = event.form.controls;
        if (this.selectedProjects.length && this.currentDepartment && this.currentSemester
            && departmentId.value && semesterId.value
            && (this.currentDepartment !== departmentId.value
                || this.currentSemester !== semesterId.value)) {
            this.modal.confirm({
                nzTitle: '',
                nzContent: 'Bạn đã thay đổi khoa hoặc học kỳ. Bạn có muốn chọn lại danh sách?',
                nzOkText: 'Có',
                nzCentered: true,
                nzMaskClosable: false,
                nzOkType: 'primary',
                nzOkDanger: true,
                nzOnOk: () => {
                    this.selectedProjects = [];
                    this.currentDepartment = departmentId.value;
                    this.currentSemester = semesterId.value;
                    this.reloadProject();
                },
                nzCancelText: 'Không',
                nzOnCancel: () => {
                    departmentId.setValue(this.currentDepartment);
                    semesterId.setValue(this.currentSemester);
                }
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
        if (this.selectedUsers.length >= 5) { return; }
        this.isVisibleSearchUser = true;
    }

    onSearchProject() {
        if (!this.currentDepartment || !this.currentSemester) {
            this.notification.error('Vui lòng chọn khoa và học kỳ!');
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

    onRemoveProject(id: number) {
        this.selectedProjects = this.selectedProjects.filter(p => p.id !== id);
    }

    onRemoveUser(userId: number) {
        this.selectedUsers = this.selectedUsers.filter(p => p.userId !== userId);
    }

    onSelectUser(users: User[]) {
        if (!users.length) { return; }
        const newUsers = users
            .map(u => ({ user: u, userId: u.id, position: ExaminerCouncilPosition.MEMBER}));
        this.selectedUsers = (uniqBy([...this.selectedUsers, ...newUsers], 'userId')).slice(0, 5);
    }

    onClose() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        if (!this.selectedUsers.length) {
            this.notification.error('Vui lòng chọn thành viên hội đồng!');
            return;
        }
        const chairPersonLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.CHAIRPERSON).length;
        if (chairPersonLength > 1) {
            this.notification.error('Hội đồng có tối đa 01 chủ tịch!');
            return;
        }
        if (!chairPersonLength) {
            this.notification.error('Vui lòng chọn chủ tịch!');
            return;
        }

        const adSecretaryLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.ADMINISTRATIVE_SECRETARY).length;
        if (adSecretaryLength > 1) {
            this.notification.error('Hội đồng có tối đa 01 thư ký hành chính!');
            return;
        }
        if (!adSecretaryLength) {
            this.notification.error('Vui lòng chọn thư ký hành chính!');
            return;
        }

        const secretaryLength = this.selectedUsers
            .filter(u => u.position === ExaminerCouncilPosition.SECRETARY).length;
        if (secretaryLength > 1) {
            this.notification.error('Hội đồng có tối đa 01 thư ký!');
            return;
        }
        if (!secretaryLength) {
            this.notification.error('Vui lòng chọn thư ký!');
            return;
        }

        if (!this.selectedProjects.length) {
            this.notification.error('Vui lòng chọn danh sách đề tài!');
            return;
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
