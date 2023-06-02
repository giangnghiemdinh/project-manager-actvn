import { Pipe, PipeTransform } from '@angular/core';
import { ProjectProgress } from '../../../../common/models';
import { keyBy } from 'lodash';

@Pipe({
    name: 'progressToObject',
    standalone: true
})
export class ProgressDetailPipe implements PipeTransform {

    transform(progresses?: ProjectProgress[]): { [key: string]: ProjectProgress } | null {
        if (!progresses || !progresses.length) { return null; }

        return keyBy(progresses, 'type');
    }

}
