import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'callbackFn',
    standalone: true
})
export class CallbackFnPipe implements PipeTransform {

    transform(callback: any, ...args: unknown[]): any {
        return callback(...args);
    }

}
