export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type Action = 'idle' | 'load' | 'create' | 'update' | 'delete';

export const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra! Vui lòng thử lại sau';
