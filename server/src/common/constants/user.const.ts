export enum Role {
  ADMINISTRATOR = 'Administrator',
  CENSOR = 'Censor',
  LECTURER = 'Lecturer',
}

export const RoleName = {
  Administrator: 'Quản trị viên',
  Censor: 'Kiểm duyệt viên',
  Lecturer: 'Giảng viên',
};

export enum Gender {
  Male,
  Female,
}

export enum Rank {
  DoctorProfessor = 'PGS. TS',
  Doctor = 'TS',
  Master = 'ThS',
  Engineer = 'KS',
  Other = '',
}

export enum UserStatus {
  DE_ACTIVE = 'de_active',
  ACTIVE = 'active',
}
