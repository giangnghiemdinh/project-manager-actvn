import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormComponent, FormTextComponent } from '../../../../core-ui/components';
import { UserChangeEmail } from '../../../../common/models';
import { interval, take } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-change-email',
    standalone: true,
    imports: [ NzModalModule, NzButtonModule, FormComponent, FormTextComponent, NgIf ],
    templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent implements OnChanges {
    @ViewChild('form') form!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Output() cancel = new EventEmitter();
    @Output() verify = new EventEmitter<UserChangeEmail>();
    @Output() change = new EventEmitter<UserChangeEmail>();
    countdown = 0;
    isGetOtp = false;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.countdown = 0;
            this.isGetOtp = false;
        }
    }

    onCancel() {
        this.cancel.emit();
    }

    onVerify() {
        if (this.countdown > 0) { return; }
        const email = this.form.getControl('email');
        if (!email || !email.value) {
            email?.markAsTouched();
            email?.markAsDirty();
            return;
        }
        this.isGetOtp = true;
        this.verify.emit({ email: email.value });
        this.countdown = 60;
        interval(1000)
            .pipe(take(60))
            .subscribe(_ => this.countdown--);
    }

    onSave() {
        if (!this.form.isValid) { return; }
        const value = this.form.value;
        this.change.emit(value);
    }
}
