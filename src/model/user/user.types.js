"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAction = exports.Role = exports.LoginStatus = exports.unbanResult = exports.banResult = exports.UserChangeStatus = exports.getActivityStatus = exports.RegisterStatus = void 0;
/**
 * Represents possible statuses when registering a new user.
 */
var RegisterStatus;
(function (RegisterStatus) {
    RegisterStatus[RegisterStatus["PASSWORD_MISMATCH"] = 0] = "PASSWORD_MISMATCH";
    RegisterStatus[RegisterStatus["BAD_PASSWORD"] = 1] = "BAD_PASSWORD";
    RegisterStatus[RegisterStatus["USERNAME_USED"] = 2] = "USERNAME_USED";
    RegisterStatus[RegisterStatus["EMAIL_USED"] = 3] = "EMAIL_USED";
    RegisterStatus[RegisterStatus["DATABASE_FAILURE"] = 4] = "DATABASE_FAILURE";
    RegisterStatus[RegisterStatus["SUCCESS"] = 5] = "SUCCESS"; // user registration was successful.
})(RegisterStatus || (exports.RegisterStatus = RegisterStatus = {}));
var getActivityStatus;
(function (getActivityStatus) {
    getActivityStatus[getActivityStatus["NO_ACTIVITY"] = 0] = "NO_ACTIVITY";
    getActivityStatus[getActivityStatus["DATABASE_FAILURE"] = 1] = "DATABASE_FAILURE";
})(getActivityStatus || (exports.getActivityStatus = getActivityStatus = {}));
var UserChangeStatus;
(function (UserChangeStatus) {
    UserChangeStatus[UserChangeStatus["SUCCESS"] = 0] = "SUCCESS";
    UserChangeStatus[UserChangeStatus["USER_DOES_NOT_EXIST"] = 1] = "USER_DOES_NOT_EXIST";
    UserChangeStatus[UserChangeStatus["INCORRECT_PASSWORD"] = 2] = "INCORRECT_PASSWORD";
    UserChangeStatus[UserChangeStatus["DATABASE_FAILURE"] = 3] = "DATABASE_FAILURE";
})(UserChangeStatus || (exports.UserChangeStatus = UserChangeStatus = {}));
var banResult;
(function (banResult) {
    banResult[banResult["SUCCESS"] = 0] = "SUCCESS";
    banResult[banResult["USER_ALREADY_BANNED"] = 1] = "USER_ALREADY_BANNED";
    banResult[banResult["USER_IS_ADMIN"] = 2] = "USER_IS_ADMIN";
    banResult[banResult["DATABASE_FAILURE"] = 3] = "DATABASE_FAILURE";
})(banResult || (exports.banResult = banResult = {}));
var unbanResult;
(function (unbanResult) {
    unbanResult[unbanResult["SUCCESS"] = 0] = "SUCCESS";
    unbanResult[unbanResult["USER_NOT_BANNED"] = 1] = "USER_NOT_BANNED";
    unbanResult[unbanResult["DATABASE_FAILURE"] = 2] = "DATABASE_FAILURE";
})(unbanResult || (exports.unbanResult = unbanResult = {}));
/**
 * Represents possible statuses when attempting to log in.
 */
var LoginStatus;
(function (LoginStatus) {
    LoginStatus[LoginStatus["WRONG_PASSWORD"] = 0] = "WRONG_PASSWORD";
    LoginStatus[LoginStatus["USER_DOES_NOT_EXIST"] = 1] = "USER_DOES_NOT_EXIST";
    LoginStatus[LoginStatus["DATABASE_FAILURE"] = 2] = "DATABASE_FAILURE";
    LoginStatus[LoginStatus["OTHER"] = 3] = "OTHER"; // Any other login-related issue.
})(LoginStatus || (exports.LoginStatus = LoginStatus = {}));
/**
 * Represents different user roles in the system.
 */
var Role;
(function (Role) {
    Role["REGULAR"] = "REGULAR";
    Role["MODERATOR"] = "MODERATOR";
    Role["ADMINISTRATOR"] = "ADMINISTRATOR"; // user with full administrative privileges.
})(Role || (exports.Role = Role = {}));
var UserAction;
(function (UserAction) {
    UserAction[UserAction["NEWSET"] = 0] = "NEWSET";
    UserAction[UserAction["NEWCARD"] = 1] = "NEWCARD";
    UserAction[UserAction["SHARESET"] = 2] = "SHARESET";
    UserAction[UserAction["VIEWSET"] = 3] = "VIEWSET";
    UserAction[UserAction["OTHER"] = 4] = "OTHER";
})(UserAction || (exports.UserAction = UserAction = {}));
