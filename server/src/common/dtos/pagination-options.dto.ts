import { Order } from '../constants';
import { EnumProperty, NumberProperty, StringProperty } from '../decorators';

export class PaginationOptionsDto {
  @EnumProperty('Sắp xếp', Order, { default: Order.ASC })
  readonly order: Order = Order.ASC;

  @NumberProperty('Trang', { int: true, min: 1, minimum: 1, default: 1 })
  readonly page: number = 1;

  @NumberProperty('Giới hạn', {
    int: true,
    min: 1,
    max: 50,
    minimum: 1,
    default: 20,
    maximum: 50,
  })
  readonly limit: number = 20;

  @StringProperty('Tìm kiếm')
  readonly q?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
