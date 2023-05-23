import { AfterViewInit, Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ToolbarComponent } from '../../core-ui/components';
import { setTitle } from '../../common/utilities';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonState, selectDepartments, selectSemesters } from '../../common/stores';
import { Store } from '@ngrx/store';
import { LetDirective } from '../../core-ui/directives';
import { AsyncPipe, NgForOf } from '@angular/common';
import { Department, Semester } from '../../common/models';
import * as echarts from 'echarts';

@Component({
    selector: 'app-general-statistic',
    standalone: true,
    imports: [ NzButtonModule, ToolbarComponent, NzDropDownModule, LetDirective, AsyncPipe, NgForOf ],
    templateUrl: './general-statistic.component.html',
})
export class GeneralStatisticComponent implements AfterViewInit {

    private readonly commonStore = inject(Store<CommonState>);
    department$ = this.commonStore.select(selectDepartments);
    semesters$ = this.commonStore.select(selectSemesters);
    title = 'Thống kê tổng quan';

    department: Department | null = null
    semester: Semester | null = null;

    constructor() {
        setTitle(this.title);
    }

    ngAfterViewInit(): void {
        this.setChart1();
        this.setChart2();
    }

    onSelectDepartment(department?: Department) {
        this.department = department || null;
    }

    onSelectSemester(semester?: Semester) {
        this.semester = semester || null;
    }

    setChart1() {
        const chartDom = document.getElementById('chart1');
        if (!chartDom) { return; }
        const myChart = echarts.init(chartDom);
        const option = {
            xAxis: {
                type: 'category',
                data: ['1_2021-2022', '2_2021-2022', '1_2022-2023', '2_2022-2023']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: [8.5, 7, 9.3, 8.4, 7.6, 8.2, 8.4],
                    type: 'line',
                    smooth: true
                }
            ]
        };

        option && myChart.setOption(option);

    }

    setChart2() {
        const chartDom = document.getElementById('chart2');
        if (!chartDom) { return; }
        const myChart = echarts.init(chartDom);

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
                    data: [
                        { value: 294, name: 'A+' },
                        { value: 423, name: 'A' },
                        { value: 734, name: 'B+' },
                        { value: 484, name: 'B' },
                        { value: 300, name: 'C+' },
                        { value: 345, name: 'D+' },
                        { value: 100, name: 'D' },
                        { value: 50, name: 'F' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && myChart.setOption(option);
    }
}
