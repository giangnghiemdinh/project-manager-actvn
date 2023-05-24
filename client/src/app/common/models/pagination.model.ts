import { SortOrder } from '../constants';

export interface PaginationPayload {
    order?: SortOrder,
    page?: number;
    limit?: number;
    q?: string;

    [key: string]: any;
}

export interface PaginationResponse<T> {
    data: T[];
    meta: MetaPagination;
}

export interface MetaPagination {
    page?: number;
    limit?: number;
    itemCount?: number;
    pageCount?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
}
