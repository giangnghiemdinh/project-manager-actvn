import { Component, inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ToolbarComponent } from '../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Store } from '@ngrx/store';
import { CommonActions, CommonState, selectDepartments } from '../../common/stores';
import { DepartmentState, selectDepartment, selectIsLoading, selectIsVisible, } from './store/department.reducer';
import { setTitle } from '../../common/utilities';
import { Department } from '../../common/models';
import { createDepartment, loadDepartment, updateDepartment, updateVisible } from './store/department.actions';
import { DepartmentFormComponent } from './components/department-form/department-form.component';

@Component({
    selector: 'app-department-management',
    standalone: true,
    imports: [ NzButtonModule, ToolbarComponent, NgIf, AsyncPipe, NgForOf, DepartmentFormComponent ],
    templateUrl: './department-management.component.html',
})
export class DepartmentManagementComponent {
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<DepartmentState>);
    departments$ = this.commonStore.select(selectDepartments);
    department$ = this.store.select(selectDepartment);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    title = 'Quản lý khoa';

    constructor() {
        setTitle(this.title);
        this.commonStore.dispatch(CommonActions.loadDepartments());
    }

    onAdd() {
        this.store.dispatch(updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(loadDepartment({ payload: { id } }));
    }

    onSave(value: Department) {
        this.store.dispatch(value.id
            ? updateDepartment({ payload: value })
            : createDepartment({ payload: value })
        );
    }

    onCancel() {
        this.store.dispatch(updateVisible({ isVisible: false }));
    }
}
