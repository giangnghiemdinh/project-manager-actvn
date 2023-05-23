import { Pipe, PipeTransform } from '@angular/core';
import { ExaminerCouncilPosition, ExaminerCouncilPositions } from '../../common/constants/user.constant';

@Pipe({
    name: 'councilPosition',
    standalone: true
})
export class CouncilPositionPipe implements PipeTransform {

    positions = ExaminerCouncilPositions;

    transform(value: ExaminerCouncilPosition): string {
        return this.positions.find(p => p.value === value)?.label || '';
    }

}
