import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import {
    FormComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormTextComponent,
    SearchStudentComponent,
    SearchUserComponent
} from '../../../../core-ui/components';
import { Department, Project, Semester, Student, User } from '../../../../common/models';
import { ProjectStatuses } from '../../../../common/constants';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { cloneDeep } from 'lodash';
import { FormGroup } from '@angular/forms';
import { NotificationService } from '../../../../common/services';
import { NgIf } from '@angular/common';
import { timer } from 'rxjs';

@Component({
    selector: 'app-project-form',
    standalone: true,
    imports: [ NzModalModule, NzSpinModule, FormComponent, FormTextComponent, FormSelectComponent, FormTextareaComponent, NzButtonModule, SearchUserComponent, SearchStudentComponent, NgIf ],
    templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnChanges {
    private readonly notification = inject(NotificationService);
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() project: Project | null = null;
    @Input() isPropose = false;
    @Input() departments: Department[] | null = null;
    @Input() semesters: Semester[] | null = null;
    @Output() cancel = new EventEmitter();
    @Output() ok = new EventEmitter();
    statuses = ProjectStatuses;
    isVisibleSearchUser = false;
    isVisibleSearchStudent = false;
    instructor: User | null = null;
    students: Student[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        const { project, isVisible } = changes;
        if (isVisible && !this.isVisible) {
            timer(200).subscribe(_ => {
                this.instructor = null;
                this.students = [];
                this.formComponent.enable();
            });
        }
        if (project && this.project) {
            const project = cloneDeep(this.project)
            project.instructorName = this.project.instructor?.fullName || '';
            project.studentCodes = this.project.students
                ?.map(s => s.code)
                .join(', ');
            this.instructor = this.project.instructor || null;
            this.students = this.project.students || [];
            this.project = { ...project };
            !!(project && project.managerStaffId) && timer(0).subscribe(_ => this.formComponent.disable());
        }
    }

    onCancel() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        const value = this.formComponent.value;
        this.ok.emit({
            ...value,
            id: this.project?.id,
            instructorId: !!value.instructorName && this.instructor?.id,
            students: (!!value.studentCodes && this.students?.map(s => ({ id: s.id, fullName: s.fullName }))) || []
        });
    }

    onSearchUser() {
        if (!!(this.project && this.project.managerStaffId)) { return; }
        this.isVisibleSearchUser = true;
    }

    onSearchStudent() {
        if (!!(this.project && this.project.managerStaffId)) { return; }
        this.isVisibleSearchStudent = true;
    }

    onSelectUser(users: User[]) {
        if (!users.length) { return; }
        const [ selected ] = users;
        this.instructor = cloneDeep(selected);
        this.formComponent.setValue('instructorName', this.instructor.fullName);
    }

    onSelectStudent(students: Student[]) {
        if (!students.length) { return; }
        this.students = [...students];
        this.formComponent.setValue('studentCodes', this.students.map(s => s.code).join(', '));
    }

    onInstructorChange(event: { form: FormGroup, value: string }) {
        if (!event.value) {
            this.instructor = null;
        }
    }
}
