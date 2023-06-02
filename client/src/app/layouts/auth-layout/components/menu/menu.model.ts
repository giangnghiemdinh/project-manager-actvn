export interface Menu {
    title?: string,
    routerLink?: string,
    separator?: string,
    icon?: string,
    active?: boolean,
    children?: Menu[]
}
