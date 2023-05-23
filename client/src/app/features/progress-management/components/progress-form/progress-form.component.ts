import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
    FormComponent,
    FormDateComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormTextComponent
} from '../../../../core-ui/components';
import { Department, Progress, Semester } from '../../../../common/models';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

@Component({
    selector: 'app-progress-form',
    standalone: true,
    imports: [ NzModalModule, NzSpinModule, FormComponent, FormTextComponent, FormDateComponent, FormSelectComponent, FormTextareaComponent, NzButtonModule ],
    templateUrl: './progress-form.component.html',
})
export class ProgressFormComponent implements OnChanges {
    @ViewChild('form') formComponent!: FormComponent;
    @Input() isLoading: boolean | null = false;
    @Input() isVisible: boolean | null = false;
    @Input() progress: Progress | null = null;
    @Input() semesters: Semester[] | null = null;
    @Input() departments: Department[] | null = null;
    @Output() cancel = new EventEmitter();
    @Output() ok = new EventEmitter();
    data: any;

    ngOnChanges(changes: SimpleChanges): void {
        const { progress } = changes;
        if (progress) {
            if (this.progress) {
                const data: any = {};
                data.semesterId = this.progress.semesterId;
                data.departmentId = this.progress.departmentId;
                data.propose = [this.progress.proposeStart, this.progress.proposeEnd];
                data.report = [this.progress.reportStart, this.progress.reportEnd];
                data.report1 = [this.progress.report1Start, this.progress.report1End];
                data.report2 = [this.progress.report2Start, this.progress.report2End];
                data.report3 = [this.progress.report3Start, this.progress.report3End];
                data.report4 = [this.progress.report4Start, this.progress.report4End];
                data.instrCmt = [this.progress.instrCmtStart, this.progress.instrCmtEnd];
                data.rvrCmt = [this.progress.rvrCmtStart, this.progress.rvrCmtEnd];
                data.present = [this.progress.presentStart, this.progress.presentEnd];
                data.completed = [this.progress.completedStart, this.progress.completedEnd];
                this.data = data;
            } else {
                this.data = null;
            }
        }
    }

    onClose() {
        this.isVisible = false;
        this.cancel.emit(false);
    }

    disabledProposeDate = (current: Date): boolean => {
        return this.disableDate('', 'report', current);
    }

    disabledReportDate = (current: Date): boolean => {
        return this.disableDate('propose', 'report1', current);
    }

    disabledReport1Date = (current: Date): boolean => {
        return this.disableDate('report', 'report2', current);
    }

    disabledReport2Date = (current: Date): boolean => {
        return this.disableDate('report1', 'report3', current);
    }

    disabledReport3Date = (current: Date): boolean => {
        return this.disableDate('report2', 'report4', current);
    }

    disabledReport4Date = (current: Date): boolean => {
        return this.disableDate('report3', 'instrCmt', current);
    }

    disabledInstrCmtDate = (current: Date): boolean => {
        return this.disableDate('report4', 'rvrCmt', current);
    }

    disabledRvrCmtDate = (current: Date): boolean => {
        return this.disableDate('instrCmt', 'present', current);
    }

    disabledPresentDate = (current: Date): boolean => {
        return this.disableDate('rvrCmt', 'completed', current);
    }

    disabledCompletedDate = (current: Date): boolean => {
        return this.disableDate('present', '', current);
    }

    disableDate(prevField: string, nextField: string, current: Date) {
        const semester = this.currentSemester;
        const prevValue = prevField ? this.formComponent.getValue(prevField) : null;
        const nextValue = nextField ? this.formComponent.getValue(nextField) : null;
        const min = (!!prevValue && prevValue[1]) || semester?.start || null;
        const max = (!!nextValue && nextValue[0]) || semester?.end || null;
        return (min && differenceInCalendarDays(current, new Date(min)) < 0)
            || (max && differenceInCalendarDays(current, new Date(max)) > 0);
    }

    get currentSemester() {
        const semesterId = this.formComponent.getValue('semesterId');
        if (!semesterId) { return null; }
        return this.semesters?.find(s => s.id === semesterId) || null;
    }

    onSave() {
        if (!this.formComponent.isValid) { return; }
        const value: any = this.formComponent.value;
        const payload: Progress = {};
        payload.id = this.progress?.id;
        payload.departmentId = value.departmentId;
        payload.semesterId = value.semesterId;

        const [proposeStart, proposeEnd] = value.propose;
        payload.proposeStart = proposeStart;
        payload.proposeEnd = proposeEnd;

        const [reportStart, reportEnd] = value.report;
        payload.reportStart = reportStart;
        payload.reportEnd = reportEnd;

        const [report1Start, report1End] = value.report1;
        payload.report1Start = report1Start;
        payload.report1End = report1End;

        const [report2Start, report2End] = value.report2;
        payload.report2Start = report2Start;
        payload.report2End = report2End;

        const [report3Start, report3End] = value.report3;
        payload.report3Start = report3Start;
        payload.report3End = report3End;

        const [report4Start, report4End] = value.report4;
        payload.report4Start = report4Start;
        payload.report4End = report4End;

        const [instrCmtStart, instrCmtEnd] = value.instrCmt;
        payload.instrCmtStart = instrCmtStart;
        payload.instrCmtEnd = instrCmtEnd;

        const [rvrCmtStart, rvrCmtEnd] = value.rvrCmt;
        payload.rvrCmtStart = rvrCmtStart;
        payload.rvrCmtEnd = rvrCmtEnd;

        const [presentStart, presentEnd] = value.present;
        payload.presentStart = presentStart;
        payload.presentEnd = presentEnd;

        const [completedStart, completedEnd] = value.completed;
        payload.completedStart = completedStart;
        payload.completedEnd = completedEnd;

        this.ok.emit(payload);
    }
}
