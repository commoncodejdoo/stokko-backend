"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sha256RefreshTokenCodec = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const refresh_token_codec_1 = require("../../domain/auth/refresh-token-codec");
let Sha256RefreshTokenCodec = class Sha256RefreshTokenCodec extends refresh_token_codec_1.RefreshTokenCodec {
    generatePlaintext() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    hash(plaintext) {
        return (0, crypto_1.createHash)('sha256').update(plaintext).digest('hex');
    }
};
exports.Sha256RefreshTokenCodec = Sha256RefreshTokenCodec;
exports.Sha256RefreshTokenCodec = Sha256RefreshTokenCodec = __decorate([
    (0, common_1.Injectable)()
], Sha256RefreshTokenCodec);
//# sourceMappingURL=refresh-token-codec.js.map