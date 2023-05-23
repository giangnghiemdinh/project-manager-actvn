import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Observable } from 'rxjs';
import { PaginationPayload, PaginationResponse, User, UserEvent, UserSession } from '../models';
import { UserImportPayload } from '../models/user-import.model';
import { UserStatus } from '../constants/user.constant';

@Injectable({
    providedIn: 'root'
})
export class UserService extends AbstractService  {

    getProfile(): Observable<User> {
        return this.get('user/profile');
    }

    getUsers(payload: PaginationPayload): Observable<PaginationResponse<User>> {
        return this.get('user', {...payload});
    }

    getUser(id: number): Observable<User> {
        return this.get(`user/${id}`);
    }

    createUser(payload: User): Observable<User> {
        return this.post('user', payload);
    }

    importUser(payload: UserImportPayload): Observable<User> {
        return this.post('user/import', payload);
    }

    updateUser(payload: User): Observable<User> {
        return this.put(`user/${payload.id}`, payload);
    }

    changeStatus(id: number, status: UserStatus): Observable<void> {
        return this.post(`user/change-status`, { id, status });
    }

    getEvents(payload: PaginationPayload): Observable<PaginationResponse<UserEvent>> {
        return this.get('user/events', payload)
    }

    getSessions(payload: PaginationPayload): Observable<PaginationResponse<UserSession>> {
        return this.get('user/sessions', payload)
    }
}
