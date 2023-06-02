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
import { StudentActions } from './store/student.actions';

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
    
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<StudentState>);
    readonly #router = inject(Router);
    readonly #modal = inject(NzModalService);
    
    queryParams$ = this.#store.select(selectQueryParams);
    students$ = this.#store.select(selectStudents);
    pagination$ = this.#store.select(selectPagination);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    isVisibleImport$ = this.#store.select(selectIsVisibleImport);
    student$ = this.#store.select(selectStudent);
    departments$ = this.#commonStore.select(selectDepartments);
    title = 'Danh sách sinh viên';
    url = RO_STUDENT_MANAGER;

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
        this.#store.dispatch(StudentActions.loadStudents());
    }

    onAdd() {
        this.#store.dispatch(StudentActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.#store.dispatch(StudentActions.loadStudent({ payload: { id } }));
    }

    onDelete(id: number) {
        const ref = this.#modal.create({
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
                && this.#store.dispatch(StudentActions.deleteStudent({ payload: { id } })));
    }

    onSave(value: Student) {
        this.#store.dispatch(value.id
            ? StudentActions.updateStudent({ payload: value })
            : StudentActions.createStudent({ payload: value })
        );
    }

    onCancel() {
        this.#store.dispatch(StudentActions.updateVisible({ isVisible: false }));
    }

    onImport() {
        this.#store.dispatch(StudentActions.updateVisibleImport({ isVisible: true }));
    }

    onCancelImport() {
        this.#store.dispatch(StudentActions.updateVisibleImport({ isVisible: false }));
    }

    onSaveImport(payload: any) {
        this.#store.dispatch(StudentActions.importStudent({ payload }));
    }

}
