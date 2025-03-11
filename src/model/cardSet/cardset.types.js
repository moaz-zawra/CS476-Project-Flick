"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSetRemoveStatus = exports.CardSetGetStatus = exports.CardSetReportStatus = exports.CardSetAddStatus = void 0;
/**
 * Represents possible statuses when adding a new card set.
 */
var CardSetAddStatus;
(function (CardSetAddStatus) {
    CardSetAddStatus[CardSetAddStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardSetAddStatus[CardSetAddStatus["NAME_USED"] = 1] = "NAME_USED";
    CardSetAddStatus[CardSetAddStatus["MISSING_INFORMATION"] = 2] = "MISSING_INFORMATION";
    CardSetAddStatus[CardSetAddStatus["SUCCESS"] = 3] = "SUCCESS"; // Card set was successfully added.
})(CardSetAddStatus || (exports.CardSetAddStatus = CardSetAddStatus = {}));
/**
 * Represents possible statuses when reporting a card set.
 */
var CardSetReportStatus;
(function (CardSetReportStatus) {
    CardSetReportStatus[CardSetReportStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardSetReportStatus[CardSetReportStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardSetReportStatus[CardSetReportStatus["SUCCESS"] = 2] = "SUCCESS"; // Report was successfully generated.
})(CardSetReportStatus || (exports.CardSetReportStatus = CardSetReportStatus = {}));
/**
 * Represents possible statuses when retrieving a card set.
 */
var CardSetGetStatus;
(function (CardSetGetStatus) {
    CardSetGetStatus[CardSetGetStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardSetGetStatus[CardSetGetStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardSetGetStatus[CardSetGetStatus["USER_HAS_NO_SETS"] = 2] = "USER_HAS_NO_SETS";
})(CardSetGetStatus || (exports.CardSetGetStatus = CardSetGetStatus = {}));
/**
 * Represents possible statuses when removing a card set.
 */
var CardSetRemoveStatus;
(function (CardSetRemoveStatus) {
    CardSetRemoveStatus[CardSetRemoveStatus["DATABASE_FAILURE"] = 0] = "DATABASE_FAILURE";
    CardSetRemoveStatus[CardSetRemoveStatus["SET_DOES_NOT_EXIST"] = 1] = "SET_DOES_NOT_EXIST";
    CardSetRemoveStatus[CardSetRemoveStatus["SUCCESS"] = 2] = "SUCCESS"; // Card set was successfully removed.
})(CardSetRemoveStatus || (exports.CardSetRemoveStatus = CardSetRemoveStatus = {}));
