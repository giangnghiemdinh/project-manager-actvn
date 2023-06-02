import { Component, inject, ViewChild } from '@angular/core';
import { rankFullName, setTitle } from '../../common/utilities';
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
import { ExaminerCouncil, ReviewerStaff, Student } from '../../common/models';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ExaminerCouncilFormComponent } from './components/examiner-council-form/examiner-council-form.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CouncilPositionPipe } from './council-position.pipe';
import { HasRoleDirective } from '../../core-ui/directives';
import { first } from 'rxjs';
import { ExcelService, MergeCell, NotificationService } from '../../common/services';
import { RankFullNamePipe, RankPipe } from '../../core-ui/pipes';
import { ExaminerCouncilActions } from './store/examiner-council.actions';

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
        HasRoleDirective,
        RankFullNamePipe,
        RankPipe
    ],
    templateUrl: './examiner-council.component.html',
    providers: [ CouncilPositionPipe, RankPipe ]
})
export class ExaminerCouncilComponent {
    
    @ViewChild('filterForm') filterForm!: FormComponent;
    @ViewChild('table') table!: TableComponent;
    
    readonly #excelService = inject(ExcelService);
    readonly #positionPipe = inject(CouncilPositionPipe);
    readonly #rankPipe = inject(RankPipe);
    readonly #notification = inject(NotificationService);
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<ExaminerCouncilState>);
    readonly #router = inject(Router);
    readonly #modal = inject(NzModalService);
    
    queryParams$ = this.#store.select(selectQueryParams);
    examinerCouncils$ = this.#store.select(selectExaminerCouncils);
    pagination$ = this.#store.select(selectPagination);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    projects$ = this.#store.select(selectProjects);
    examinerCouncil$ = this.#store.select(selectExaminerCouncil);
    departments$ = this.#commonStore.select(selectDepartments);
    semesters$ = this.#commonStore.select(selectSemesters);
    title = 'Danh sách hội đồng bảo vệ';
    url = RO_EXAMINER_COUNCIL;
    selectedItems: ExaminerCouncil[] = [];

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
        this.#store.dispatch(ExaminerCouncilActions.loadExaminerCouncils());
    }

    onAdd() {
        this.#store.dispatch(ExaminerCouncilActions.updateVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.#store.dispatch(ExaminerCouncilActions.loadExaminerCouncil({ payload: { id } }));
    }

    onDelete(row: ExaminerCouncil) {
        if (row.projects?.some(p => p.conclusionScore)) {
            this.#notification.error('Không thể xoá hội đồng do có đề tài đã có điểm bảo vệ!');
            return;
        }
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn xoá hội đồng?`,
                okText: 'Xoá',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(ExaminerCouncilActions.deleteExaminerCouncil({ payload: { id: row.id! } })));
    }

    onSave(value: Student) {
        this.#store.dispatch(value.id
            ? ExaminerCouncilActions.updateExaminerCouncil({ payload: value })
            : ExaminerCouncilActions.createExaminerCouncil({ payload: value })
        );
    }

    onCancel() {
        this.#store.dispatch(ExaminerCouncilActions.updateVisible({ isVisible: false }));
    }

    onReloadProject(event: any) {
        this.#store.dispatch(ExaminerCouncilActions.loadAllProject({ payload: {...event} }));
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
        const projects: (string | number)[][] = [];
        const members: (string | number)[][] = []
        const mergeMemberCells: MergeCell[] = [];
        const mergeProjectCells: MergeCell[] = [];
        let projectRowIndex = 0;
        let memberRowIndex = 0;
        for (let i = 0; i < this.selectedItems.length; i++) {
            const group = this.selectedItems[i];
            // Merge STT
            mergeMemberCells.push({
                startRow: memberRowIndex + 2,
                endRow: memberRowIndex + (group.users?.length || 0) + 1,
                startCol: 1,
                endCol: 1,
            });

            // Merge council name
            mergeMemberCells.push({
                startRow: memberRowIndex + 2,
                endRow: memberRowIndex + (group.users?.length || 0) + 1,
                startCol: 2,
                endCol: 2,
            });

            // Merge council location
            mergeMemberCells.push({
                startRow: memberRowIndex + 2,
                endRow: memberRowIndex + (group.users?.length || 0) + 1,
                startCol: 3,
                endCol: 3,
            });

            // Merge STT
            mergeProjectCells.push({
                startRow: projectRowIndex + 2,
                endRow: projectRowIndex + (group.projects?.length || 0) + 1,
                startCol: 1,
                endCol: 1,
            });

            // Merge council name
            mergeProjectCells.push({
                startRow: projectRowIndex + 2,
                endRow: projectRowIndex + (group.projects?.length || 0) + 1,
                startCol: 2,
                endCol: 2,
            });

            group.users?.forEach(u => {
                memberRowIndex++;
                members.push([
                    i + 1,
                    `Hội đồng ${i + 1}`,
                    group.location || '',
                    u.user?.fullName || '',
                    this.#rankPipe.transform(u.user?.rank),
                    this.#positionPipe.transform(u.position!)
                ]);
            });
            group.projects?.forEach(p => {
                const instructor = p.instructor;
                const reviewer = p.reviewerStaff?.user;
                const studentLength = p.students?.length || 0;

                if (studentLength > 1) {
                    // Merge project name
                    mergeProjectCells.push({
                        startRow: projectRowIndex + 2,
                        endRow: projectRowIndex + studentLength + 1,
                        startCol: 5,
                        endCol: 5,
                    });

                    // Merge instructor
                    mergeProjectCells.push({
                        startRow: projectRowIndex + 2,
                        endRow: projectRowIndex + studentLength + 1,
                        startCol: 6,
                        endCol: 6,
                    });

                    // Merge reviewer
                    mergeProjectCells.push({
                        startRow: projectRowIndex + 2,
                        endRow: projectRowIndex + studentLength + 1,
                        startCol: 7,
                        endCol: 7,
                    });
                }
                p.students?.forEach((s, sIdx) => {
                    projectRowIndex++;
                    projects.push([
                        i + 1,
                        `Hội đồng ${i + 1}`,
                        s.fullName || '',
                        s.code || '',
                        p.name || '',
                        instructor ? `${rankFullName(instructor)}\n${instructor.workPlace}\n${instructor.email}\n${instructor.phone}` : '',
                        reviewer ? `${rankFullName(reviewer)}\n${reviewer.workPlace}\n${reviewer.email}\n${reviewer.phone}` : ''
                    ]);
                });
            });
        }

        this.#excelService.export('Danh sách hội đồng', [
            {
                columns: [
                    { title: 'STT', width: 5, alignment: 'center', numFmt: '#' },
                    { title: 'Hội đồng', width: 15, wrapText: true },
                    { title: 'Địa điểm', width: 30, wrapText: true },
                    { title: 'Họ và tên', width: 25, wrapText: true },
                    { title: 'Học hàm, học vị', width: 25, wrapText: true },
                    { title: 'Chức vụ', width: 30, wrapText: true },
                ],
                sheetName: 'Danh sách thành viên',
                mergeCells: mergeMemberCells,
                data: members,
            },
            {
                columns: [
                    { title: 'STT', width: 5, alignment: 'center', numFmt: '#' },
                    { title: 'Hội đồng', width: 15, wrapText: true },
                    { title: 'Sinh viên', width: 25, wrapText: true },
                    { title: 'Mã sinh viên', width: 15, wrapText: true },
                    { title: 'Tên đề tài', width: 30, wrapText: true },
                    { title: 'Người hướng dẫn', width: 25, wrapText: true },
                    { title: 'Người phản biện', width: 25, wrapText: true },
                ],
                sheetName: 'Danh sách đề tài bảo vệ',
                mergeCells: mergeProjectCells,
                data: projects,
            }
        ]);
    }

}
