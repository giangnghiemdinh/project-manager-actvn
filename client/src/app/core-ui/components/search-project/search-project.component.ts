import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Project } from '../../../common/models';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgForOf, NgIf } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { cloneDeep } from 'lodash';
import { FormComponent, FormTextComponent } from '../form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { UiScrollModule } from 'ngx-ui-scroll';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-search-project',
    standalone: true,
    imports: [
        NzModalModule,
        NzInputModule,
        FormsModule,
        NzButtonModule,
        NgIf,
        NgForOf,
        NzTableModule,
        FormComponent,
        FormTextComponent,
        NzSpinModule,
        UiScrollModule,
        RouterLink
    ],
    templateUrl: './search-project.component.html',
})
export class SearchProjectComponent implements OnChanges {
    @Input() isVisible = false;
    @Input() isMultiple = false;
    @Input() projects: Project[] | null = [];
    @Input() hiddenIds: number[] = [];
    @Output() isVisibleChange = new EventEmitter();
    @Output() select = new EventEmitter();
    filterProjects: Project[] = [];
    selected: Project[] = [];
    checked = false;
    indeterminate = false;

    ngOnChanges(changes: SimpleChanges): void {
        const { isVisible, projects, hiddenIds } = changes;
        if (isVisible && this.isVisible) {
            this.selected = [];
            this.checked = false;
            this.indeterminate = false;
        }
        if (projects && this.projects) {
            this.filterProjects = cloneDeep(this.projects);
        }
        if (hiddenIds && this.projects) {
            this.filterProjects = cloneDeep(this.projects.filter(p => !this.hiddenIds.includes(p.id!)));
        }
    }

    onSearch(event: { q: string }) {
        this.filterProjects = (this.projects || []).filter(p =>
            !this.hiddenIds.includes(p.id!)
            && (!event.q || p.name?.toLowerCase().includes(event.q.toLowerCase())));
    }

    isSelected(id: number) {
        return this.selected.some(s => s.id === id);
    }

    onSelect(project: Project) {
        if (!this.isMultiple) {
            this.selected = [ project ];
            this.onOk();
            return;
        }
        if (this.selected.some(s => s.id === project.id)) {
            this.selected = this.selected.filter(s => s.id !== project.id);
            return;
        }
        this.selected.push(project);
    }

    onOk() {
        this.select.emit(this.selected);
        this.isVisibleChange.emit(false);
    }

    onCancel() {
        this.isVisibleChange.emit(false);
    }
    
}
