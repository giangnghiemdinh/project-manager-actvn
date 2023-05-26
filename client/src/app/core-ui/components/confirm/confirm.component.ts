import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-confirm',
    standalone: true,
    imports: [
        NzButtonModule,
    ],
    templateUrl: './confirm.component.html',
})
export class ConfirmComponent {
    readonly #modal = inject(NzModalRef);
    readonly nzModalData = inject(NZ_MODAL_DATA);

    onCancel() {
       this.#modal.destroy(false);
    }

    onOK() {
        this.#modal.destroy(true);
    }
}
