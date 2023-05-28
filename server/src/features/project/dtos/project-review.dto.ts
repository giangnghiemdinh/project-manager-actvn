import {
  BooleanProperty,
  EnumProperty,
  NumberProperty,
  StringProperty,
} from '../../../common/decorators';
import { ProjectProgressType } from '../../../common/constants';

export class ProjectReviewRequestDto {
  @StringProperty('Nhận xét 1', { required: true })
  comment1: string;

  @StringProperty('Nhận xét 2', { required: true })
  comment2: string;

  @StringProperty('Nhận xét 3', { required: true })
  comment3: string;

  @StringProperty('Nhận xét 4')
  comment4: string;

  @StringProperty('Nhận xét 5')
  comment5: string;

  @NumberProperty('Điểm', { required: true, int: true, min: 0, max: 10 })
  score: number;

  @BooleanProperty('Cho bảo vệ', { required: true })
  isApproval: boolean;

  @EnumProperty('Loại tiến độ', ProjectProgressType, { required: true })
  type: ProjectProgressType;
}
