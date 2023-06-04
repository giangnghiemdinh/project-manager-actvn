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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormComponent, FormNumberComponent } from '../../../../core-ui/components';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Project } from '../../../../common/models';

@Component({
    selector: 'app-council-review',
    standalone: true,
    imports: [
        NzModalModule,
        NzButtonModule,
        FormComponent,
        FormNumberComponent,
        NzTableModule
    ],
    templateUrl: './council-review.component.html',
})
export class CouncilReviewComponent implements OnChanges {

    readonly #cdr = inject(ChangeDetectorRef);
    @ViewChild('form') formContainer!: FormComponent;
    @Input() project: Project | null = null;
    @Input() isVisible: boolean | null = false;
    @Input() isLoading: boolean | null = false;
    @Output() ok = new EventEmitter();
    @Output() deleteFile = new EventEmitter();
    @Output() cancel = new EventEmitter();
    totalScore = 0;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible } = changes;
        if (isVisible && this.isVisible) {
            this.#cdr.detectChanges();
        }
    }

    onCancel() {
        if (this.isLoading) { return; }
        this.cancel.emit();
    }

    onValueChanges() {
        const value: any = this.formContainer.value;
        if (value.formScore && value.contentScore && value.summarizeScore && value.answerScore) {
            this.totalScore = value.formScore + value.contentScore + value.summarizeScore + value.answerScore;
            this.formContainer.setValue('conclusionScore', (this.totalScore / 10).toFixed(1));
        }
    }

    onSave() {
        if (!this.formContainer.isValid) { return; }
        const value = this.formContainer.value;
        this.ok.emit({...value, id: this.project?.id});
    }
}
