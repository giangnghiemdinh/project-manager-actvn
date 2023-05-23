import { Component, inject, ViewChild } from '@angular/core';
import {
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../core-ui/components';
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Router, RouterLink } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { selectQueryParams } from '../../common/stores/router';
import { RO_MANAGER_STAFF } from '../../common/constants';
import { setTitle } from '../../common/utilities';
import { Student } from '../../common/models';
import {
    ManagerStaffState,
    selectIsLoading,
    selectIsVisible,
    selectManagerStaff,
    selectManagerStaffs,
    selectPagination,
    selectProjects
} from './stores/manager-staff.reducer';
import { ManagerStaffActions } from './stores/manager-staff.actions';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ManagerStaffFormComponent } from './components/manager-staff-form/manager-staff-form.component';
import { HasRoleDirective } from '../../core-ui/directives';

@Component({
    selector: 'app-manager-staff',
    standalone: true,
    imports: [
        AsyncPipe,
        FormComponent,
        FormSelectComponent,
        FormTextComponent,
        NzButtonModule,
        TableCellDirective,
        TableColumnDirective,
        TableComponent,
        ToolbarComponent,
        RouterLink,
        NzModalModule,
        NgForOf,
        NzDividerModule,
        NgIf,
        ManagerStaffFormComponent,
        HasRoleDirective
    ],
    templateUrl: './manager-staff.component.html',
})
export class ManagerStaffComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<ManagerStaffState>);
    private readonly router = inject(Router);
    private readonly modal = inject(NzModalService);
    queryParams$ = this.store.select(selectQueryParams);
    managerStaffs$ = this.store.select(selectManagerStaffs);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    projects$ = this.store.select(selectProjects);
    managerStaff$ = this.store.select(selectManagerStaff);
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Danh sách GV Quản lý';
    url = RO_MANAGER_STAFF;

    constructor() {
        setTitle(this.title);
        this.onLoad();
    }

    onSearch() {
        const value: any = this.filterForm.value;
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
        this.store.dispatch(ManagerStaffActions.loadManagerStaffs());
    }

    onAdd() {
        this.store.dispatch(ManagerStaffActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(ManagerStaffActions.loadManagerStaff({ payload: { id } }));
    }

    onDelete(id: number) {
        this.modal.confirm({
            nzTitle: 'Bạn có chắc chắn muốn xoá nhóm quản lý?',
            nzClosable: false,
            nzCentered: true,
            nzOkText: 'Xoá',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.store.dispatch(ManagerStaffActions.deleteManagerStaff({ payload: { id } })),
            nzCancelText: 'Trở lại',
            nzOnCancel: () => {}
        });
    }

    onSave(value: Student) {
        this.store.dispatch(value.id
            ? ManagerStaffActions.updateManagerStaff({ payload: value })
            : ManagerStaffActions.createManagerStaff({ payload: value })
        );
    }

    onClose() {
        this.store.dispatch(ManagerStaffActions.updateVisible({ isVisible: false }));
    }

    onReloadProject(event: any) {
        this.store.dispatch(ManagerStaffActions.loadAllProjects({ payload: event }));
    }
}
