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
import { ProjectStatus, ProjectStatuses } from '../../../../common/constants/project.constant';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { cloneDeep } from 'lodash';
import { FormGroup } from '@angular/forms';
import { NotificationService } from '../../../../common/services';
import { NgIf } from '@angular/common';

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
        const { project } = changes;
        if (this.isVisible) {
            this.instructor = null;
            this.students = [];
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
        }
    }

    onClose() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        const value: any = this.formComponent.value;
        value.id = this.project?.id;
        value.instructorId = this.instructor?.id;
        value.students = this.students?.map(s => ({ id: s.id })) || [];
        if (this.isPropose) { value.status = ProjectStatus.PROPOSE; }
        else if (value.students.length) { value.status = ProjectStatus.IN_PROGRESS }
        else { value.status = ProjectStatus.PENDING; }
        this.ok.emit(value);
    }

    onSearchUser() {
        this.isVisibleSearchUser = true;
    }

    onSearchStudent() {
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
        const currentSemester = this.formComponent.getValue('semester');
        if (currentSemester) {
            for (const student of students) {
                const find = student.projects?.find(p => p.id !== this.project?.id && p.semester === currentSemester);
                if (find) {
                    this.notification.error(`Sinh viên ${student.fullName} đang thực hiện đề tài ${find.name} ở kỳ ${currentSemester}. Vui lòng kiểm tra lại!`);
                    return;
                }
            }
        }
        this.students = cloneDeep(students);
        this.formComponent.setValue('studentCodes', this.students.map(s => s.code).join(', '));
    }

    onInstructorChange(event: { form: FormGroup, value: string }) {
        if (!event.value) {
            this.instructor = null;
        }
    }
}
