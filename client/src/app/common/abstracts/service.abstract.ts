import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

export type Params = { [param: string]: string | number | boolean | readonly (string | number | boolean)[]; };

@Injectable({
    providedIn: 'root'
})
export class AbstractService {
    private readonly http = inject(HttpClient);

    protected get(url: string, params?: Params): Observable<any> {
        return this.http.get(url, { params })
            .pipe(
                catchError((err: HttpErrorResponse) => { throw this.handleErr(err); })
            );
    }

    protected delete(url: string, params?: Params): Observable<any> {
        return this.http.delete(url, { params })
            .pipe(
                catchError((err: HttpErrorResponse) => { throw this.handleErr(err); })
            );
    }

    protected post(url: string, body?: any): Observable<any> {
        return this.http.post(url, body)
            .pipe(
                catchError((err: HttpErrorResponse) => { throw this.handleErr(err); })
            );
    }

    protected put(url: string, body?: any): Observable<any> {
        return this.http.put(url, body)
            .pipe(
                catchError((err: HttpErrorResponse) => { throw this.handleErr(err); })
            );
    }

    private handleErr(err: HttpErrorResponse) {
        return err.error?.message
            ? err.error
            : { message: 'Có lỗi xảy ra! Vui lòng thử lại sau.' };
    }
}
