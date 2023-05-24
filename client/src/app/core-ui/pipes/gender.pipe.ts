import { Pipe, PipeTransform } from '@angular/core';
import { Gender, Genders } from '../../common/constants';

@Pipe({
    name: 'gender',
    standalone: true
})
export class GenderPipe implements PipeTransform {

    transform(value?: Gender): string {
        return Genders.find(g => g.value == value)?.label || '';
    }

}
