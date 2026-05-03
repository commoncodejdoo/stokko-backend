"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_UNITS = exports.isFractionalUnit = exports.Unit = void 0;
var Unit;
(function (Unit) {
    Unit["KOM"] = "KOM";
    Unit["KG"] = "KG";
    Unit["L"] = "L";
    Unit["BOCA"] = "BOCA";
    Unit["GAJBA"] = "GAJBA";
    Unit["PAKET"] = "PAKET";
    Unit["KUTIJA"] = "KUTIJA";
})(Unit || (exports.Unit = Unit = {}));
const FRACTIONAL_UNITS = new Set([Unit.KG, Unit.L]);
const isFractionalUnit = (unit) => FRACTIONAL_UNITS.has(unit);
exports.isFractionalUnit = isFractionalUnit;
exports.ALL_UNITS = Object.values(Unit);
//# sourceMappingURL=unit.js.map