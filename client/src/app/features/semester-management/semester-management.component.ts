import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonActions, CommonState, selectSemesters } from '../../common/stores';
import { setTitle } from '../../common/utilities';
import { Department } from '../../common/models';
import { selectIsLoading, selectIsVisible, selectSemester, SemesterState } from './store/semester.reducer';
import { SemesterActions } from './store/semester.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ToolbarComponent } from '../../core-ui/components';
import { SemesterFormComponent } from './components/semester-form/semester-form.component';
import { DepartmentFormComponent } from '../department-management/components/department-form/department-form.component';

@Component({
    selector: 'app-semester-management',
    standalone: true,
    imports: [
        AsyncPipe,
        NgForOf,
        NgIf,
        NzButtonModule,
        ToolbarComponent,
        DatePipe,
        SemesterFormComponent,
        DepartmentFormComponent
    ],
    templateUrl: './semester-management.component.html',
    providers: [ NzModalService ]
})
export class SemesterManagementComponent {
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<SemesterState>);
    private readonly modal = inject(NzModalService);
    semesters$ = this.commonStore.select(selectSemesters);
    semester$ = this.store.select(selectSemester);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    title = 'Quản lý học kỳ';

    constructor() {
        setTitle(this.title);
        this.commonStore.dispatch(CommonActions.loadSemesters());
    }

    onAdd() {
        this.store.dispatch(SemesterActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(SemesterActions.loadSemester({ payload: { id } }));
    }

    onSave(value: Department) {
        this.store.dispatch(value.id
            ? SemesterActions.updateSemester({ payload: value })
            : SemesterActions.createSemester({ payload: value })
        );
    }

    onDelete(id: number) {
        this.modal.confirm({
            nzTitle: `Bạn có chắc chắn muốn xoá học kỳ?`,
            nzClosable: false,
            nzCentered: true,
            nzOkText: 'Đồng ý',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.store.dispatch(SemesterActions.deleteSemester({ id })),
            nzCancelText: 'Trở lại',
            nzOnCancel: () => {}
        });
    }

    onClose() {
        this.store.dispatch(SemesterActions.updateVisible({ isVisible: false }));
    }
}
