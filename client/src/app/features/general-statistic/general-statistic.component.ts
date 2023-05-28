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
import { sortBy } from 'lodash';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
    selector: 'app-general-statistic',
    standalone: true,
    imports: [ NzButtonModule, ToolbarComponent, NzDropDownModule, LetDirective, AsyncPipe, NgForOf, NzSpinModule, NgIf, DecimalPipe ],
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
                this.updateOutScoreChart();
                this.updateReviewRatioChart();
                this.updatePresentationRatioChart();
            });
    }

    ngAfterViewInit(): void {
        this.updateScoreDistributionChart();
        this.updateOutScoreChart();
        this.updateReviewRatioChart();
        this.updatePresentationRatioChart();
    }

    private onLoad() {
        this.#store.dispatch(GeneralStatisticActions.loadProjectStatistic());
    }

    private windowResizeListener() {
        fromEvent(window, 'resize')
            .pipe(
                takeUntilDestroyed(),
                debounceTime(200)
            )
            .subscribe(_ => {
                this.scoreDistributionChart?.resize();
                this.outscoreChart?.resize();
                this.reviewRatioChart?.resize();
                this.presentationRatioChart?.resize();
            });
    }

    get scoreDistributionChart() {
        const element = document.getElementById('scoreDistributionChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get outscoreChart() {
        const element = document.getElementById('outscoreChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get reviewRatioChart() {
        const element = document.getElementById('reviewRatioChart');
        if (!element) { return null; }
        return echarts.getInstanceByDom(element) || echarts.init(element);
    }

    get presentationRatioChart() {
        const element = document.getElementById('presentationRatioChart');
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
                data: column
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

    updateOutScoreChart() {
        const chart = this.outscoreChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [];
        for (const [name, value] of Object.entries(this.projectStatistic?.outpoint || {})) {
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

    updateReviewRatioChart() {
        const chart = this.reviewRatioChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [
            {
                name: 'Chấm phản biện',
                value: this.projectStatistic?.totalReview || 0
            },
            {
                name: 'Không phản biện',
                value: (this.projectStatistic?.total || 0) - (this.projectStatistic?.totalReview || 0)
            },
        ];
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
                    data: data,
                    percentPrecision: 0,
                    label: { show: true, formatter: (params: any) => `${params.percent}%\n${params.name}`, lineHeight: 16 }
                }
            ]
        };
        chart.setOption(option);
    }

    updatePresentationRatioChart() {
        const chart = this.presentationRatioChart;
        if (!chart) { return; }
        const data: { value: number, name: string }[] = [
            {
                name: 'Bảo vệ',
                value: this.projectStatistic?.totalReview || 0
            },
            {
                name: 'Không bảo vệ',
                value: (this.projectStatistic?.total || 0) - (this.projectStatistic?.totalPresentation || 0)
            },
        ];
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
                    data: data,
                    percentPrecision: 0,
                    label: { show: true, formatter: (params: any) => `${params.percent}%\n${params.name}`, lineHeight: 16 }
                }
            ]
        };
        chart.setOption(option);
    }
}
