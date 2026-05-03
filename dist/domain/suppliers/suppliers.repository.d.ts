import { TxClient } from '../common/transaction';
import { Supplier } from './supplier.domain';
export interface CreateSupplierInput {
    organizationId: string;
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    note?: string | null;
}
export interface UpdateSupplierInput {
    name?: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    note?: string | null;
}
export declare abstract class SuppliersRepository {
    abstract create(input: CreateSupplierInput, tx?: TxClient): Promise<Supplier>;
    abstract findById(id: string, tx?: TxClient): Promise<Supplier | null>;
    abstract listByOrg(organizationId: string, tx?: TxClient): Promise<Supplier[]>;
    abstract update(id: string, patch: UpdateSupplierInput, tx?: TxClient): Promise<Supplier>;
    abstract softDelete(id: string, tx?: TxClient): Promise<Supplier>;
}
