import {
    AfterContentInit,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef
} from '@angular/core';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TableColumnDirective } from './directives/table-column.directive';
import { SortOrderPipe } from './pipes/sort-order.pipe';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { filter, map, merge, ReplaySubject, takeUntil } from 'rxjs';
import { media } from '../../../common/utilities';
import { GetPipe } from './directives/get.pipe';
import { MetaPagination } from '../../../common/models';
import { NzTableSize } from 'ng-zorro-antd/table/src/table.types';
import { CallbackFnPipe } from './pipes/callback-fn.pipe';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [ NzTableModule, NgIf, NgForOf, SortOrderPipe, NgTemplateOutlet, NzPaginationModule, GetPipe, CallbackFnPipe, NgClass ],
    templateUrl: './table.component.html'
})
export class TableComponent implements AfterContentInit, OnDestroy, OnChanges {

    private destroy$ = new ReplaySubject<void>(1);
    private media$ = new ReplaySubject<void>(1);
    @Input() isLoading: boolean | null = false;
    @Input() data: any = [];
    @Input() outerBordered = true;
    @Input() bordered = false;
    @Input() showPagination = true;
    @Input() mobileResponsive = false;
    @Input() paginationResponsive = true;
    @Input() paginationSize: 'default' | 'small' = 'default';
    @Input() pagination: MetaPagination | null = null;
    @Input() pageSizeOptions = [10, 30, 50];
    @Input() scroll?: {
        x?: string | null;
        y?: string | null;
    };
    @Input() rowClickable = false;
    @Input() showCheckbox = false;
    @Input() showHeader = true;
    @Input() sortBy = '';
    @Input() orderBy = '';
    @Input() size: NzTableSize = 'middle';
    @Input() rowClassFn?: (row: any) => string;
    @Input() noResult?: string | TemplateRef<NzSafeAny>;
    @Input()
    set expandTemplate(template: TemplateRef<any> | null) {
        this._showExpand = true;
        this._expandTemplate = template;
        this.data.length && (this.data = [...this.data.map((d: any) => ({...d, expand: d.expand || false}))]);
    }
    @Output() rowClick = new EventEmitter();
    @Output() pageIndexChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();
    @Output() pageChanges = new EventEmitter<{ index: number, size: number }>();
    @Output() queryParams = new EventEmitter<any>();
    @Output() checkedChange = new EventEmitter();
    @Output() expand = new EventEmitter();
    @ContentChildren(TableColumnDirective) columns!: QueryList<TableColumnDirective>;
    _columns: any[] = [];
    _isMobile = false;
    _indeterminate = false;
    _showExpand = false;
    _expandTemplate: TemplateRef<any> | null = null;
    _checked = false;
    _setOfCheckedId = new Set<number>();

    ngAfterContentInit() {
        this.mediaListener();
        this.columnsChangesListener();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { data } = changes;
        if (data && this.data.length) {
            this.refreshCheckedStatus();
            this._showExpand && (this.data = [...this.data.map((d: any) => ({...d, expand: d.expand || false}))]);
        }
    }

    ngOnDestroy() {
        this.media$.next();
        this.media$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    onPageIndexChange(index: number) {
        this.pageIndexChange.emit(index);
        this.pageChanges.emit({ index, size: this.pagination?.limit || 10 });
    }

    onPageSizeChange(size: number) {
        this.pageSizeChange.emit(size);
        this.pageChanges.emit({ index: this.pagination?.page || 1, size });
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.data.filter((row: any) => !row.disabled);
        this._checked = listOfEnabledData.every((row: any) => this._setOfCheckedId.has(row.id));
        this._indeterminate = listOfEnabledData.some((row: any) => this._setOfCheckedId.has(row.id)) && !this._checked;
        this.checkedChange.emit({ids: this._setOfCheckedId, data: this.data});
    }

    onItemChecked(id: number, checked: boolean): void {
        this.updateCheckedSet(id, checked);
        this.refreshCheckedStatus();
    }

    onAllChecked(checked: boolean): void {
        this.data
            .filter((row: any) => !row.disabled)
            .forEach((row: any) => this.updateCheckedSet(row.id, checked));
        this.refreshCheckedStatus();
    }

    updateCheckedSet(id: number, checked: boolean): void {
        checked ? this._setOfCheckedId.add(id) : this._setOfCheckedId.delete(id);
    }

    clearChecked() {
        this._setOfCheckedId.clear();
        this._checked = false;
        this._indeterminate = false;
    }

    removeChecked(id: number) {
        this._setOfCheckedId.delete(id);
        this.refreshCheckedStatus();
    }

    setChecked(ids: number[]) {
        for (const id of ids) { this._setOfCheckedId.add(id); }
        this.refreshCheckedStatus();
    }

    private columnsChangesListener() {
        this.columns.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe(_ => {
                this.media$.next();
                this.media$.complete();
                this.mediaListener();
            });
    }

    private mediaListener() {
        if (!this.columns || !this.columns.length) { return; }
        this.media$ = new ReplaySubject<void>(1);
        merge(
            media(`(min-width: 1536px)`)
                .pipe(map(matches => ({ breakpoint: 'xxl', matches }))),
            media(`(min-width: 1280px) and (max-width: 1535px)`)
                .pipe(map(matches => ({ breakpoint: 'xl', matches }))),
            media(`(min-width: 1024px) and (max-width: 1279px)`)
                .pipe(map(matches => ({ breakpoint: 'lg', matches }))),
            media(`(min-width: 768px) and (max-width: 1023px)`)
                .pipe(map(matches => ({ breakpoint: 'md', matches }))),
            media(`(min-width: 640px) and (max-width: 767px)`)
                .pipe(map(matches => ({ breakpoint: 'sm', matches }))),
            media(`(max-width: 639px)`)
                .pipe(map(matches => ({ breakpoint: 'xs', matches }))),
        ).pipe(
            filter(({ breakpoint, matches }) => matches),
            takeUntil(this.media$)
        ).subscribe(({ breakpoint, matches }) => {
            this._columns = this.columns['_results'].filter(
                (col: TableColumnDirective) => col._responsive ? col._responsive[breakpoint] : true
            );
        });
    }
}
