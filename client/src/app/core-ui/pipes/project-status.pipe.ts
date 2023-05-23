import { Pipe, PipeTransform } from '@angular/core';
import { ProjectApproveStatuses, ProjectStatuses } from '../../common/constants/project.constant';

@Pipe({
  name: 'projectStatus',
  standalone: true
})
export class ProjectStatusPipe implements PipeTransform {

  transform(value: string): { label: string, class: string } | null {
    return [...ProjectApproveStatuses, ...ProjectStatuses].find(s => s.value === value) || null;
  }

}
