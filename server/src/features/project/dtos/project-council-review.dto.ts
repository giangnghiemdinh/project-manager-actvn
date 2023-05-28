import { NumberProperty } from '../../../common/decorators';

export class ProjectCouncilReviewRequestDto {
  @NumberProperty('Điểm hình thức', {
    required: true,
    int: true,
    min: 0,
    max: 15,
  })
  readonly formScore: number;

  @NumberProperty('Điểm nội dung', {
    required: true,
    int: true,
    min: 0,
    max: 35,
  })
  readonly contentScore: number;

  @NumberProperty('Điểm tóm tắt', {
    required: true,
    int: true,
    min: 0,
    max: 20,
  })
  readonly summarizeScore: number;

  @NumberProperty('Điểm trả lời', {
    required: true,
    int: true,
    min: 0,
    max: 30,
  })
  readonly answerScore: number;

  @NumberProperty('Điểm kết luận', { required: true, min: 0, max: 10 })
  readonly conclusionScore: number;
}
