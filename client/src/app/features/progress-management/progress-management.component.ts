import { Component, inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { setTitle } from '../../common/utilities';
import { Progress } from '../../common/models';
import {
    ProgressState,
    selectIsLoading,
    selectIsVisible,
    selectPagination,
    selectProgress,
    selectProgresses
} from './store/progress.reducer';
import {
    createProgress,
    deleteProgress,
    loadProgress,
    loadProgresses,
    updateProgress,
    updateVisible
} from './store/progress.actions';
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
import { AsyncPipe, DatePipe } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ProgressFormComponent } from './components/progress-form/progress-form.component';
import { selectQueryParams } from '../../common/stores/router';
import { RO_PROGRESS_MANAGER } from '../../common/constants';

@Component({
    selector: 'app-progress-management',
    standalone: true,
    imports: [
        ToolbarComponent,
        NzButtonModule,
        FormComponent,
        FormTextComponent,
        TableComponent,
        AsyncPipe,
        TableColumnDirective,
        TableCellDirective,
        NzDropDownModule,
        DatePipe,
        ProgressFormComponent,
        FormSelectComponent,
    ],
    templateUrl: './progress-management.component.html',
})
export class ProgressManagementComponent {

    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<ProgressState>);
    private readonly router = inject(Router);
    private readonly modal = inject(NzModalService);
    queryParams$ = this.store.select(selectQueryParams);
    progresses$ = this.store.select(selectProgresses);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    progress$ = this.store.select(selectProgress);
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Quản lý tiến độ';
    url = RO_PROGRESS_MANAGER;

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
        this.store.dispatch(loadProgresses());
    }

    onAdd() {
        this.store.dispatch(updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(loadProgress({ payload: { id } }));
    }

    onDelete(id: number) {
        this.modal.confirm({
            nzTitle: 'Bạn có chắc chắn muốn xoá tiến độ?',
            nzClosable: false,
            nzCentered: true,
            nzOkText: 'Xoá',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.store.dispatch(deleteProgress({ payload: { id } })),
            nzCancelText: 'Trở lại',
            nzOnCancel: () => {}
        });
    }

    onSave(value: Progress) {
        this.store.dispatch(value.id
            ? updateProgress({ payload: value })
            : createProgress({ payload: value })
        );
    }

    onClose() {
        this.store.dispatch(updateVisible({ isVisible: false }));
    }
}
