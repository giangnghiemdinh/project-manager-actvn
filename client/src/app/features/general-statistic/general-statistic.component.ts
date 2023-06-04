import { AfterViewInit, Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ToolbarComponent } from '../../core-ui/components';
import { setTitle } from '../../common/utilities';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Store } from '@ngrx/store';
import { LetDirective } from '../../core-ui/directives';
import { AsyncPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { Department, ProjectStatisticalResponse, Semester } from '../../common/models';
import * as echarts from 'echarts';
import { GeneralStatisticState, selectIsLoading, selectProjectStatistic } from './store/general-statistic.reducer';
import { GeneralStatisticActions } from './store/general-statistic.actions';
import { Router } from '@angular/router';
import { RO_GENERAL_STATISTIC } from '../../common/constants';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { orderBy, sortBy } from 'lodash';
import { debounceTime, fromEvent } from 'rxjs';
import { CompletedRatioPipe } from './completed-ratio.pipe';

@Component({
    selector: 'app-general-statistic',
    standalone: true,
    imports: [ NzButtonModule, ToolbarComponent, NzDropDownModule, LetDirective, AsyncPipe, NgForOf, NzSpinModule, NgIf, DecimalPipe, CompletedRatioPipe ],
    templateUrl: './general-statistic.component.html',
})
export class GeneralStatisticComponent implements AfterViewInit {

    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<GeneralStatisticState>);
    readonly #router = inject(Router);
    department$ = this.#commonStore.select(selectDepartments);
    semesters$ = this.#commonStore.select(selectSemesters);
    isLoading$ = this.#store.select(selectIsLoading);
    projectStatistic: ProjectStatisticalResponse | null = null;
    title = 'Thống kê tổng quan';

    department: Department | null = null
    semester: Semester | null = null;

    constructor() {
        setTitle(this.title);
        this.onLoad();
        this.windowResizeListener();
        this.#store.select(selectProjectStatistic)
            .pipe(takeUntilDestroyed())
            .subscribe(value => {
                this.projectStatistic = value;
                this.updateScoreDistributionChart();
                this.updatePresentationPointGrateChart();
                this.updateReviewerPointGrateChart();
                this.updateInstructorPointGrateChart();
            });
    }

    ngAfterViewInit(): void {
        this.updateScoreDistributionChart();
        this.updatePresentationPointGrateChart();
        this.updateReviewerPointGrateChart();
        this.updateInstructorPointGrateChart();
    }

    private onLoad() {
        this.#store.dispatch(GeneralStatisticActions.loadProjectStatistic());
    }

    private windowResizeListener() {
        fromEvent(window, 'resize')
            .pipe(
                takeUntilDestroyed(),
                debounceTime(100)
            )
            .subscribe(_ => {
                this.scoreDistributionChart?.resize();
                this.presentationPointGrateChart?.resize();
                this.reviewerPointGrateChart?.resize();
                this.instructorPointGrateChart?.resize();
            });
    }

    get scoreDistributionChart() {
        const element = document.getElementById('scoreDistributionChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get presentationPointGrateChart() {
        const element = document.getElementById('presentationPointGrateChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get reviewerPointGrateChart() {
        const element = document.getElementById('reviewerPointGrateChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get instructorPointGrateChart() {
        const element = document.getElementById('instructorPointGrateChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    onSelectDepartment(department?: Department) {
        this.department = department || null;
        this.navigate();
    }

    onSelectSemester(semester?: Semester) {
        this.semester = semester || null;
        this.navigate();
    }

    private navigate() {
        const queryParams: any = {};
        this.department && (queryParams.departmentId = this.department.id);
        this.semester && (queryParams.semesterId = this.semester.id);
        this.#router.navigate([RO_GENERAL_STATISTIC], { queryParams }).then(_ => this.onLoad());
    }

    updateScoreDistributionChart() {
        const chart = this.scoreDistributionChart;
        if (!chart) { return; }
        const column = Object.keys(this.projectStatistic?.scoreDistribution || {});
        const value = Object.values(this.projectStatistic?.scoreDistribution || {});
        const option = {
            xAxis: {
                type: 'category',
                data: column.sort((a, b) => +a - +b)
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: value,
                    type: 'line',
                    smooth: true
                }
            ]
        };
        chart.setOption(option);
    }

    updatePresentationPointGrateChart() {
        const chart = this.presentationPointGrateChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [];
        for (const [name, value] of Object.entries(this.projectStatistic?.presentationPointGrade || {})) {
            data.push({ value, name });
        }
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: sortBy(data, ['name', 'asc']),
                    percentPrecision: 0,
                    label: { show: true, formatter: (params: any) => `${params.percent}%\n${params.name}`, lineHeight: 16 }
                }
            ]
        };
        chart.setOption(option);
    }

    updateReviewerPointGrateChart() {
        const chart = this.reviewerPointGrateChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [];
        for (const [name, value] of Object.entries(this.projectStatistic?.reviewerPointGrade || {})) {
            data.push({ value, name });
        }
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: orderBy(data, ['name', 'asc']),
                    percentPrecision: 0,
                    label: { show: true, formatter: (params: any) => `${params.percent}%\n${params.name}`, lineHeight: 16 }
                }
            ]
        };
        chart.setOption(option);
    }

    updateInstructorPointGrateChart() {
        const chart = this.instructorPointGrateChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [];
        for (const [name, value] of Object.entries(this.projectStatistic?.instructorPointGrade || {})) {
            data.push({ value, name });
        }
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: orderBy(data, ['name', 'asc']),
                    percentPrecision: 0,
                    label: { show: true, formatter: (params: any) => `${params.percent}%\n${params.name}`, lineHeight: 16 }
                }
            ]
        };
        chart.setOption(option);
    }
}
