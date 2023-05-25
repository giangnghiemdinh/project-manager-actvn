import { Component, inject, ViewChild } from '@angular/core';
import {
    ConfirmComponent,
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../core-ui/components';
import { setTitle } from '../../common/utilities';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Store } from '@ngrx/store';
import {
    selectIsLoading,
    selectIsVisible,
    selectIsVisibleImport,
    selectPagination,
    selectStudent,
    selectStudents,
    StudentState
} from './store/student.reducer';
import {
    createStudent,
    deleteStudent,
    loadStudent,
    loadStudents,
    updateStudent,
    updateVisible,
    updateVisibleImport
} from './store/student.actions';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Student } from '../../common/models';
import { GenderPipe } from '../../core-ui/pipes';
import { CommonState, selectDepartments } from '../../common/stores';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { selectQueryParams } from '../../common/stores/router';
import { RO_STUDENT_MANAGER } from '../../common/constants';
import { StudentImportComponent } from './components/student-import/student-import.component';
import { first } from 'rxjs';

@Component({
    selector: 'app-student-management',
    standalone: true,
    imports: [
        ToolbarComponent,
        NzButtonModule,
        NzInputModule,
        NzTableModule,
        NzPaginationModule,
        AsyncPipe,
        NgForOf,
        NgIf,
        GenderPipe,
        StudentFormComponent,
        NzDropDownModule,
        FormComponent,
        FormTextComponent,
        TableComponent,
        TableColumnDirective,
        TableCellDirective,
        FormSelectComponent,
        StudentImportComponent
    ],
    templateUrl: './student-management.component.html',
})
export class StudentManagementComponent {

    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<StudentState>);
    private readonly router = inject(Router);
    private readonly modal = inject(NzModalService);
    queryParams$ = this.store.select(selectQueryParams);
    students$ = this.store.select(selectStudents);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    isVisibleImport$ = this.store.select(selectIsVisibleImport);
    student$ = this.store.select(selectStudent);
    departments$ = this.commonStore.select(selectDepartments);
    title = 'Quản lý sinh viên';
    url = RO_STUDENT_MANAGER;

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
        this.store.dispatch(loadStudents());
    }

    onAdd() {
        this.store.dispatch(updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(loadStudent({ payload: { id } }));
    }

    onDelete(id: number) {
        const ref = this.modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá sinh viên?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.store.dispatch(deleteStudent({ payload: { id } })));
    }

    onSave(value: Student) {
        this.store.dispatch(value.id
            ? updateStudent({ payload: value })
            : createStudent({ payload: value })
        );
    }

    onClose() {
        this.store.dispatch(updateVisible({ isVisible: false }));
    }

    onImport() {
        this.store.dispatch(updateVisibleImport({ isVisible: true }));
    }

    onCloseImport() {
        this.store.dispatch(updateVisibleImport({ isVisible: false }));
    }

    onSaveImport(value: any) {

    }

}
