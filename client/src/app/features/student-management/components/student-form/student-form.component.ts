import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Department, Student } from '../../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormComponent, FormSelectComponent, FormTextComponent } from '../../../../core-ui/components';
import { FormDateComponent } from '../../../../core-ui/components/form/form-date/form-date.component';
import { Genders } from '../../../../common/constants/user.constant';
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
export class StudentFormComponent {

  @ViewChild('form') formComponent!: FormComponent;
  @Input() isLoading: boolean | null = false;
  @Input() isVisible: boolean | null = false;
  @Input() student: Student | null = null;
  @Input() departments: Department[] | null = null;
  @Output() ok = new EventEmitter();
  @Output() cancel = new EventEmitter();

  genders = Genders;

  onClose() {
    this.isVisible = false;
    this.cancel.emit(false);
  }

  onSave() {
    if (!this.formComponent.isValid) { return; }
    this.ok.emit({...this.formComponent.value, id: this.student?.id});
  }
}
