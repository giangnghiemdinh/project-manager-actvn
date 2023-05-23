import { Pipe, PipeTransform } from '@angular/core';
import { Role, Roles } from '../../common/constants/user.constant';

@Pipe({
    name: 'role',
    standalone: true
})
export class RolePipe implements PipeTransform {

    roles = Roles;

    transform(value?: Role): string {
        return (!!value && this.roles.find(r => r.value === value)?.label) || '';
    }

}
