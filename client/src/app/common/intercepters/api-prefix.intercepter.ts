import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const IGNORE_BASE_URL = new HttpContextToken<boolean>(() => false);

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
    let url = req.url;
    if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
        const baseUrl = environment.baseUrl;
        url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }
    return next(req.clone({ url }));
}
