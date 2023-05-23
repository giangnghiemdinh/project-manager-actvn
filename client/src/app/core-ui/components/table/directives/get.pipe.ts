import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash';

@Pipe({
    name: 'get',
    standalone: true
})
export class GetPipe implements PipeTransform {

    transform(path: string, object: any): any {
        return get(object, path);
    }

}
