import { Component, inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ConfirmComponent, ToolbarComponent } from '../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Store } from '@ngrx/store';
import { CommonActions, CommonState, selectDepartments } from '../../common/stores';
import { DepartmentState, selectDepartment, selectIsLoading, selectIsVisible, } from './store/department.reducer';
import { setTitle } from '../../common/utilities';
import { Department } from '../../common/models';
import { DepartmentFormComponent } from './components/department-form/department-form.component';
import { DepartmentActions } from './store/department.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { first } from 'rxjs';

@Component({
    selector: 'app-department-management',
    standalone: true,
    imports: [ NzButtonModule, ToolbarComponent, NgIf, AsyncPipe, NgForOf, DepartmentFormComponent ],
    templateUrl: './department-management.component.html',
})
export class DepartmentManagementComponent {
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<DepartmentState>);
    readonly #modal = inject(NzModalService)
    departments$ = this.#commonStore.select(selectDepartments);
    department$ = this.#store.select(selectDepartment);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    title = 'Danh sách khoa';

    constructor() {
        setTitle(this.title);
        this.#commonStore.dispatch(CommonActions.loadDepartments());
    }

    onAdd() {
        this.#store.dispatch(DepartmentActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.#store.dispatch(DepartmentActions.loadDepartment({ payload: { id } }));
    }

    onSave(value: Department) {
        this.#store.dispatch(value.id
            ? DepartmentActions.updateDepartment({ payload: value })
            : DepartmentActions.createDepartment({ payload: value })
        );
    }

    onCancel() {
        this.#store.dispatch(DepartmentActions.updateVisible({ isVisible: false }));
    }

    onDelete(id: number) {
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá khoa?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(DepartmentActions.deleteDepartment({ id })));
    }
}
