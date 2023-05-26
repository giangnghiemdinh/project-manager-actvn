import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { User } from '../../../../common/models';
import { TwoFactorMethod } from '../../../../common/constants';
import { NotificationService } from '../../../../common/services';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-change-two-factor',
    standalone: true,
    imports: [ NzModalModule, NzButtonModule, NzRadioModule, FormsModule ],
    templateUrl: './change-two-factor.component.html',
})
export class ChangeTwoFactorComponent implements OnChanges {
    readonly #notification = inject(NotificationService);
    @Input() user: User | null = null;
    @Input() isSelf: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Output() cancel = new EventEmitter();
    @Output() change = new EventEmitter();
    twoFactorMethod = TwoFactorMethod;
    twoFactory = TwoFactorMethod.DISABLE;

    ngOnChanges(changes: SimpleChanges): void {
        const { user } = changes;
        if (user) {
            this.twoFactory = this.user?.twoFactory || TwoFactorMethod.DISABLE;
        }
    }

    onCancel() {
        this.cancel.emit();
    }

    onSave() {
        if (this.user?.twoFactory === this.twoFactory) {
            this.#notification.error('Vui lòng chọn phương thức xác thực mới!');
            return;
        }
        this.change.emit({ twoFactory: this.twoFactory, isSelf: this.isSelf });
    }
}
