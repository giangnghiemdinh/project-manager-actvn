import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { timer } from 'rxjs';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-student-import',
    standalone: true,
    imports: [ CommonModule, NzModalModule, NzRadioModule, NzUploadModule, NzButtonModule ],
    templateUrl: './student-import.component.html',
    styles: [
    ]
})
export class StudentImportComponent {
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    files: NzUploadFile[] = [];

    customRequest = (item: NzUploadXHRArgs) => timer(0).subscribe({
        next: () => item.onSuccess!('', item.file, '')
    });

    onFileChanges(event: NzUploadChangeParam) {
        const { file, fileList } = event;
        this.files = [ file ];
    }

    onClose() {
        this.cancel.emit();
    }
}
