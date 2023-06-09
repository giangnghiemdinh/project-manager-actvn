import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { FormComponent, FormDateComponent, FormTextComponent } from '../../../../core-ui/components';
import { Semester } from '../../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-semester-form',
    standalone: true,
    templateUrl: './semester-form.component.html',
    imports: [
        NzModalModule,
        NzSpinModule,
        FormComponent,
        FormTextComponent,
        FormDateComponent,
        NzButtonModule
    ]
})
export class SemesterFormComponent implements OnChanges {

    readonly #cdr = inject(ChangeDetectorRef);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Input() semester: Semester | null = null;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.#cdr.detectChanges();
        }
    }

    onCancel() {
        this.cancel.emit();
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        this.ok.emit({...this.formComponent.value, id: this.semester?.id});
    }
}
