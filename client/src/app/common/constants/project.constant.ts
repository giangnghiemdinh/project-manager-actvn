export enum ProjectStatus {
  PROPOSE = 'PROPOSE', // Đề xuất
  REFUSE = 'REFUSE', // Từ chối
  EXPIRED = 'EXPIRED', // Hết hạn

  PENDING = 'PENDING', // Chờ đăng kí
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
  IN_REVIEW = 'IN_REVIEW', // Chấm phản biện
  IN_PRESENTATION = 'IN_PRESENTATION', // Đang bảo vệ
  COMPLETED = 'COMPLETED', // Hoàn thành
  NOT_COMPLETED = 'NOT_COMPLETED', // Không hoàn thành
};

export const ProjectApproveStatuses = [
  { value: ProjectStatus.PROPOSE, label: 'Đề xuất', class: 'bg-gray-200 text-gray-600' },
  { value: ProjectStatus.REFUSE, label: 'Từ chối', class: 'bg-yellow-400 text-white' },
  { value: ProjectStatus.EXPIRED, label: 'Hết hạn', class: 'bg-red-400 text-white' },
];

export const ProjectStatuses = [
  { value: ProjectStatus.PENDING, label: 'Chờ đăng ký', class: 'bg-blue-400 text-white' },
  { value: ProjectStatus.IN_PROGRESS, label: 'Đang thực hiện', class: 'bg-purple-400 text-white' },
  { value: ProjectStatus.IN_REVIEW, label: 'Chấm phản biện', class: 'bg-orange-500 text-white' },
  { value: ProjectStatus.IN_PRESENTATION, label: 'Đang bảo vệ', class: 'bg-cyan-500 text-white' },
  { value: ProjectStatus.COMPLETED, label: 'Đã hoàn thành', class: 'bg-green-400 text-white' },
  { value: ProjectStatus.NOT_COMPLETED, label: 'Không hoàn thành', class: 'bg-yellow-400 text-white' },
];

export enum ProjectProgressType {
  REPORT = 'rp',
  REPORT_1 = 'rp1',
  REPORT_2 = 'rp2',
  REPORT_3 = 'rp3',
  REPORT_4 = 'rp4',
  INSTRUCTOR_REVIEW = 'instr',
  REVIEWER_REVIEW = 'rvr',
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
  cpt: 'Hoàn thiện đồ án',
};
