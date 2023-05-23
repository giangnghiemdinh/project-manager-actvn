import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TableComponent } from '../table/table.component';
import { TableColumnDirective } from '../table/directives/table-column.directive';
import { TableCellDirective } from '../table/directives/table-cell.directive';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MetaPagination, Student } from '../../../common/models';
import { FormComponent, FormTextComponent } from '../form';
import { Datasource, UiScrollModule } from 'ngx-ui-scroll';
import { StudentService } from '../../../common/services';
import { lastValueFrom, map } from 'rxjs';

@Component({
    selector: 'app-search-student',
    standalone: true,
    templateUrl: './search-student.component.html',
    imports: [
        NzModalModule,
        NzInputModule,
        NzSelectModule,
        NzSpinModule,
        NzIconModule,
        TableComponent,
        TableColumnDirective,
        TableCellDirective,
        AsyncPipe,
        FormsModule,
        NzButtonModule,
        NgIf,
        NgForOf,
        FormComponent,
        FormTextComponent,
        UiScrollModule
    ]
})
export class SearchStudentComponent implements OnChanges {
    private readonly studentService = inject(StudentService);
    @Input() isVisible = false;
    @Input() isMultiple = false;
    @Input() departmentId: number | null = null;
    @Output() isVisibleChange = new EventEmitter();
    @Output() select = new EventEmitter();

    isLoading = false;
    initialized = false;
    pagination: MetaPagination = { limit: 50 };
    cacheData: any = {};
    selectedStudent: Student[] = [];

    dataSource = new Datasource<any>({
        get: (index, count, success) => { }
    });

    async ngOnChanges(changes: SimpleChanges) {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            if (!this.initialized) {
                this.initDataSource();
                return;
            }
            this.cacheData = {};
            this.selectedStudent = [];
            await this.dataSource.adapter.relax();
            await this.dataSource.adapter.reset();
        }
    }

    isSelected(id: number) {
        return this.selectedStudent.some(s => s.id === id);
    }

    onSelect(student: Student) {
        if (!this.isMultiple) {
            this.selectedStudent = [ student ];
            this.onOk();
            return;
        }
        if (this.selectedStudent.some(s => s.id === student.id)) {
            this.selectedStudent = this.selectedStudent.filter(s => s.id !== student.id);
            return;
        }
        this.selectedStudent.push(student);
    }

    onSearch(page: number, limit = 30) {

    }

    onOk() {
        this.select.emit(this.selectedStudent);
        this.isVisibleChange.emit(false);
    }

    onCancel() {
        this.isVisibleChange.emit(false);
    }

    private initDataSource() {
        this.dataSource = new Datasource<any>({
            get: (index, count, success) => {
                const startIndex = Math.max(index, 0);
                const endIndex = index + count - 1;

                if (startIndex > endIndex || this.pagination.itemCount && startIndex >= this.pagination.itemCount) {
                    success([]); // empty result
                    return;
                }

                const startPage = Math.floor(startIndex / this.pagination.limit!);
                const endPage = Math.floor(endIndex / this.pagination.limit!);

                const pagesRequest: Promise<any>[] = [];
                for (let i = startPage; i <= endPage; i++) {
                    pagesRequest.push(this.getData(i + 1));
                }

                this.isLoading = true;
                return Promise.all(pagesRequest).then(pagesResult => {
                    pagesResult = pagesResult.reduce((acc, result) => [...acc, ...result], []);
                    this.isLoading = false;
                    const start = startIndex - startPage * this.pagination.limit!;
                    const end = start + endIndex - startIndex + 1;
                    return pagesResult.slice(start, end);
                }).catch(_ => {
                    success([]);
                });
            },
            settings: {
                bufferSize: this.pagination.limit!,
                startIndex: 0
            }
        });
        this.initialized = true;
    }

    private getData(page: number) {
        if (!!this.cacheData[`${page}`]) {
            return Promise.resolve(this.cacheData[`${page}`]);
        }
        return lastValueFrom(this.studentService.getStudents({
            page,
            limit: this.pagination.limit
        }).pipe(
            map(res => {
                this.pagination = res.meta;
                this.cacheData[`${page}`] = res.data || [];
                return res.data;
            })
        ));
    }
}
