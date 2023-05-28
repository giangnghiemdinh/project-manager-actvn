import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { IGNORE_BASE_URL, IGNORE_TOKEN } from '../intercepters';
import { DEFAULT_ERROR_MESSAGE } from '../constants';
import { NotificationService } from '../services';
import { values } from 'lodash';

export interface HttpOptions {
    params?: HttpParams | {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    payload?: any,
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    ignoreBaseUrl?: boolean,
    ignoreToken?: boolean,
    ignoreAlert?: boolean
}

@Injectable({
    providedIn: 'root'
})
export class AbstractService {
    readonly #http = inject(HttpClient);
    readonly #notification = inject(NotificationService)

    protected get<T>(url: string, options?: HttpOptions) {
        return this.#http.get<T>(url, {
            headers: options?.headers,
            params: options?.params,
            context: this.buildContext(options)
        })
            .pipe(catchError((err: HttpErrorResponse) => {
                return this.handleError(err, options?.ignoreAlert);
            }));
    }

    protected post<T>(url: string, options?: HttpOptions) {
        return this.#http.post<T>(url, options?.payload || null, {
            headers: options?.headers,
            params: options?.params,
            context: this.buildContext(options)
        })
            .pipe(catchError((err: HttpErrorResponse) => {
                return this.handleError(err, options?.ignoreAlert);
            }));
    }

    protected put<T>(url: string, options?: HttpOptions) {
        return this.#http.put<T>(url, options?.payload || null, {
            headers: options?.headers,
            params: options?.params,
            context: this.buildContext(options)
        })
            .pipe(catchError((err: HttpErrorResponse) => {
                return this.handleError(err, options?.ignoreAlert);
            }));
    }

    protected delete<T>(url: string, options?: HttpOptions) {
        return this.#http.delete<T>(url, {
            headers: options?.headers,
            params: options?.params,
            body: options?.payload,
            context: this.buildContext(options)
        })
            .pipe(catchError((err: HttpErrorResponse) => {
                return this.handleError(err, options?.ignoreAlert);
            }));
    }

    private handleError(error: HttpErrorResponse, ignoreAlert?: boolean) {
        if (ignoreAlert !== true) {
            let message = '';
            switch (error.status) {
                case 0:
                    message = DEFAULT_ERROR_MESSAGE;
                    break;
                case 401:
                case 902:
                    break;
                case 403:
                    message = 'Bạn không có quyền truy cập chức năng này.';
                    break;
                case 429:
                    message = 'Thao tác quá nhanh! Vui lòng chậm lại.';
                    break;
                default:
                    const errorMessage = error.error?.message;
                    if (typeof errorMessage === 'string') {
                        message = errorMessage;
                    } else if (Array.isArray(errorMessage) && errorMessage.length) {
                        const [ first ] = errorMessage;
                        message = values(first.constraints || {}).join('\n');
                    } else {
                        message = DEFAULT_ERROR_MESSAGE;
                    }
            }
            message && this.#notification.error(message);
        }
        return throwError(error.error);
    }

    private buildContext(options?: HttpOptions) {
        const context = new HttpContext();
        options?.ignoreBaseUrl && context.set(IGNORE_BASE_URL, true);
        options?.ignoreToken && context.set(IGNORE_TOKEN, true);
        return context;
    }
}
