"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRemoveStatus = exports.CardGetStatus = exports.CardAddStatus = void 0;
/**
 * Represents possible statuses when adding a new card to a card set.
 */
var CardAddStatus;
(function (CardAddStatus) {
    CardAddStatus[CardAddStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardAddStatus[CardAddStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardAddStatus[CardAddStatus["MISSING_INFORMATION"] = 2] = "MISSING_INFORMATION";
    CardAddStatus[CardAddStatus["SUCCESS"] = 3] = "SUCCESS"; // Card was successfully added.
})(CardAddStatus || (exports.CardAddStatus = CardAddStatus = {}));
/**
 * Represents possible statuses when retrieving a card.
 */
var CardGetStatus;
(function (CardGetStatus) {
    CardGetStatus[CardGetStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardGetStatus[CardGetStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardGetStatus[CardGetStatus["SET_HAS_NO_CARDS"] = 2] = "SET_HAS_NO_CARDS";
})(CardGetStatus || (exports.CardGetStatus = CardGetStatus = {}));
var CardRemoveStatus;
(function (CardRemoveStatus) {
    CardRemoveStatus[CardRemoveStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardRemoveStatus[CardRemoveStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardRemoveStatus[CardRemoveStatus["CARD_DOES_NOT_EXIST"] = 2] = "CARD_DOES_NOT_EXIST";
    CardRemoveStatus[CardRemoveStatus["MISSING_INFORMATION"] = 3] = "MISSING_INFORMATION";
    CardRemoveStatus[CardRemoveStatus["SUCCESS"] = 4] = "SUCCESS"; // Card was successfully added.
})(CardRemoveStatus || (exports.CardRemoveStatus = CardRemoveStatus = {}));
