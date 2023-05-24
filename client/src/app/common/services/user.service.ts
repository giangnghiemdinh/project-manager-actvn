import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { PaginationPayload, PaginationResponse, User, UserEvent, UserImportPayload, UserSession } from '../models';
import { UserStatus } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class UserService extends AbstractService {

    getProfile() {
        return this.get<User>('user/profile');
    }

    getUsers(payload: PaginationPayload) {
        return this.get<PaginationResponse<User>>('user', { payload });
    }

    getUser(id: number) {
        return this.get<User>(`user/${ id }`);
    }

    createUser(payload: User) {
        return this.post<User>('user', { payload });
    }

    importUser(payload: UserImportPayload) {
        return this.post<User>('user/import', { payload });
    }

    updateUser(payload: User) {
        return this.put<User>(`user/${ payload.id }`, { payload });
    }

    changeStatus(id: number, status: UserStatus) {
        return this.post<void>(`user/change-status`, { payload: { id, status } });
    }

    getEvents(payload: PaginationPayload) {
        return this.get<PaginationResponse<UserEvent>>('user/events', { payload })
    }

    getSessions(payload: PaginationPayload) {
        return this.get<PaginationResponse<UserSession>>('user/sessions', { payload })
    }
}
