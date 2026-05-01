"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformDecimalInterceptor = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const rxjs_1 = require("rxjs");
let TransformDecimalInterceptor = class TransformDecimalInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, rxjs_1.map)((data) => this.transform(data)));
    }
    transform(value) {
        if (value === null || value === undefined)
            return value;
        if (value instanceof decimal_js_1.Decimal)
            return value.toFixed();
        if (this.isPrismaDecimal(value)) {
            return value.toFixed();
        }
        if (value instanceof Date)
            return value.toISOString();
        if (Array.isArray(value))
            return value.map((v) => this.transform(v));
        if (typeof value === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                out[k] = this.transform(v);
            }
            return out;
        }
        return value;
    }
    isPrismaDecimal(v) {
        return (typeof v === 'object' &&
            v !== null &&
            'toFixed' in v &&
            typeof v.toFixed === 'function' &&
            'd' in v &&
            's' in v &&
            'e' in v);
    }
};
exports.TransformDecimalInterceptor = TransformDecimalInterceptor;
exports.TransformDecimalInterceptor = TransformDecimalInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformDecimalInterceptor);
//# sourceMappingURL=transform-decimal.interceptor.js.map