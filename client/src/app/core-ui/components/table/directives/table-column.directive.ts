import { ContentChild, Directive, EventEmitter, Input, Output } from '@angular/core';
import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table/src/table.types';
import { TableCellDirective } from './table-cell.directive';
import { TableHeaderDirective } from './table-header.directive';
import { isEmpty, isNil } from 'lodash';

@Directive({
  selector: 'app-table-column',
  standalone: true
})
export class TableColumnDirective {

  @Input() title = '';
  @Input() key = '';
  @Input() width = '';
  @Input() align: 'left' | 'right' | 'center' | null = null;
  @Input()
  set responsive(value: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    xxl?: boolean;
  } | null) {
    this.normalizeResponsive(value);
  };
  @Input() className = '';
  @Input() right: boolean = false;
  @Input() left: boolean = false;
  @Input() ellipsis: boolean = false;
  @Input() breakword: boolean = true;
  @Input() sortable: boolean = false;
  @Input() sortFn: NzTableSortFn | boolean | null = true;
  @Input() sortKey = '';
  @Output() sortOrderChange = new EventEmitter<{ key: string, order: NzTableSortOrder }>();

  @ContentChild(TableCellDirective, { static: true }) cell?: TableCellDirective;
  @ContentChild(TableHeaderDirective, { static: true }) header?: TableHeaderDirective;

  _responsive: any = null;

  private normalizeResponsive(value: any) {
    if (!value || isEmpty(value)) {
      this._responsive = null;
      return;
    }
    this._responsive = {};
    let prevVal = false;
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map(breakpoint => {
      const bp = value[breakpoint];
      if (isNil(bp)) {
        this._responsive[breakpoint] = prevVal;
      } else {
        prevVal = bp;
        this._responsive[breakpoint] = bp;
      }
    });
  }

}
