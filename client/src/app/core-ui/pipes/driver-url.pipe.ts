import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'driverUrl',
  standalone: true
})
export class DriverUrlPipe implements PipeTransform {

  transform(fileId: string, exportTo: 'image' | 'document'): string {
    if (!fileId) { return ''; }
    switch (exportTo) {
      case 'image':
        return `https://drive.google.com/uc?export=view&id=${fileId}`
      default:
        return '';
    }
  }

}
