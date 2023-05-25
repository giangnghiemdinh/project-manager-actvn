import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../../common/services';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
    FormComponent,
    FormSelectComponent,
    SearchProjectComponent,
    SearchUserComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../../../core-ui/components';
import { CommonState, selectDepartments, selectSemesters } from '../../../../common/stores';
import { RO_REVIEWER_STAFF } from '../../../../common/constants';
import { Project, ReviewerStaff, User } from '../../../../common/models';
import { setTitle } from '../../../../common/utilities';
import { FormGroup, FormsModule } from '@angular/forms';
import { filter, take, withLatestFrom } from 'rxjs';
import { chunk, cloneDeep, shuffle } from 'lodash';
import {
    ReviewerStaffState,
    selectIsLoaded,
    selectIsLoading,
    selectProjects
} from '../../stores/reviewer-staff.reducer';
import { ReviewerStaffActions } from '../../stores/reviewer-staff.actions';
import { DriverUrlPipe } from '../../../../core-ui/pipes';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-reviewer-staff-mass',
    standalone: true,
    imports: [
        AsyncPipe,
        DriverUrlPipe,
        FormComponent,
        FormSelectComponent,
        NgForOf,
        NgIf,
        NzAvatarModule,
        NzButtonModule,
        NzFormModule,
        NzGridModule,
        NzInputNumberModule,
        NzRadioModule,
        NzSpinModule,
        NzToolTipModule,
        SearchProjectComponent,
        SearchUserComponent,
        TableCellDirective,
        TableColumnDirective,
        TableComponent,
        ToolbarComponent,
        RouterLink,
        FormsModule
    ],
    templateUrl: './reviewer-staff-mass.component.html',
})
export class ReviewerStaffMassComponent {
    private readonly store = inject(Store<ReviewerStaffState>);
    private readonly commonStore = inject(Store<CommonState>);
    private readonly notification = inject(NotificationService);
    private readonly modal = inject(NzModalService);

    @ViewChild('form') formComponent!: FormComponent;
    @ViewChild('confirmContent') confirmContent!: TemplateRef<any>;
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    projects$ = this.store.select(selectProjects);
    isLoading$ = this.store.select(selectIsLoading);

    title = 'Thành lập danh sách';
    urlReviewerStaff = RO_REVIEWER_STAFF;

    isVisibleSearchUser = false;
    isVisibleSearchProject = false;
    currentGroupIndex = 0;
    hiddenIds: number[] = [];
    currentDepartment = 0;
    currentSemester = 0;
    groups: {
        user?: User,
        projects: Project[]
    }[] = [];

    constructor() {
        setTitle(this.title);
    }

    onSave() {
        if (this.groups.some(g => !g.user)) {
            this.notification.error('Có nhóm chưa chọn GV phản biện. Vui lòng kiểm tra lại!');
            return;
        }
        if (this.groups.some(g => !g.projects.length)) {
            this.notification.error('Có nhóm chưa chọn đề tài. Vui lòng kiểm tra lại!');
            return;
        }
        const payload: ReviewerStaff[] = [];
        for (let i = 0; i < this.groups.length; i++) {
            const group = this.groups[i];
            payload.push({
                semesterId: this.currentSemester,
                departmentId: this.currentDepartment,
                projects: group.projects,
                userId: group.user?.id
            });
        }
        this.store.dispatch(ReviewerStaffActions.createMultipleReviewerStaff({ payload }));
    }

    onSearchUser(groupIndex: number) {
        this.currentGroupIndex = groupIndex;
        this.isVisibleSearchUser = true;
    }

    onSelectUser(users: User[]) {
        if (!users.length) {
            return;
        }
        const [ user ] = users;
        this.groups[this.currentGroupIndex].user = user;
    }

    onSearchProject(groupIndex: number) {
        this.currentGroupIndex = groupIndex;
        this.groups.forEach(g => {
            this.hiddenIds = [ ...this.hiddenIds, ...g.projects.map(p => p.id!) ];
        });
        this.isVisibleSearchProject = true;
    }

    onSelectProject(projects: Project[]) {
        if (!projects.length) {
            return;
        }
        const currentGroup = this.groups[this.currentGroupIndex];
        currentGroup.projects = [ ...currentGroup.projects, ...projects ];
    }

    onAddGroup() {
        this.groups.push({ projects: [] });
    }

    onRemoveGroup(index: number) {
        this.groups.splice(index, 1);
    }

    onRemoveProject(index: number, projectId: number) {
        this.groups[index].projects = this.groups[index].projects.filter(p => p.id !== projectId);
    }

    async onLoadingProjects(form: FormGroup) {
        if (!form.valid) {
            form.markAllAsTouched();
            return;
        }
        const { departmentId, semesterId } = form.controls;
        if (this.groups.some(g => g.projects.length) && this.currentDepartment && this.currentSemester
            && departmentId.value && semesterId.value
            && ( this.currentDepartment !== departmentId.value
                || this.currentSemester !== semesterId.value )) {
            this.modal.confirm({
                nzTitle: '',
                nzContent: 'Bạn đã thay đổi khoa hoặc học kỳ. Bạn có muốn thiết lập lại danh sách?',
                nzOkText: 'Có',
                nzCentered: true,
                nzMaskClosable: false,
                nzOkType: 'primary',
                nzOkDanger: true,
                nzOnOk: () => {
                    this.groups = [];
                    this.currentDepartment = departmentId.value;
                    this.currentSemester = semesterId.value;
                    this.getAllProjects();
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
            this.getAllProjects();
        }
    }

    private getAllProjects() {
        this.store.dispatch(ReviewerStaffActions.loadAllProjects({
            payload: {
                departmentId: this.currentDepartment,
                semesterId: this.currentSemester,
                state: 'rne'
            }
        }));
        this.store.select(selectIsLoaded)
            .pipe(
                filter<boolean>(isLoaded => isLoaded),
                take(1),
                withLatestFrom(this.store.select(selectProjects))
            ).subscribe(([ _, projects ]) => {
            if (!projects.length) {
                this.notification.warning('Không còn đề tài nào chưa có nhóm.');
                return;
            }
            const ref = this.modal.create({
                nzContent: this.confirmContent,
                nzFooter: null,
                nzMaskClosable: false,
                nzClosable: true,
                nzCentered: true,
                nzComponentParams: {
                    type: 0,
                    projectPerGroup: 1
                }
            });
            ref.afterClose
                .pipe(take(1))
                .subscribe(params => {
                    if (!params.type) {
                        this.onRandomStaff(params.projectPerGroup);
                        return;
                    }
                    this.groups = [ { projects: [] } ];
                })
        })
    }

    onRandomStaff(projectPerGroup: number) {
        this.projects$
            .pipe(take(1))
            .subscribe(projects => {
                const projectGroups = chunk(shuffle(projects), projectPerGroup);
                this.groups = [];
                for (const group of projectGroups) {
                    this.groups.push({ projects: cloneDeep(group) });
                }
            });
    }
}
