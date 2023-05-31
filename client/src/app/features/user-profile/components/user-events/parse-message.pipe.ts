import { Pipe, PipeTransform } from '@angular/core';
import {
    RO_EXAMINER_COUNCIL,
    RO_MANAGER_STAFF,
    RO_PROJECT_MANAGER,
    RO_REVIEWER_STAFF,
    RO_USER_MANAGER
} from '../../../../common/constants';

@Pipe({
    name: 'parseMessage',
    standalone: true
})
export class ParseMessagePipe implements PipeTransform {

    transform(message: string, params: {[key: string]: string | number}): {
        message: string,
        routerLink?: string,
        queryParams?: { [key: string]: string | number }
    } {
        if (!params) { return { message }; }
        for (const [key, value] of Object.entries(params)) {
            message = message.replaceAll(`{${key}}`, `<strong>${value}</strong>`);
        }
        let routerLink = '';
        let queryParams: { [key: string]: string | number } = {};
        switch (true) {
            case 'projectId' in params:
                routerLink = `/${RO_PROJECT_MANAGER}/${params['projectId']}`;
                break;
            case 'userId' in params:
                routerLink = `/${RO_USER_MANAGER}/${params['userId']}`;
                break;
            case 'managerId' in params:
                routerLink = `/${RO_MANAGER_STAFF}`;
                queryParams = { q: params['managerFullName'], semesterId: params['semesterId'] };
                break;
            case 'reviewerId' in params:
                routerLink = `/${RO_REVIEWER_STAFF}`;
                queryParams = { q: params['reviewerFullName'], semesterId: params['semesterId'] };
                break;
            case 'councilId' in params :
                routerLink = `/${RO_EXAMINER_COUNCIL}`;
                queryParams = { q: params['councilLocation'], semesterId: params['semesterId'] };
                break;
        }
        return { message, routerLink, queryParams };
    }

}
