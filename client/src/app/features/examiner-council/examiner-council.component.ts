import { Component, inject, ViewChild } from '@angular/core';
import { setTitle } from '../../common/utilities';
import {
    FormComponent,
    FormSelectComponent,
    FormTextComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent
} from '../../core-ui/components';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
    ExaminerCouncilState,
    selectExaminerCouncil,
    selectExaminerCouncils,
    selectIsLoading,
    selectIsVisible,
    selectPagination,
    selectProjects
} from './store/examiner-council.reducer';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { selectQueryParams } from '../../common/stores/router';
import { RO_EXAMINER_COUNCIL } from '../../common/constants';
import { Student } from '../../common/models';
import {
    createExaminerCouncil,
    deleteExaminerCouncil,
    loadAllProjects,
    loadExaminerCouncil,
    loadExaminerCouncils,
    updateExaminerCouncil,
    updateVisible
} from './store/examiner-council.actions';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ExaminerCouncilFormComponent } from './components/examiner-council-form/examiner-council-form.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CouncilPositionPipe } from './council-position.pipe';
import { HasRoleDirective } from '../../core-ui/directives';

@Component({
    selector: 'app-manager-council',
    standalone: true,
    imports: [
        ToolbarComponent,
        NzButtonModule,
        RouterLink,
        FormComponent,
        FormSelectComponent,
        FormTextComponent,
        TableComponent,
        TableColumnDirective,
        TableCellDirective,
        NzDropDownModule,
        AsyncPipe,
        NgForOf,
        NzModalModule,
        ExaminerCouncilFormComponent,
        NzTableModule,
        CouncilPositionPipe,
        NgIf,
        HasRoleDirective
    ],
    templateUrl: './examiner-council.component.html'
})
export class ExaminerCouncilComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<ExaminerCouncilState>);
    private readonly router = inject(Router);
    private readonly modal = inject(NzModalService);
    queryParams$ = this.store.select(selectQueryParams);
    examinerCouncils$ = this.store.select(selectExaminerCouncils);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    projects$ = this.store.select(selectProjects);
    examinerCouncil$ = this.store.select(selectExaminerCouncil);
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Quản lý hội đồng bảo vệ';
    url = RO_EXAMINER_COUNCIL;

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
        this.store.dispatch(loadExaminerCouncils());
    }

    onAdd() {
        this.store.dispatch(updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(loadExaminerCouncil({ payload: { id } }));
    }

    onDelete(id: number) {
        this.modal.confirm({
            nzTitle: 'Bạn có chắc chắn muốn xoá hội đồng?',
            nzClosable: false,
            nzCentered: true,
            nzOkText: 'Xoá',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.store.dispatch(deleteExaminerCouncil({ payload: { id } })),
            nzCancelText: 'Trở lại',
            nzOnCancel: () => {}
        });
    }

    onSave(value: Student) {
        this.store.dispatch(value.id
            ? updateExaminerCouncil({ payload: value })
            : createExaminerCouncil({ payload: value })
        );
    }

    onClose() {
        this.store.dispatch(updateVisible({ isVisible: false }));
    }

    onReloadProject(event: any) {
        this.store.dispatch(loadAllProjects({ payload: {...event} }));
    }
}
