import { Pipe, PipeTransform } from '@angular/core';
import { ProjectProgress, ProjectProgressType } from '../../../../common/constants/project.constant';

@Pipe({
    name: 'reportName',
    standalone: true
})
export class ReportNamePipe implements PipeTransform {

    transform(type?: ProjectProgressType): string {
        return (type && ProjectProgress[type]) || '';
    }

}
