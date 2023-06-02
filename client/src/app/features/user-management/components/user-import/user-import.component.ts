import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { timer } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { ExcelService, NotificationService } from '../../../../common/services';
import { isEmpty } from 'lodash';
import { User } from '../../../../common/models';
import { Gender } from '../../../../common/constants';
import moment from 'moment';

@Component({
    selector: 'app-user-import',
    standalone: true,
    imports: [ CommonModule, NzModalModule, NzRadioModule, NzUploadModule, NzButtonModule, FormsModule ],
    templateUrl: './user-import.component.html',
})
export class UserImportComponent implements OnChanges {

    readonly #excelService = inject(ExcelService);
    readonly #notification = inject(NotificationService);
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() cancel = new EventEmitter();
    @Output() ok = new EventEmitter();
    files: NzUploadFile[] = [];
    duplicateEmail = 0;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.duplicateEmail = 0;
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

    onDownloadSample() {
        this.#excelService.export('Nhập danh sách người dùng', [
            {
                columns: [
                    { title: 'Họ và tên', width: 25 },
                    { title: 'Email', width: 25, numFmt: '@' },
                    { title: 'Số điện thoại', width: 20, numFmt: '@' },
                    { title: 'Giới tính', width: 10 },
                    { title: 'Ngày sinh', width: 25, numFmt: 'dd/mm/yyyy' },
                    { title: 'Địa chỉ', width: 30 },
                    { title: 'Đơn vị', width: 30 }
                ],
                notes: [
                    { cell: 'A1', text: 'Đây là trường bắt buộc.' },
                    { cell: 'B1', text: 'Đây là trường bắt buộc.' },
                    { cell: 'D1', text: 'Nữ: 0 \nNam: 1' },
                    { cell: 'E1', text: 'Định dạng dd/mm/yyyy' }
                ],
                sheetName: 'Danh sách người dùng',
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

    onImport() {
        if (!this.files.length) {
            this.#notification.error('Vui lòng chọn tệp đính kèm!');
            return;
        }
        const [ file ] = this.files;
        this.#excelService.import(file.originFileObj, (err: any, data: any) => {
            if (err) {
                this.#notification.error(err);
                return;
            }
            if (!data || !data.length) {
                this.#notification.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const [ sheet0 ] = data;
            if (!sheet0 || sheet0.length <= 1) {
                this.#notification.error('File dữ liệu trống! Vui lòng kiểm tra lại.');
                return;
            }
            const users: User[] = []
            for (let i = 1; i < sheet0.length; i++) {
                const row = sheet0[i];
                const u: User = {};
                if (isEmpty(row[0])) {
                    this.#notification.error(`Vui lòng điền Họ và tên dòng ${i + 1}!`);
                    return;
                }
                u.fullName = row[0];
                if (isEmpty(row[1])) {
                    this.#notification.error(`Vui lòng điền Email dòng ${i + 1}!`);
                    return;
                }
                if (!new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(row[1])) {
                    this.#notification.error(`Email dòng ${i + 1} không hợp lệ!`);
                    return;
                }
                u.email = row[1];
                u.phone = row[2] || '';
                if (isEmpty(row[3])) {
                    u.gender = Gender.Male;
                } else if (row[3] != Gender.Male && row[4] != Gender.Female) {
                    this.#notification.error(`Giới tính dòng ${i + 1} không hợp lệ!`);
                    return;
                } else {
                    u.gender = +row[3];
                }
                if (!isEmpty(row[4])) {
                    const birthday = moment(row[4], 'DD/MM/YYYY');
                    if (!birthday.isValid()) {
                        this.#notification.error(`Ngày sinh dòng ${i + 1} không hợp lệ!`);
                        return;
                    }
                    u.birthday = birthday.toDate();
                }
                u.address = row[5] || '';
                u.workPlace = row[6] || '';
                users.push(u);
            }
            this.ok.emit({
                duplicateEmail: this.duplicateEmail,
                users
            });
        });
    }
}
