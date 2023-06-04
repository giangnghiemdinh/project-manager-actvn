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
import { Department, Student } from '../../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
    FormComponent,
    FormDateComponent,
    FormSelectComponent,
    FormTextComponent
} from '../../../../core-ui/components';
import { Genders } from '../../../../common/constants';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
    selector: 'app-student-form',
    standalone: true,
    imports: [
        NzModalModule,
        FormComponent,
        FormTextComponent,
        FormDateComponent,
        FormSelectComponent,
        NzButtonModule,
        NzSpinModule
    ],
    templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnChanges {

    readonly #cdr = inject(ChangeDetectorRef);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() student: Student | null = null;
    @Input() departments: Department[] | null = null;
    @Output() ok = new EventEmitter();
    @Output() cancel = new EventEmitter();

    genders = Genders;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.#cdr.detectChanges();
        }
    }

    onCancel() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        this.ok.emit({...this.formComponent.value, id: this.student?.id});
    }
}
