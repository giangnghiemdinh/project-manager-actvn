import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'driverUrl',
    standalone: true
})
export class DriverUrlPipe implements PipeTransform {

    transform(fileId: string | null | undefined): string {
        if (!fileId) { return ''; }
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

}
