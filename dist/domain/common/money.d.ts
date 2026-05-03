import { Decimal } from 'decimal.js';
export declare class Money {
    readonly amount: Decimal;
    readonly currency: string;
    constructor(amount: Decimal | string | number, currency: string);
    add(other: Money): Money;
    multiply(factor: Decimal | string | number): Money;
    equals(other: Money): boolean;
    toString(): string;
    toFixed(): string;
    private requireSameCurrency;
}
