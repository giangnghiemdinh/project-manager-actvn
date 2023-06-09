import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import {
    PaginationPayload,
    PaginationResponse,
    User,
    UserChangeEmail,
    UserChangePassword,
    UserEvent,
    UserImportPayload,
    UserSession
} from '../models';
import { TwoFactorMethod, UserStatus } from '../constants';
import { toNonAccentVietnamese } from '../utilities';
import { isNotNil } from 'ng-zorro-antd/core/util';

@Injectable({
    providedIn: 'root'
})
export class UserService extends AbstractService {

    getProfile() {
        return this.get<User>('user/profile');
    }

    getUsers(params: PaginationPayload) {
        return this.get<PaginationResponse<User>>('user', { params });
    }

    getUser(id: number) {
        return this.get<User>(`user/${ id }`);
    }

    createUser(payload: User) {
        return this.post<User>('user', { payload: this.parsePayload(payload) });
    }

    importUser(payload: UserImportPayload) {
        return this.post<User>('user/import', { payload });
    }

    updateUser(payload: User) {
        return this.put<User>(`user/${ payload.id }`, { payload: this.parsePayload(payload) });
    }

    updateProfile(payload: User) {
        return this.put<User>(`user/profile`, { payload: this.parsePayload(payload) });
    }

    changeStatus(id: number, status: UserStatus) {
        return this.post<void>(`user/change-status`, { payload: { id, status } });
    }

    getEvents(params: PaginationPayload) {
        return this.get<PaginationResponse<UserEvent>>('user/events', { params })
    }

    getSessions(params: PaginationPayload) {
        return this.get<PaginationResponse<UserSession>>('user/sessions', { params })
    }

    verifyNewEmail(payload: UserChangeEmail) {
        return this.post<void>('user/verify-email', { payload });
    }

    changeEmail(payload: UserChangeEmail) {
        return this.post<void>('user/change-email', { payload });
    }

    changePassword(payload: UserChangePassword) {
        return this.post<void>('user/change-password', { payload });
    }

    change2FA(payload: { id?: number, twoFactory: TwoFactorMethod }) {
        return this.post<void>('user/change-2fa', { payload });
    }

    deleteSession(id: number) {
        return this.delete<void>(`user/session/${id}`);
    }

    private parsePayload(user: User) {
        const formData: FormData = new FormData();

        for (let [key, value] of Object.entries(user)) {
            switch (key) {
                case 'avatarFile':
                    if (value) {
                        const extension = '.' + value.name.split('.').pop().toLowerCase();
                        formData.append('avatarFile', value, toNonAccentVietnamese(user.fullName || '') + extension);
                    }
                    break;
                case 'birthday':
                    value && formData.append(key, value);
                    break;
                default:
                    formData.append(key, isNotNil(value) ? value : '');
            }
        }

        return formData;
    }
}
