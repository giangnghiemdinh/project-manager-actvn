import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonActions, CommonState, selectSemesters } from '../../common/stores';
import { setTitle } from '../../common/utilities';
import { Department } from '../../common/models';
import { selectIsLoading, selectIsVisible, selectSemester, SemesterState } from './store/semester.reducer';
import { SemesterActions } from './store/semester.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ConfirmComponent, ToolbarComponent } from '../../core-ui/components';
import { SemesterFormComponent } from './components/semester-form/semester-form.component';
import { DepartmentFormComponent } from '../department-management/components/department-form/department-form.component';
import { first } from 'rxjs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

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
        DepartmentFormComponent,
        NgClass,
        NzToolTipModule
    ],
    templateUrl: './semester-management.component.html',
    providers: [ NzModalService ]
})
export class SemesterManagementComponent {
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<SemesterState>);
    readonly #modal = inject(NzModalService);
    semesters$ = this.#commonStore.select(selectSemesters);
    semester$ = this.#store.select(selectSemester);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    title = 'Quản lý học kỳ';

    constructor() {
        setTitle(this.title);
        this.#commonStore.dispatch(CommonActions.loadSemesters());
    }

    onAdd() {
        this.#store.dispatch(SemesterActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.#store.dispatch(SemesterActions.loadSemester({ payload: { id } }));
    }

    onSave(value: Department) {
        this.#store.dispatch(value.id
            ? SemesterActions.updateSemester({ payload: value })
            : SemesterActions.createSemester({ payload: value })
        );
    }

    onDelete(id: number) {
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá học kỳ?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(SemesterActions.deleteSemester({ id })));
    }

    onCancel() {
        this.#store.dispatch(SemesterActions.updateVisible({ isVisible: false }));
    }

    onLock(id: number) {
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Sau khi khoá, học kỳ và tất cả đồ án, danh sách GV quản lý, GV phản biện, hội đồng thuộc học kỳ sẽ không thể chỉnh sửa. Bạn có chắc chắn muốn khoá học kỳ?`,
                okText: 'Khoá',
                okDanger: false
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(SemesterActions.lockSemester({ id })));
    }
}
