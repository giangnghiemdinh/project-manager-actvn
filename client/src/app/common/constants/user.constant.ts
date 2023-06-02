export enum Role {
    ADMINISTRATOR = 'Administrator',
    CENSOR = 'Censor',
    LECTURER = 'Lecturer',
}

export enum Gender {
    Male,
    Female,
}

export enum UserStatus {
    DE_ACTIVE = 'de_active',
    ACTIVE = 'active',
}

export const Genders = [
    { value: Gender.Male, label: 'Nam' },
    { value: Gender.Female, label: 'Nữ' },
];

export const Roles = [
    { value: Role.ADMINISTRATOR, label: 'Quản trị viên' },
    { value: Role.CENSOR, label: 'Kiểm duyệt viên' },
    { value: Role.LECTURER, label: 'Giảng viên' },
];

export enum ExaminerCouncilPosition {
    CHAIRPERSON = 'CHAIRPERSON',
    SECRETARY = 'SECRETARY',
    ADMINISTRATIVE_SECRETARY = 'ADMINISTRATIVE_SECRETARY',
    MEMBER = 'MEMBER',
}

export const ExaminerCouncilPositions = [
    { value: ExaminerCouncilPosition.CHAIRPERSON, label: 'Chủ tịch' },
    { value: ExaminerCouncilPosition.SECRETARY, label: 'Thư ký' },
    { value: ExaminerCouncilPosition.ADMINISTRATIVE_SECRETARY, label: 'Thư ký hành chính' },
    { value: ExaminerCouncilPosition.MEMBER, label: 'Uỷ viên' },
];

export const Ranks = [
    { value: 'PGS. TS', label: 'PGS, Tiến sĩ' },
    { value: 'TS', label: 'Tiến sĩ' },
    { value: 'ThS', label: 'Thạc sĩ' },
    { value: 'KS', label: 'Kỹ sư' },
    { value: '', label: 'Khác' },
];

