import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
    FormComponent,
    FormRadioComponent,
    FormSelectComponent,
    RadioDirective,
    ToolbarComponent
} from '../../../../core-ui/components';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { timer } from 'rxjs';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ProjectStatusPipe } from '../../../../core-ui/pipes/project-status.pipe';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ExcelService } from '../../../../common/services/excel.service';
import { isEmpty } from 'lodash';
import { NotificationService } from '../../../../common/services';
import { Department, Semester } from '../../../../common/models';

@Component({
    selector: 'app-project-import',
    standalone: true,
    imports: [ ToolbarComponent, NzUploadModule, NgForOf, NzButtonModule, NzTableModule, FormsModule, NzInputModule, NzToolTipModule, NgIf, ProjectStatusPipe, NgClass, NzModalModule, NzRadioModule, FormComponent, FormRadioComponent, RadioDirective, FormSelectComponent ],
    templateUrl: './project-import.component.html',
})
export class ProjectImportComponent implements OnChanges {

    private readonly excelService = inject(ExcelService);
    private readonly notificationService = inject(NotificationService);

    @ViewChild('form') formContainer!: FormComponent;
    @ViewChild('importForm') importFormContainer!: FormComponent;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Input() departments: Department[] | null = null;
    @Input() semesters: Semester[] | null = null;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    files: NzUploadFile[] = [];
    isVisibleModal = false;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.formContainer?.reset();
            this.importFormContainer?.reset();
        }
    }

    customRequest = (item: NzUploadXHRArgs) => timer(0).subscribe({
        next: () => item.onSuccess!('', item.file, '')
    });

    customRemove = (file: NzUploadFile) => {
        this.files = [];
        return true;
    };

    onDownloadSample() {
        this.excelService.export('Nhập danh sách đề tài',[
            {
                columns: [
                    { title: 'TT', width: 10, alignment: 'center' },
                    { title: 'Đề tài', width: 30 },
                    { title: 'Mô tả', width: 40 },
                    { title: 'Yêu cầu', width: 40 },
                    { title: 'Người hướng dẫn', width: 25 },
                ],
                notes: [
                    { cell: 'B1', text: 'Đây là trường bắt buộc.' },
                    { cell: 'D1', text: 'Đối với yêu cầu đã có sinh viên đăng ký, vui lòng điền thông tin theo mẫu: \n\n[Yêu cầu đề tài]\n\nSinh viên:\nNghiêm Đình Giang \nAT140414 \ngiangnghiemdinh@gmail.com \n038699964 \n\nSinh viên:\nPhạm Duy Phúc \nAT140434 \nduyphucit@gmail.com \n0123456789' },
                    { cell: 'E1', text: 'Vui lòng điền thông tin theo mẫu: \n\nThs. Hoàng Thanh Nam\nKhoa ATTT - HVKTMM\nnamht@hocvienact.edu.vn\n0978571541' }
                ],
                sheetName: 'Danh sách đề tài',
            }
        ]);
    }

    onFileChanges(event: NzUploadChangeParam) {
        const { file, fileList } = event;
        this.files = [ file ];
    }

    onCancel() {
        this.cancel.emit();
    }

    onPreImport() {
        if (!this.files.length) {
            this.notificationService.error('Vui lòng chọn tệp đính kèm!');
            return;
        }
        this.isVisibleModal = true;
    }

    onImport() {
        if (!this.importFormContainer.isValid) { return; }
        this.isVisibleModal = false;
        const value = this.formContainer.value;
        const importValue = this.importFormContainer.value;
        const [ file ] = this.files;
        this.excelService.import(file.originFileObj, (err: any, data: any) => {
            if (err) {
                this.notificationService.error(err);
                return;
            }
            if (!data || !data.length) {
                this.notificationService.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const [ sheet0 ] = data;
            if (!sheet0 || sheet0.length <= 1) {
                this.notificationService.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const projects: any = [];
            for (let i = 1; i < sheet0.length; i++) {
                const row = sheet0[i];
                const p: any = {};
                if (isEmpty(row[1])) {
                    this.notificationService.error(`Vui lòng điền tên đề tài dòng ${i + 1}!`);
                    return;
                }
                p.name = row[1];
                if (isEmpty(row[2])) {
                    this.notificationService.error(`Vui lòng điền mô tả dòng ${i + 1}!`);
                    return;
                }
                p.description = row[2];
                if (isEmpty(row[3])) {
                    this.notificationService.error(`Vui lòng điền yêu cầu dòng ${i + 1}!`);
                    return;
                }
                p.requirement = (row[3] || '').replace(/\r/g, '');
                if (isEmpty(row[4])) {
                    this.notificationService.error(`Vui lòng điền người hướng dẫn dòng ${i + 1}!`);
                    return;
                }
                p.instructor = (row[4] || '').replace(/\r/g, '');
                projects.push(p);
            }
            this.ok.emit({
                projects,
                ...value,
                ...importValue,
            });
        });
    }
}
