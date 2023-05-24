import { environment } from './environments/environment';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { NZ_DATE_LOCALE, NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { provideStore } from '@ngrx/store';
import { appRoutes } from './app/app.routes';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { appReducers, metaReducers } from './app/app.reducer';
import { provideEffects } from '@ngrx/effects';
import { appEffects } from './app/app.effects';
import { apiPrefixInterceptor, authInterceptor } from './app/common/intercepters';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { vi as viVn } from 'date-fns/locale';
import { CustomSerializer } from './app/common/models';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS } from 'ng-recaptcha';

if (environment.production) {
    enableProdMode();
}

registerLocaleData(vi);

void bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        provideHttpClient(
            withInterceptors([ apiPrefixInterceptor, authInterceptor ])
        ),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                scrollPositionRestoration: 'top',
            }),
        ),
        provideStore(appReducers, { metaReducers: metaReducers }),
        provideRouterStore({ serializer: CustomSerializer }),
        provideStoreDevtools(),
        provideEffects(appEffects),
        importProvidersFrom([ NzNotificationModule ]),
        { provide: NZ_I18N, useValue: vi_VN },
        { provide: NZ_DATE_LOCALE, useValue: viVn },
        { provide: RECAPTCHA_LANGUAGE, useValue: 'vn' },
        { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.recaptchaSiteKey } }
    ]
});
