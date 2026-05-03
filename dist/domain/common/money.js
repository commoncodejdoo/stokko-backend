"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("./errors");
const ISO_CURRENCY_RX = /^[A-Z]{3}$/;
class Money {
    amount;
    currency;
    constructor(amount, currency) {
        const dec = amount instanceof decimal_js_1.Decimal ? amount : new decimal_js_1.Decimal(amount);
        if (dec.isNegative()) {
            throw new errors_1.DomainValidationError('Money amount cannot be negative', {
                amount: dec.toFixed(),
            });
        }
        if (!ISO_CURRENCY_RX.test(currency)) {
            throw new errors_1.DomainValidationError(`Invalid ISO 4217 currency code: "${currency}"`, {
                currency,
            });
        }
        this.amount = dec;
        this.currency = currency;
    }
    add(other) {
        this.requireSameCurrency(other);
        return new Money(this.amount.plus(other.amount), this.currency);
    }
    multiply(factor) {
        const f = factor instanceof decimal_js_1.Decimal ? factor : new decimal_js_1.Decimal(factor);
        return new Money(this.amount.times(f), this.currency);
    }
    equals(other) {
        return this.currency === other.currency && this.amount.equals(other.amount);
    }
    toString() {
        return `${this.amount.toFixed(2)} ${this.currency}`;
    }
    toFixed() {
        return this.amount.toFixed(2);
    }
    requireSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new errors_1.DomainValidationError(`Currency mismatch: ${this.currency} vs ${other.currency}`, { left: this.currency, right: other.currency });
        }
    }
}
exports.Money = Money;
//# sourceMappingURL=money.js.map