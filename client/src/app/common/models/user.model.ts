import { Gender, Role, TwoFactorMethod } from '../constants';

export interface User {
    id?: number;
    fullName?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    isActive?: boolean;
    gender?: Gender;
    birthday?: Date;
    address?: string;
    workPlace?: string;
    lastLogin?: Date;
    role?: Role;
    rank?: string;
    avatarFile?: any;
    twoFactory?: TwoFactorMethod;
}
