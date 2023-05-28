import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { timer } from 'rxjs';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Student } from '../../../../common/models';
import { isEmpty } from 'lodash';
import { Gender } from '../../../../common/constants';
import moment from 'moment/moment';
import { ExcelService, NotificationService } from '../../../../common/services';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-student-import',
    standalone: true,
    imports: [ CommonModule, NzModalModule, NzRadioModule, NzUploadModule, NzButtonModule, FormsModule ],
    templateUrl: './student-import.component.html',
})
export class StudentImportComponent implements OnChanges {

    readonly #excelService = inject(ExcelService);
    readonly #notificationService = inject(NotificationService);
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();
    files: NzUploadFile[] = [];
    duplicateCode = 0;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.duplicateCode = 0;
            this.files = [];
        }
    }

    customRequest = (item: NzUploadXHRArgs) => timer(0).subscribe({
        next: () => item.onSuccess!('', item.file, '')
    });

    remove = (file: NzUploadFile) => {
        this.files = [];
        return true;
    };

    onCancel() {
        this.cancel.emit();
    }

    onDownloadSample() {
        this.#excelService.export('Nhập danh sách sinh viên', [
            {
                columns: [
                    { title: 'Họ và tên', width: 25 },
                    { title: 'Mã sinh viên', width: 25, numFmt: '@' },
                    { title: 'Email', width: 20, numFmt: '@' },
                    { title: 'Số điện thoại', width: 20, numFmt: '@' },
                    { title: 'Giới tính', width: 10 },
                    { title: 'Ngày sinh', width: 25, numFmt: 'dd/mm/yyyy' },
                    { title: 'Khoa', width: 30 },
                ],
                notes: [
                    { cell: 'A1', text: 'Đây là trường bắt buộc.' },
                    { cell: 'B1', text: 'Đây là trường bắt buộc.' },
                    { cell: 'E1', text: 'Nữ: 0 \nNam: 1' },
                    { cell: 'F1', text: 'Định dạng dd/mm/yyyy' },
                    { cell: 'G1', text: 'An toàn thông tin: 1 \nCông nghệ thông tin: 2 \nĐiện tử viễn thông: 3' },
                ],
                sheetName: 'Danh sách sinh viên'
            }
        ]);
    }

    onFileChanges(event: NzUploadChangeParam) {
        const { file, fileList } = event;
        this.files = [ file ];
    }

    onImport() {
        if (!this.files.length) {
            this.#notificationService.error('Vui lòng chọn tệp đính kèm!');
            return;
        }
        const [ file ] = this.files;
        this.#excelService.import(file.originFileObj, (err: any, data: any) => {
            if (err) {
                this.#notificationService.error(err);
                return;
            }
            if (!data || !data.length) {
                this.#notificationService.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const [ sheet0 ] = data;
            if (!sheet0 || sheet0.length <= 1) {
                this.#notificationService.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const students: Student[] = []
            for (let i = 1; i < sheet0.length; i++) {
                const row = sheet0[i];
                const s: Student = {};
                if (isEmpty(row[0])) {
                    this.#notificationService.error(`Vui lòng điền Họ và tên dòng ${i + 1}!`);
                    return;
                }
                s.fullName = row[0];
                if (isEmpty(row[1])) {
                    this.#notificationService.error(`Vui lòng điền mã sinh viên dòng ${i + 1}!`);
                    return;
                }
                s.code = row[1];
                if (row[2] && !new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(row[1])) {
                    this.#notificationService.error(`Email dòng ${i + 1} không hợp lệ!`);
                    return;
                }
                s.email = row[2] || '';
                s.phone = row[3] || '';

                if (isEmpty(row[4])) {
                    s.gender = Gender.Male;
                } else if (row[4] != Gender.Male && row[4] != Gender.Female) {
                    this.#notificationService.error(`Giới tính dòng ${i + 1} không hợp lệ!`);
                    return;
                } else {
                    s.gender = +row[4];
                }

                if (!isEmpty(row[5])) {
                    const birthday = moment(row[4], 'DD/MM/YYYY');
                    if (!birthday.isValid()) {
                        this.#notificationService.error(`Ngày sinh dòng ${i + 1} không hợp lệ!`);
                        return;
                    }
                    s.birthday = birthday.toDate();
                }

                if (isEmpty(row[6])) {
                    this.#notificationService.error(`Vui lòng điền khoa dòng ${i + 1}!`);
                    return;
                } else if (![1, 2, 3].includes(+row[6])) {
                    this.#notificationService.error(`Khoa dòng ${i + 1} không hợp lệ!`);
                    return;
                } else {
                    s.departmentId = +row[6];
                }

                students.push(s);
            }
            this.ok.emit({
                duplicateCode: this.duplicateCode,
                students
            });
        });
    }
}
