export interface UserSession {
    id?: number;
    deviceId?: string;
    deviceName?: string;
    ipAddress?: string;
    expired?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
