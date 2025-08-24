//Make sure this type is in sync with type definition in server/utils/handleError.ts
export interface ApiResponse<T> {
    type: 'success' | 'error';
    status: number;
    code: string;
    message: string;
    data?: T;
}
