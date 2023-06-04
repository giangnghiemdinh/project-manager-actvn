import { Pipe, PipeTransform } from '@angular/core';
import { Ranks } from '../../common/constants';
import { isNil } from 'lodash';

@Pipe({
    name: 'rank',
    standalone: true
})
export class RankPipe implements PipeTransform {

    transform(value?: string): string {
        if (isNil((value))) { return ''; }
        return Ranks.find(r => r.value == value)?.label || '';
    }

}
