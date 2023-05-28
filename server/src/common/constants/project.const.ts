export enum ProjectStatus {
  PROPOSE = 'PROPOSE', // Đề xuất
  REFUSE = 'REFUSE', // Từ chối
  EXPIRED = 'EXPIRED', // Hết hạn

  PENDING = 'PENDING', // Chờ đăng kí
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
  IN_REVIEW = 'IN_REVIEW', // Chấm phản biện
  IN_PRESENTATION = 'IN_PRESENTATION', // Bảo vệ
  COMPLETED = 'COMPLETED', // Đã bảo vệ
  NOT_COMPLETED = 'NOT_COMPLETED', // Không bảo vệ
}

export enum ProjectApproveStatus {
  REFUSE = 'REFUSE',
  ACCEPT = 'ACCEPT',
}

export enum ProjectProgressType {
  REPORT = 'rp',
  REPORT_1 = 'rp1',
  REPORT_2 = 'rp2',
  REPORT_3 = 'rp3',
  REPORT_4 = 'rp4',
  INSTRUCTOR_REVIEW = 'instr',
  REVIEWER_REVIEW = 'rvr',
  COUNCIL_REVIEW = 'ccl',
  COMPLETED = 'cpt',
}

export const ProjectProgress = {
  rp: 'Đề cương chi tiết',
  rp1: 'Báo cáo tiến độ (lần 1)',
  rp2: 'Báo cáo tiến độ (lần 2)',
  rp3: 'Báo cáo tiến độ (lần 3)',
  rp4: 'Báo cáo tiến độ (lần 4)',
  instr: 'Nhận xét của CBHD',
  rvr: 'Nhận xét của CBPB',
  cpt: 'Đồ án hoàn thiện',
};

export enum ProjectQueryState {
  ALL = '',
  MANAGER_NOT_EXIST = 'mne',
  REVIEWER_NOT_EXIST = 'rne',
  COUNCIL_NOT_EXIST = 'cne',
  INSTRUCTOR = 'i',
  MANAGER = 'm',
  REVIEWER = 'r',
  COUNCIL = 'c',
}
