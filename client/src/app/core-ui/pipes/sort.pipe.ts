import { Pipe, PipeTransform } from '@angular/core';
import { sortBy } from 'lodash';

@Pipe({
  name: 'sort',
  standalone: true
})
export class SortPipe implements PipeTransform {

  transform(array: any, key: string, order: 'ASC' | 'DESC' = 'ASC') {
    return sortBy(array, [key, order]);
  }

}
