import { Gender, Role } from '../constants';

export interface User {
    id?: number;
    fullName?: string;
    email?: string;
    avatar?: null;
    phone?: string;
    isActive?: boolean;
    gender?: Gender;
    birthday?: Date;
    address?: string;
    workPlace?: string;
    lastLogin?: Date;
    role?: Role;
}
