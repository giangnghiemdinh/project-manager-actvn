import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'parseMessage',
    standalone: true
})
export class ParseMessagePipe implements PipeTransform {

    transform(message: string, params: {[key: string]: string | number}): string {
        if (!params) { return message; }
        for (const [key, value] of Object.entries(params)) {
            let href = '';
            let keyId = '';
            switch (true) {
                case key.includes('project'):
                    href = '#/project-management/';
                    keyId = 'projectId';
                    break;
                default:
                    href = '#/user-management/'
                    keyId = 'userId';
            }
            message = message.replaceAll(`{${key}}`, `<a href="${href + params[keyId]}"><strong>${value}</strong></a>`)
        }
        return message;
    }

}
