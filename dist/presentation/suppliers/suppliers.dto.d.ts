export declare class CreateSupplierDto {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    note?: string;
}
export declare class UpdateSupplierDto {
    name?: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    note?: string | null;
}
