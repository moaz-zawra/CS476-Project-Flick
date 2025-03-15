/**
 * Represents possible statuses when adding a new card set.
 */
export enum CardSetAddStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    NAME_USED,           // The provided card set name is already in use.
    MISSING_INFORMATION, // Required information is missing (e.g., name, details).
    SUCCESS              // Card set was successfully added.
}

export enum CardSetEditStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    NAME_USED,           // The provided card set name is already in use.
    SET_DOES_NOT_EXIST,  // The specified card set does not exist.
    MISSING_INFORMATION, // Required information is missing (e.g., name, details).
    SUCCESS              // Card set was successfully added.
}
/**
 * Represents possible statuses when retrieving a card set.
 */
export enum CardSetGetStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The requested card set does not exist.
    USER_HAS_NO_SETS,
}

export enum CardSetShareStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The requested card set does not exist.
    USER_DOES_NOT_EXIST, // The requested user does not exist.
    ALREADY_SHARED,      // The card set is already shared with the user.
    SUCCESS              // Card set was successfully shared.
}

/**
 * Represents possible statuses when removing a card set.
 */
export enum CardSetRemoveStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The specified card set does not exist.
    SUCCESS              // Card set was successfully removed.
}

export enum CardSetReportStatus {
    DATABASE_FAILURE,
    SET_DOES_NOT_EXIST,
    ALREADY_REPORTED,
    SUCCESS
}

