import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'callbackFn',
  standalone: true
})
export class CallbackFnPipe implements PipeTransform {

  transform(fn: (row: any) => any, row: any): any {
    return fn(row);
  }

}
