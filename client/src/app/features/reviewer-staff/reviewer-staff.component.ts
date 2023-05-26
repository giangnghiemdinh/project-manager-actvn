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
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Router, RouterLink } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { selectQueryParams } from '../../common/stores/router';
import { RO_REVIEWER_STAFF } from '../../common/constants';
import { setTitle } from '../../common/utilities';
import { Student } from '../../common/models';
import {
    ReviewerStaffState,
    selectIsLoading,
    selectIsVisible,
    selectPagination,
    selectProjects,
    selectReviewerStaff,
    selectReviewerStaffs
} from './stores/reviewer-staff.reducer';
import { ReviewerStaffActions } from './stores/reviewer-staff.actions';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ReviewerStaffFormComponent } from './components/reviewer-staff-form/reviewer-staff-form.component';
import { HasRoleDirective } from '../../core-ui/directives';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { first } from 'rxjs';

@Component({
    selector: 'app-reviewer-staff',
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
        ReviewerStaffFormComponent,
        HasRoleDirective,
        NzDropDownModule
    ],
    templateUrl: './reviewer-staff.component.html',
})
export class ReviewerStaffComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    private readonly commonStore = inject(Store<CommonState>);
    private readonly store = inject(Store<ReviewerStaffState>);
    private readonly router = inject(Router);
    private readonly modal = inject(NzModalService);
    queryParams$ = this.store.select(selectQueryParams);
    reviewerStaffs$ = this.store.select(selectReviewerStaffs);
    pagination$ = this.store.select(selectPagination);
    isLoading$ = this.store.select(selectIsLoading);
    isVisible$ = this.store.select(selectIsVisible);
    projects$ = this.store.select(selectProjects);
    reviewerStaff$ = this.store.select(selectReviewerStaff);
    departments$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Danh sách GV Phản biện';
    url = RO_REVIEWER_STAFF;

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
        this.store.dispatch(ReviewerStaffActions.loadReviewerStaffs());
    }

    onAdd() {
        this.store.dispatch(ReviewerStaffActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.store.dispatch(ReviewerStaffActions.loadReviewerStaff({ payload: { id } }));
    }

    onDelete(id: number) {
        const ref = this.modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá nhóm phản biện?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.store.dispatch(ReviewerStaffActions.deleteReviewerStaff({ payload: { id } })));
    }

    onSave(value: Student) {
        this.store.dispatch(value.id
            ? ReviewerStaffActions.updateReviewerStaff({ payload: value })
            : ReviewerStaffActions.createReviewerStaff({ payload: value })
        );
    }

    onCancel() {
        this.store.dispatch(ReviewerStaffActions.updateVisible({ isVisible: false }));
    }

    onReloadProject(event: any) {
        this.store.dispatch(ReviewerStaffActions.loadAllProjects({ payload: event }));
    }
}
