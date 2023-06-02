import { Pipe, PipeTransform } from '@angular/core';
import { Ranks } from '../../common/constants';

@Pipe({
    name: 'rank',
    standalone: true
})
export class RankPipe implements PipeTransform {

    transform(value?: string): string {
        if (!value) { return ''; }
        return Ranks.find(r => r.value == value)?.label || '';
    }

}
