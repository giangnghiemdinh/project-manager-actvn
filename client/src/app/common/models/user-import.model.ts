import { User } from './user.model';

export interface UserImportPayload {
    duplicateEmail: number;
    users: User[]
}
