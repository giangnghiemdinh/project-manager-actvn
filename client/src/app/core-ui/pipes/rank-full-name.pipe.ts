import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../common/models';
import { rankFullName } from '../../common/utilities';

@Pipe({
    name: 'rankFullName',
    standalone: true
})
export class RankFullNamePipe implements PipeTransform {

    transform(user?: User, empty = ''): string {
        return rankFullName(user, empty);
    }

}
