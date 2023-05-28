import { ProjectApproveStatus } from '../../../common/constants';
import {
  EnumProperty,
  NumberProperty,
  StringProperty,
} from '../../../common/decorators';

export class ProjectApproveRequestDto {
  @NumberProperty('ID đề tài', { required: true, int: true, min: 0 })
  readonly id: number;

  @StringProperty('Lý do', {
    validateIf: (r) => r.status === ProjectApproveStatus.REFUSE,
    required: true,
  })
  readonly reason?: string;

  @EnumProperty('Trạng thái duyệt', ProjectApproveStatus, { required: true })
  readonly status: ProjectApproveStatus;
}
