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
import { ProjectStatus, RO_REVIEWER_STAFF } from '../../common/constants';
import { setTitle } from '../../common/utilities';
import { ReviewerStaff, Student } from '../../common/models';
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
import { ExcelService, MergeCell, NotificationService } from '../../common/services';

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
    @ViewChild('table') table!: TableComponent;
    readonly #excelService = inject(ExcelService);
    readonly #notificationService = inject(NotificationService);
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
    selectedItems: ReviewerStaff[] = [];

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

    onDelete(row: ReviewerStaff) {
        if (row.projects?.some(p => p.status === ProjectStatus.IN_PRESENTATION)) {
            this.#notificationService.error('Không thể xoá nhóm do có đề tài đang bảo vệ!');
            return;
        }
        let prevTitle = '';
        if (row.projects?.some(p => p.reportedCount)) {
            prevTitle = 'Có đề tài đã chấm phản biện.'
        }
        const ref = this.modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `${prevTitle} Bạn có chắc chắn muốn xoá nhóm phản biện?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.store.dispatch(ReviewerStaffActions.deleteReviewerStaff({ payload: { id: row.id! } })));
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

    onCheckedChange(event: { ids: Set<number>, data: ReviewerStaff[] }) {
        this.selectedItems = this.selectedItems.filter(p => event.ids.has(p.id!));
        event.ids.forEach(id => {
            if (!this.selectedItems.some(p => p.id === id)) {
                const selected = event.data.find(p => p.id === id);
                selected && this.selectedItems.push(selected);
            }
        });
    }

    onClearChecked() {
        this.table?.clearChecked();
        this.selectedItems = [];
    }

    onExport() {
        if (!this.selectedItems.length) { return; }
        const data: (string | number)[][] = [];
        const mergeCells: MergeCell[] = [];
        let rowIndex = 0;
        for (let i = 0; i < this.selectedItems.length; i++) {
            const group = this.selectedItems[i];
            const reviewer = group.user;
            group.projects?.forEach(p => {
                const instructor = p.instructor;
                const studentLength = p.students?.length || 0;
                if (studentLength > 1) {
                    // Merge project name
                    mergeCells.push({
                        startRow: rowIndex + 2,
                        endRow: rowIndex + studentLength + 1,
                        startCol: 5,
                        endCol: 5,
                    });

                    // Merge instructor
                    mergeCells.push({
                        startRow: rowIndex + 2,
                        endRow: rowIndex + studentLength + 1,
                        startCol: 6,
                        endCol: 6,
                    });

                    // Merge reviewer
                    mergeCells.push({
                        startRow: rowIndex + 2,
                        endRow: rowIndex + studentLength + 1,
                        startCol: 7,
                        endCol: 7,
                    });
                }
                p.students?.forEach((s, sIdx) => {
                    rowIndex++;
                    data.push([
                        rowIndex,
                        s.fullName || '',
                        s.code || '',
                        `${s.email || ''}\n${s.phone || ''}`,
                        p.name || '',
                        instructor ? `${instructor.fullName}\n${instructor.workPlace}\n${instructor.email}\n${instructor.phone}` : '',
                        reviewer ? `${reviewer.fullName}\n${reviewer.workPlace}\n${reviewer.email}\n${reviewer.phone}` : ''
                    ]);
                });
            });
        }


        this.#excelService.export('Danh sách phản biện', [
            {
                columns: [
                    { title: 'STT', width: 5, alignment: 'center', numFmt: '#' },
                    { title: 'Sinh viên', width: 25, wrapText: true },
                    { title: 'Mã sinh viên', width: 15, wrapText: true },
                    { title: 'SĐT, Email', width: 25, wrapText: true },
                    { title: 'Tên đề tài', width: 30, wrapText: true },
                    { title: 'Người hướng dẫn', width: 25, wrapText: true },
                    { title: 'Người phản biện', width: 25, wrapText: true },
                ],
                sheetName: 'Danh sách phản biện',
                mergeCells,
                data,
            }
        ]);
    }
}
