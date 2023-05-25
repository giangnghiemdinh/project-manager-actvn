import { Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../core-ui/components';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Router } from '@angular/router';
import { selectQueryParams } from '../../common/stores/router';
import { ProjectApproveStatuses, ProjectStatus, RO_PROJECT_APPROVE } from '../../common/constants';
import { setTitle } from '../../common/utilities';
import { ProjectStatusPipe } from '../../core-ui/pipes/project-status.pipe';
import {
    ProjectApproveState,
    selectIsLoading,
    selectIsVisible,
    selectPagination,
    selectProject,
    selectProjects
} from './store/project-approve.reducer';
import { approveProject, loadProject, loadProjects, updateVisible } from './store/project-approve.actions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ProjectApproveFormComponent } from './components/project-approve-form/project-approve-form.component';

@Component({
    selector: 'app-project-approve-management',
    standalone: true,
    imports: [ ToolbarComponent, FormComponent, FormTextComponent, FormSelectComponent, TableComponent, TableColumnDirective, NzDropDownModule, TableCellDirective, NgForOf, AsyncPipe, NgIf, ProjectStatusPipe, NgClass, NzButtonModule, ProjectApproveFormComponent, DatePipe ],
    templateUrl: './project-approve-management.component.html',
})
export class ProjectApproveManagementComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<ProjectApproveState>);
    private readonly router = inject(Router);
    queryParams$ = this.store.select(selectQueryParams);
    projects$ = this.store.select(selectProjects);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    project$ = this.store.select(selectProject);
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Quản lý đề xuất đề tài';
    url = RO_PROJECT_APPROVE;
    status = ProjectStatus;
    statuses = ProjectApproveStatuses;

    constructor() {
        setTitle(this.title);
        this.onLoad();
    }

    onSearch(value: any) {
        value.page = 1;
        this.router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onPageChanges(event: { index: number, size: number }) {
        const value: any = this.filterForm.value;
        value.page = event.index;
        value.limit = event.size;
        this.router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onLoad() {
        this.store.dispatch(loadProjects());
    }

    onApprove(id: number) {
        this.store.dispatch(loadProject({ payload: { id } }));
    }

    onSave(value: any) {
        this.store.dispatch(approveProject({ payload: value }));
    }

    onClose() {
        this.store.dispatch(updateVisible({ isVisible: false }));
    }
}
