import { Component, inject, ViewChild } from '@angular/core';
import {
    ConfirmComponent,
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    SearchStudentComponent,
    SearchUserComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../core-ui/components';
import { rankFullName, setTitle } from '../../common/utilities';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Router, RouterLink } from '@angular/router';
import { Project, ProjectImportPayload, ProjectProgress } from '../../common/models';
import { ModalType, ProjectActions } from './store/project.actions';
import {
    ProjectState,
    selectIsLoading,
    selectIsVisible,
    selectIsVisibleCouncilReview,
    selectIsVisibleImport,
    selectIsVisibleReport,
    selectIsVisibleReview,
    selectPagination,
    selectProject,
    selectProjects,
    selectReport
} from './store/project.reducer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { AsyncPipe, NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { selectQueryParams } from '../../common/stores/router';
import { HasRoleDirective } from '../../core-ui/directives';
import { ProjectStatusPipe, RankFullNamePipe } from '../../core-ui/pipes';
import { ProgressReportComponent } from './components/progress-report/progress-report.component';
import { ProjectReviewComponent } from './components/project-review/project-review.component';
import { ProjectImportComponent } from './components/project-import/project-import.component';
import { CouncilReviewComponent } from './components/council-review/council-review.component';
import { ProjectProgressType, ProjectStatus, ProjectStatuses, RO_PROJECT_MANAGER } from '../../common/constants';
import { first } from 'rxjs';
import { ExcelService, NotificationService } from '../../common/services';

@Component({
    selector: 'app-project-management',
    standalone: true,
    imports: [ ToolbarComponent, NzButtonModule, NzInputModule, NzTableModule, NzPaginationModule, NzModalModule, NzFormModule, TableColumnDirective, TableComponent, TableCellDirective, NzDropDownModule, AsyncPipe, ProjectFormComponent, SearchStudentComponent, SearchUserComponent, FormComponent, FormSelectComponent, FormTextComponent, NgForOf, NgIf, ProjectStatusPipe, NgClass, ProgressReportComponent, RouterLink, ProjectReviewComponent, ProjectImportComponent, CouncilReviewComponent, HasRoleDirective, NgTemplateOutlet, RankFullNamePipe ],
    templateUrl: './project-management.component.html',
})
export class ProjectManagementComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    @ViewChild('table') table!: TableComponent;
    
    readonly #excelService = inject(ExcelService);
    readonly #notification = inject(NotificationService);
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<ProjectState>);
    readonly #router = inject(Router);
    readonly #modal = inject(NzModalService);
    
    queryParams$ = this.#store.select(selectQueryParams);
    projects$ = this.#store.select(selectProjects);
    pagination$ = this.#store.select(selectPagination);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    isVisibleImport$ = this.#store.select(selectIsVisibleImport);
    isVisibleReport$ = this.#store.select(selectIsVisibleReport);
    isVisibleReview$ = this.#store.select(selectIsVisibleReview);
    isVisibleCouncilReview$ = this.#store.select(selectIsVisibleCouncilReview);
    project$ = this.#store.select(selectProject);
    departments$ = this.#commonStore.select(selectDepartments);
    semesters$ = this.#commonStore.select(selectSemesters);
    report$ = this.#store.select(selectReport);
    title = 'Danh sách đề tài';
    url = RO_PROJECT_MANAGER;
    isPropose = false;
    statuses = ProjectStatuses;
    status = ProjectStatus;
    states = [
        { value: 'i', label: 'Đề tài hướng dẫn' },
        { value: 'm', label: 'Đề tài quản lý' },
        { value: 'r', label: 'Đề tài chấm phản biện' },
        { value: 'c', label: 'Đề tài thuộc hội đồng' },
    ];
    progressType = ProjectProgressType;
    selectedItems: Project[] = [];

    constructor() {
        setTitle(this.title);
        this.onLoad();
    }

    onSearch(value: any) {
        value.page = 1;
        this.#router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onPageChanges(event: { index: number, size: number }) {
        const value: any = this.filterForm.value;
        value.page = event.index;
        value.limit = event.size;
        this.#router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onLoad() {
        this.#store.dispatch(ProjectActions.loadProjects());
    }

    onUpdateReport(progress: ProjectProgress) {
        this.#store.dispatch(ProjectActions.report({ payload: progress }));
    }

    onDeleteFile(event: any) {
        this.#store.dispatch(ProjectActions.deleteFile({ payload: event }));
    }

    onAdd() {
        this.isPropose = false;
        this.#store.dispatch(ProjectActions.updateVisible({ isVisible: true, modal: 'form' }));
    }

    onPropose() {
        this.isPropose = true;
        this.#store.dispatch(ProjectActions.updateVisible({ isVisible: true, modal: 'form' }));
    }

    onEdit(id: number) {
        this.isPropose = false;
        this.#store.dispatch(ProjectActions.loadProject({ payload: { id, modal: 'form' } }));
    }

    onDelete(project: Project) {
        if (!!project.managerStaff?.id) {
            this.#notification.error('Không được phép xoá đề tài đã được phân công quản lý!');
            return;
        }
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá đề tài?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(ProjectActions.deleteProject({ payload: { id: project.id! } })));
    }

    onSave(payload: Project) {
        this.#store.dispatch(payload.id
            ? ProjectActions.updateProject({ payload })
            : (this.isPropose
                ? ProjectActions.createProposeProject({ payload })
                : ProjectActions.createProject({ payload }))
        );
    }

    onReport(id: number, type: ProjectProgressType) {
        this.#store.dispatch(ProjectActions.loadReport({ payload: { id, type } }));
    }

    onCouncilReview(id: number) {
        this.#store.dispatch(ProjectActions.loadProject({ payload: { id, modal: 'council' } }));
    }

    onSaveImport(payload: ProjectImportPayload) {
        this.#store.dispatch(ProjectActions.importProject({ payload }));
    }

    onSaveReport(payload: ProjectProgress) {
        this.#store.dispatch(ProjectActions.report({ payload }));
    }

    onSaveReview(payload: ProjectProgress) {
        this.#store.dispatch(ProjectActions.review({ payload }));
    }

    onSaveCouncilReview(payload: Project) {
        this.#store.dispatch(ProjectActions.councilReview({ payload }));
    }

    onCancel(modal: ModalType) {
        this.#store.dispatch(ProjectActions.updateVisible({ isVisible: false, modal }));
    }

    onImport() {
        this.#store.dispatch(ProjectActions.updateVisible({ isVisible: true, modal: 'import' }));
    }

    onCheckedChange(event: { ids: Set<number>, data: Project[] }) {
        this.selectedItems = this.selectedItems.filter(p => event.ids.has(p.id!));
        event.ids.forEach(id => {
            if (!this.selectedItems.some(p => p.id === id)) {
                const selected = event.data.find(p => p.id === id);
                selected && this.selectedItems.push(selected);
            }
        });
    }

    onClearChecked() {
        this.table?.clearChecked();
        this.selectedItems = [];
    }

    onExport() {
        if (!this.selectedItems.length) { return; }
        const data: (string | number)[][] = [];

        for (let i = 0; i < this.selectedItems.length; i++) {
            const project = this.selectedItems[i];
            const row: (string | number)[] = [ i + 1 ];
            row.push(project.name || '');
            row.push(project.description || '');

            let requirement = `${project.requirement || ''}`;
            project.students?.forEach(s => {
                requirement += `${requirement ? '\n\n' : ''}Sinh viên: \n${s.fullName}\n${s.code}\n${s.email}\n${s.phone}`;
            });
            row.push(requirement);

            const instructor = project.instructor;
            instructor && row.push(`${rankFullName(instructor)}\n${instructor.workPlace}\n${instructor.email}\n${instructor.phone}`);

            data.push(row);
        }

        this.#excelService.export('Danh sách đề tài', [
            {
                columns: [
                    { title: 'STT', width: 5, alignment: 'center', numFmt: '#' },
                    { title: 'Đề tài', width: 30, wrapText: true },
                    { title: 'Mô tả', width: 30, wrapText: true },
                    { title: 'Yêu cầu', width: 30, wrapText: true },
                    { title: 'Người hướng dẫn', width: 25, wrapText: true },
                ],
                sheetName: 'Danh sách đề tài',
                data,
            }
        ]);
    }
}
