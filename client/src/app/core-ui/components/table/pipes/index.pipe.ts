import { Pipe, PipeTransform } from '@angular/core';
import { MetaPagination } from '../../../../common/models';

@Pipe({
    name: 'tableIndex',
    standalone: true
})
export class IndexPipe implements PipeTransform {

    transform(index: number, pagination: MetaPagination | null): string {
        if (pagination) {
            index = ((pagination.page || 1) - 1) * (pagination.limit || 20) + index;
        }
        return index < 9 ? `0${index + 1}` : `${index + 1}`;
    }

}
