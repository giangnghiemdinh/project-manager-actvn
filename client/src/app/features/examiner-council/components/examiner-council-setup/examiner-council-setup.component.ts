import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import {
    ConfirmComponent,
    FormComponent,
    FormSelectComponent,
    SearchProjectComponent,
    SearchUserComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../../../core-ui/components';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExaminerCouncil, ExaminerCouncilUser, Project, User } from '../../../../common/models';
import { DriverUrlPipe, RankFullNamePipe, RankPipe } from '../../../../core-ui/pipes';
import { Store } from '@ngrx/store';
import {
    ExaminerCouncilState,
    selectIsLoaded,
    selectIsLoading,
    selectProjects
} from '../../store/examiner-council.reducer';
import { filter, first, take, withLatestFrom } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NotificationService } from '../../../../common/services';
import { CommonState, selectDepartments, selectSemesters } from '../../../../common/stores';
import { rankFullName, setTitle } from '../../../../common/utilities';
import { chunk, cloneDeep, shuffle, uniqBy } from 'lodash';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import {
    ExaminerCouncilPosition,
    ExaminerCouncilPositions,
    ProjectStatus,
    RO_EXAMINER_COUNCIL
} from '../../../../common/constants';
import { RouterLink } from '@angular/router';
import { CouncilPositionPipe } from '../../council-position.pipe';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ExaminerCouncilActions } from '../../store/examiner-council.actions';
import { FooterDirective } from '../../../../core-ui/directives';

@Component({
    selector: 'app-manager-council-setup',
    standalone: true,
    imports: [
        ToolbarComponent,
        NzTableModule,
        NgForOf,
        NzFormModule,
        NzSelectModule,
        NzButtonModule,
        NzInputNumberModule,
        NgIf,
        NzRadioModule,
        FormsModule,
        TableComponent,
        TableColumnDirective,
        DriverUrlPipe,
        SearchUserComponent,
        SearchProjectComponent,
        NzAvatarModule,
        NzToolTipModule,
        NzModalModule,
        ReactiveFormsModule,
        FormComponent,
        FormSelectComponent,
        AsyncPipe,
        TableCellDirective,
        NzSpinModule,
        RouterLink,
        CouncilPositionPipe,
        NzInputModule,
        RankFullNamePipe,
        RankPipe,
        FooterDirective
    ],
    templateUrl: './examiner-council-setup.component.html',
})
export class ExaminerCouncilSetupComponent {

    readonly #store = inject(Store<ExaminerCouncilState>);
    readonly #commonStore = inject(Store<CommonState>);
    readonly #notification = inject(NotificationService);
    readonly #modal = inject(NzModalService);

    @ViewChild('form') formComponent!: FormComponent;
    @ViewChild('confirmContent') confirmContent!: TemplateRef<any>;
    departments$ = this.#commonStore.select(selectDepartments);
    semesters$ = this.#commonStore.select(selectSemesters);
    projects$ = this.#store.select(selectProjects);
    isLoading$ = this.#store.select(selectIsLoading);

    title = 'Thành lập danh sách hội đồng';
    urlExaminerCouncil = RO_EXAMINER_COUNCIL;

    isVisibleSearchUser = false;
    isVisibleSearchProject = false;
    currentGroupIndex = 0;
    hiddenIds: number[] = [];
    currentDepartment = 0;
    currentSemester = 0;
    groups: {
        location: string,
        users: ExaminerCouncilUser[],
        projects: Project[]
    }[] = [];
    editId: number | null = null;
    editLocationId: number | null = null;
    positions = ExaminerCouncilPositions;

    constructor() {
        setTitle(this.title);
    }

    onSave() {
        const payload: ExaminerCouncil[] = [];
        for (let i = 0; i < this.groups.length; i++) {
            const group = this.groups[i];
            if (!group.users.length) {
                this.#notification.error(`Vui lòng chọn thành viên cho hội đồng ${ i + 1 }`);
                return;
            }
            if (!group.projects.length) {
                this.#notification.error(`Vui lòng chọn đề tài cho hội đồng ${ i + 1 }`);
                return;
            }
            if (!group.location) {
                this.#notification.error(`Vui lòn nhập địa điểm cho hội đồng ${ i + 1 }`);
                return;
            }
            const chairPersonLength = group.users
                .filter(u => u.position === ExaminerCouncilPosition.CHAIRPERSON).length;
            if (chairPersonLength > 1) {
                this.#notification.error(`Hội đồng ${ i + 1 } có tối đa 01 chủ tịch!`);
                return;
            }
            if (!chairPersonLength) {
                this.#notification.error(`Vui lòng chọn chủ tịch cho hội đồng ${ i + 1 }`);
                return;
            }

            const adSecretaryLength = group.users
                .filter(u => u.position === ExaminerCouncilPosition.ADMINISTRATIVE_SECRETARY).length;
            if (adSecretaryLength > 1) {
                this.#notification.error(`Hội đồng ${ i + 1 } có tối đa 01 thư ký hành chính!`);
                return;
            }
            if (!adSecretaryLength) {
                this.#notification.error(`Vui lòng chọn thư ký hành chính cho hội đồng ${ i + 1 }`);
                return;
            }

            const secretaryLength = group.users
                .filter(u => u.position === ExaminerCouncilPosition.SECRETARY).length;
            if (secretaryLength > 1) {
                this.#notification.error(`Hội đồng ${ i + 1 } có tối đa 01 thư ký!`);
                return;
            }
            if (!secretaryLength) {
                this.#notification.error(`Vui lòng chọn thư ký cho hội đồng ${ i + 1 }`);
                return;
            }

            for (let i = 0; i < this.groups.length; i++) {
                for (let j = i + 1; j < this.groups.length; j++) {
                    const groupA = this.groups[i];
                    const groupB = this.groups[j];
                    const duplicated = groupA.users
                        .filter(a => groupB.users.some(b => b.userId === a.userId))
                        .map(u => rankFullName(u.user));

                    if (duplicated.length) {
                        this.#notification.error(`GV ${duplicated.join(', ')} nhóm ${i + 1} trùng với nhóm ${j + 1}. Vui lòng kiểm tra lại!`);
                        return;
                    }
                }
            }

            payload.push({
                semesterId: this.currentSemester,
                departmentId: this.currentDepartment,
                location: group.location,
                projects: group.projects,
                users: group.users
            });
        }
        this.#store.dispatch(ExaminerCouncilActions.createMultipleExaminerCouncil({ payload }));
    }

    onSearchUser(groupIndex: number) {
        if (this.groups[groupIndex].users.length >= 6) {
            return;
        }
        this.currentGroupIndex = groupIndex;
        this.isVisibleSearchUser = true;
    }

    onSelectUser(users: User[]) {
        if (!users.length) {
            return;
        }
        const newUsers = users
            .map(u => ( { user: u, userId: u.id, position: ExaminerCouncilPosition.MEMBER } ));
        this.groups[this.currentGroupIndex].users = ( uniqBy([ ...this.groups[this.currentGroupIndex].users, ...newUsers ], 'userId') ).slice(0, 6);
    }

    onSearchProject(groupIndex: number) {
        this.currentGroupIndex = groupIndex;
        this.hiddenIds = [];
        this.groups.forEach(g => {
            this.hiddenIds = [ ...this.hiddenIds, ...g.projects.map(p => p.id!) ];
        });
        this.isVisibleSearchProject = true;
    }

    onSelectProject(projects: Project[]) {
        const currentGroup = this.groups[this.currentGroupIndex];
        currentGroup.projects = [ ...currentGroup.projects, ...projects ];
    }

    onAddGroup() {
        this.groups.push({
            location: '',
            users: [],
            projects: []
        });
    }

    onRemoveGroup(index: number) {
        this.groups.splice(index, 1);
    }

    onRemoveProject(index: number, projectId: number) {
        this.groups[index].projects = this.groups[index].projects.filter(p => p.id !== projectId);
    }

    onRemoveUser(index: number, userId: number) {
        this.groups[index].users = this.groups[index].users.filter(p => p.userId !== userId);
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
                        this.groups = [];
                        this.currentDepartment = departmentId.value;
                        this.currentSemester = semesterId.value;
                        this.getAllProjects();
                        form.markAsPristine();
                        return;
                    }
                    departmentId.setValue(this.currentDepartment);
                    semesterId.setValue(this.currentSemester);
                });
            return;
        }
        if (departmentId.value && semesterId.value) {
            this.currentDepartment = departmentId.value;
            this.currentSemester = semesterId.value;
            this.getAllProjects();
            form.markAsPristine();
        }
    }

    private getAllProjects() {
        this.#store.dispatch(ExaminerCouncilActions.loadAllProject({
            payload: {
                departmentId: this.currentDepartment,
                semesterId: this.currentSemester,
                state: 'cne',
                status: ProjectStatus.IN_REVIEW
            }
        }));
        this.#store.select(selectIsLoaded)
            .pipe(
                filter<boolean>(isLoaded => isLoaded),
                take(1),
                withLatestFrom(this.#store.select(selectProjects))
            ).subscribe(([ _, projects ]) => {
            if (!projects.length) {
                this.#notification.warning('Không còn đề tài nào chưa có hội đồng.');
                this.formComponent?.markAsDirty();
                return;
            }
            const ref = this.#modal.create({
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
                    if (!params) {
                        this.formComponent?.markAsDirty();
                        return;
                    }
                    if (!params.type) {
                        this.onRandomCouncil(params.projectPerGroup);
                        return;
                    }
                    this.groups = [ { location: '', users: [], projects: [] } ];
                })
        })
    }

    onRandomCouncil(projectPerGroup: number) {
        this.projects$
            .pipe(take(1))
            .subscribe(projects => {
                const projectGroups = chunk(shuffle(projects), projectPerGroup);
                this.groups = [];
                for (const group of projectGroups) {
                    this.groups.push({
                        location: '',
                        users: [],
                        projects: cloneDeep(group)
                    })
                }
            });
    }
}
