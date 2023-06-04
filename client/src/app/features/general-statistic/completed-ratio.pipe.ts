import { Pipe, PipeTransform } from '@angular/core';
import { ProjectStatisticalResponse } from '../../common/models';

@Pipe({
    name: 'completedRatio',
    standalone: true
})
export class CompletedRatioPipe implements PipeTransform {

    transform(value: ProjectStatisticalResponse | null): string {
        if (!value) { return ''; }
        const total = (value.total || 0) - (value.totalRefuse || 0) - (value.totalExpired || 0);
        return `${Math.round(((value.totalCompleted || 0) * 100) / total)}%`;
    }

}
