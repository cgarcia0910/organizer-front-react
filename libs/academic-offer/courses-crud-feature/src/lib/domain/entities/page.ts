export type Page<T> = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: T[];
}