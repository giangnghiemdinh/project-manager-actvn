import { Pipe, PipeTransform } from '@angular/core';
import { NzTableSortOrder } from 'ng-zorro-antd/table/src/table.types';

@Pipe({
  name: 'sortOrder',
  standalone: true
})
export class SortOrderPipe implements PipeTransform {

  transform(sortKey: string, sortBy: string, orderBy: string): NzTableSortOrder {
    if (!sortBy || sortBy != sortKey) { return null; }
    return orderBy == 'ASC' ? 'ascend' : 'descend';
  }

}
