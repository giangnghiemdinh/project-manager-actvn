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
import { FormComponent, FormTextareaComponent, FormTextComponent } from '../../../../core-ui/components';
import { Department } from '../../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-department-form',
    standalone: true,
    imports: [ NzModalModule, NzSpinModule, NzButtonModule, FormComponent, FormTextComponent, FormTextareaComponent ],
    templateUrl: './department-form.component.html',
})
export class DepartmentFormComponent implements OnChanges {

    readonly #cdr = inject(ChangeDetectorRef);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Input() department: Department | null = null;
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
        this.ok.emit({...this.formComponent.value, id: this.department?.id});
    }
}
