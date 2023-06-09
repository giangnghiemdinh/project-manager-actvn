import { Component, inject, ViewChild } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AsyncPipe, DatePipe, NgForOf } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import {
    ConfirmComponent,
    FormComponent,
    FormFileComponent,
    FormSelectComponent,
    FormTextComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent,
    ToolbarComponent,
    UserFormComponent
} from '../../core-ui/components';
import { setTitle } from '../../common/utilities';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Store } from '@ngrx/store';
import { CommonState, selectDepartments } from '../../common/stores';
import {
    selectIsImportVisible,
    selectIsLoading,
    selectIsVisible,
    selectPagination,
    selectUser,
    selectUsers,
    UserState
} from './store/user.reducer';
import { Router, RouterLink } from '@angular/router';
import { selectQueryParams } from '../../common/stores/router';
import { RO_USER_MANAGER, Roles, UserStatus } from '../../common/constants';
import { User, UserImportPayload } from '../../common/models';
import { UserActions } from './store/user.actions';
import { DriverUrlPipe, GenderPipe, RankFullNamePipe, RolePipe } from '../../core-ui/pipes';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserImportComponent } from './components/user-import/user-import.component';
import { first } from 'rxjs';

@Component({
    selector: 'app-user-management',
    standalone: true,
    templateUrl: './user-management.component.html',
    imports: [
        NzInputModule,
        NzButtonModule,
        NzTableModule,
        NgForOf,
        NzModalModule,
        ToolbarComponent,
        NzPaginationModule,
        FormComponent,
        FormSelectComponent,
        FormTextComponent,
        AsyncPipe,
        TableComponent,
        GenderPipe,
        TableColumnDirective,
        TableCellDirective,
        DatePipe,
        UserFormComponent,
        DriverUrlPipe,
        NzAvatarModule,
        NzDropDownModule,
        UserImportComponent,
        FormFileComponent,
        RouterLink,
        RolePipe,
        RankFullNamePipe
    ]
})
export class UserManagementComponent {
    @ViewChild('filterForm') filterForm!: FormComponent;
    
    readonly #commonStore = inject(Store<CommonState>);
    readonly #store = inject(Store<UserState>);
    readonly #router = inject(Router);
    readonly #modal = inject(NzModalService);
    
    queryParams$ = this.#store.select(selectQueryParams);
    users$ = this.#store.select(selectUsers);
    pagination$ = this.#store.select(selectPagination);
    isLoading$ = this.#store.select(selectIsLoading);
    isVisible$ = this.#store.select(selectIsVisible);
    isImportVisible$ = this.#store.select(selectIsImportVisible);
    user$ = this.#store.select(selectUser);
    departments$ = this.#commonStore.select(selectDepartments);
    title = 'Danh sách người dùng';
    url = RO_USER_MANAGER;
    roles = Roles;

    constructor() {
        setTitle(this.title);
        this.onLoad();
    }

    onSearch(value: any) {
        value.page = 1;
        this.#router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onPageChanges(event: { index: number, size: number }) {
        const value: any = this.filterForm.value;
        value.page = event.index;
        value.limit = event.size;
        this.#router.navigate([this.url], { queryParams: value }).then(_ => this.onLoad());
    }

    onLoad() {
        this.#store.dispatch(UserActions.loadUsers());
    }

    onAdd() {
        this.#store.dispatch(UserActions.updateVisible({ isVisible: true }));
    }

    onImport() {
        this.#store.dispatch(UserActions.updateImportVisible({ isVisible: true }));
    }

    onEdit(id: number) {
        this.#store.dispatch(UserActions.loadUser({ payload: { id } }));
    }

    onChangeStatus(user: User) {
        const status = user.isActive ? UserStatus.DE_ACTIVE : UserStatus.ACTIVE;
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn ${user.isActive ? 'huỷ kích hoạt' : 'kích hoạt'} người dùng?`,
                okText: 'Đồng ý',
                okDanger: user.isActive
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm
                && this.#store.dispatch(UserActions.changeStatusUser({ payload: { id: user.id!, status } })));
    }

    onSave(value: User) {
        this.#store.dispatch(value.id
            ? UserActions.updateUser({ payload: value })
            : UserActions.createUser({ payload: value })
        );
    }

    onSaveImport(payload: UserImportPayload) {
        this.#store.dispatch(UserActions.importUser({ payload }));
    }

    onCancel() {
        this.#store.dispatch(UserActions.updateVisible({ isVisible: false }));
    }

    onCancelImport() {
        this.#store.dispatch(UserActions.updateImportVisible({ isVisible: false }));
    }
}
