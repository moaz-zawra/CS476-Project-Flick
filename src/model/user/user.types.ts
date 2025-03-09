/**
 * Represents possible statuses when registering a new user.
 */
export enum RegisterStatus {
    PASSWORD_MISMATCH, // Password confirmation does not match the original password.
    BAD_PASSWORD,      // Password does not meet security requirements.
    USERNAME_USED,     // The chosen username is already in use.
    EMAIL_USED,        // The provided email is already associated with an account.
    DATABASE_FAILURE,  // Error occurred while interacting with the database.
    SUCCESS            // user registration was successful.
}

export enum getActivityStatus{
    NO_ACTIVITY,
    DATABASE_FAILURE
}

/**
 * Represents possible statuses when attempting to log in.
 */
export enum LoginStatus {
    WRONG_PASSWORD,      // The provided password is incorrect.
    USER_DOES_NOT_EXIST, // No account found with the provided username or email.
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    OTHER               // Any other login-related issue.
}
/**
 * Represents different user roles in the system.
 */
export enum Role {
    REGULAR = "REGULAR",           // Standard user with limited access.
    MODERATOR = "MODERATOR",       // user with moderation privileges.
    ADMINISTRATOR = "ADMINISTRATOR" // user with full administrative privileges.
}

export enum UserAction{
    NEWSET,
    NEWCARD,
    SHARESET,
    VIEWSET,
    OTHER
}

export interface UserActivity{
    activityID: number;
    uID: number;
    action: UserAction;
    timestamp: Date;
}