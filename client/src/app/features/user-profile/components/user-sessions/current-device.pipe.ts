import { Pipe, PipeTransform } from '@angular/core';
import { isEqual } from 'lodash';
import { getDeviceId } from '../../../../common/utilities';

@Pipe({
    name: 'currentDevice',
    standalone: true
})
export class CurrentDevicePipe implements PipeTransform {

    private readonly deviceId = getDeviceId();

    transform(id: string): boolean {
        return isEqual(id, this.deviceId);
    }

}
