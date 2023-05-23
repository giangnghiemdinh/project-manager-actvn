import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MetaPagination, User } from '../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { TableComponent } from '../table/table.component';
import { TableColumnDirective } from '../table/directives/table-column.directive';
import { TableCellDirective } from '../table/directives/table-cell.directive';
import { FormComponent, FormTextComponent } from '../form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Datasource, UiScrollModule } from 'ngx-ui-scroll';
import { UserService } from '../../../common/services';
import { lastValueFrom, map } from 'rxjs';
import { Role } from '../../../common/constants/user.constant';

@Component({
    selector: 'app-search-user',
    standalone: true,
    imports: [
        NzModalModule,
        NzInputModule,
        NzButtonModule,
        FormsModule,
        NgIf,
        NgForOf,
        TableComponent,
        AsyncPipe,
        TableColumnDirective,
        TableCellDirective,
        FormComponent,
        FormTextComponent,
        NzSpinModule,
        UiScrollModule
    ],
    templateUrl: './search-user.component.html',
})
export class SearchUserComponent implements OnChanges {

    private readonly userService = inject(UserService);
    @Input() isVisible = false;
    @Input() isMultiple = false;
    @Input() departmentId: number | null = null;
    @Output() isVisibleChange = new EventEmitter();
    @Output() select = new EventEmitter();

    isLoading = false;
    initialized = false;
    pagination: MetaPagination = { limit: 50 };
    cacheData: any = {};
    selectedUser: User[] = [];

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
            this.selectedUser = [];
            await this.dataSource.adapter.relax();
            await this.dataSource.adapter.reset();
        }
    }

    isSelected(id: number) {
        return this.selectedUser.some(s => s.id === id);
    }

    onSelect(user: User) {
        if (!this.isMultiple) {
            this.selectedUser = [ user ];
            this.onOk();
            return;
        }
        if (this.selectedUser.some(s => s.id === user.id)) {
            this.selectedUser = this.selectedUser.filter(s => s.id !== user.id);
            return;
        }
        this.selectedUser.push(user);
    }

    onSearch(page: number, limit = 30) {

    }

    onOk() {
        this.select.emit(this.selectedUser);
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
        return lastValueFrom(this.userService.getUsers({
            page,
            limit: this.pagination.limit,
            role: Role.LECTURER
        }).pipe(
            map(res => {
                this.pagination = res.meta;
                this.cacheData[`${page}`] = res.data || [];
                return res.data;
            })
        ));
    }
}
