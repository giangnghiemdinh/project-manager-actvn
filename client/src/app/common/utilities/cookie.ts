export interface CookieOption {
    hours?: number;
    domain?: string;
    path?: string;
    expires?: string;
}

export function setCookie(cname: string, cvalue: any, opts: CookieOption = {}) {
    if (typeof cvalue == 'object') cvalue = JSON.stringify(cvalue);
    let cookie = cname + "=" + cvalue;
    if (opts.expires) {
        cookie += `;expires=${ opts.expires }`;
    } else if (opts.hours) {
        const date = new Date();
        date.setTime(date.getTime() + ( opts.hours * 60 * 60 * 1000 ));
        cookie += `;expires=${ date.toUTCString() }`;
    }
    if (opts.domain) cookie += `;domain=${ opts.domain }`;
    cookie += `;path=${ opts.path || '/' }`;
    document.cookie = cookie;
}

export function getCookie(cname: string) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = ca.length - 1; i >= 0; i--) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function deleteCookie(cname: string, opts: CookieOption = {}) {
    opts.expires = 'Thu, 01 Jan 1970 00:00:00 UTC';
    setCookie(cname, '', opts);
}

export function deleteAllCookie() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        deleteCookie(name.trim());
    }
}
