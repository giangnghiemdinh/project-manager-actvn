import { deleteCookie, getCookie, setCookie } from './cookie';
import { DEVICE_EXPIRE, DEVICE_ID, REFRESH_TOKEN, TOKEN, TOKEN_EXPIRE } from '../constants';
import * as uuid from 'uuid';

export function saveToken(accessToken: string, refreshToken: string) {
    setCookie(TOKEN, accessToken, { hours: TOKEN_EXPIRE });
    setCookie(REFRESH_TOKEN, refreshToken, { hours: TOKEN_EXPIRE });
}

export function clearToken() {
    deleteCookie(TOKEN);
    deleteCookie(REFRESH_TOKEN);
}

export function getDeviceId() {
    let did = getCookie(DEVICE_ID);
    if (!did) {
        did = uuid.v4();
        setCookie(DEVICE_ID, did, { hours: DEVICE_EXPIRE });
    }
    return did;
}

export function getToken() {
    return getCookie(TOKEN) || '';
}

export function getRefreshToken() {
    return getCookie(REFRESH_TOKEN) || '';
}
