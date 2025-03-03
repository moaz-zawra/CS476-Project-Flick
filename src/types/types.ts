export interface CardSet {
    ownerID: number;
    setName: string;
    tags: string[];
    setID?: number;
}

export function makeCardSet(ownerID: number, setName: string, tags: string[], setID?:number): CardSet{
    if (setID) return {ownerID, setName, tags, setID};
    else return {ownerID, setName, tags}
}
export interface Card {
    setID: number;
    front_text?: string;
    back_text?: string;
    media?: string;
}
export function makeCard(setID: number, front_text?: string, back_text?: string, media?: string): Card {
    return {
        setID,
        front_text: front_text || "",
        back_text: back_text || "",
        media: media || ""
    };
}


export interface Report{
    setID: number;
    reason: string | undefined;
}

export enum ModBanStatus{
    SUCCESS,
}

export enum ModUnBanStatus{
    SUCCESS,
}
/**
 * Represents possible statuses when adding a new card set.
 */
export enum CardSetAddStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    NAME_USED,           // The provided card set name is already in use.
    MISSING_INFORMATION, // Required information is missing (e.g., name, details).
    SUCCESS              // Card set was successfully added.
}

/**
 * Represents possible statuses when adding a new card to a card set.
 */
export enum CardAddStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The referenced card set does not exist.
    MISSING_INFORMATION, // Required card details are missing.
    SUCCESS              // Card was successfully added.
}

/**
 * Represents possible statuses when reporting a card set.
 */
export enum CardSetReportStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The requested card set does not exist.
    SUCCESS              // Report was successfully generated.
}

/**
 * Represents possible statuses when retrieving a card set.
 */
export enum CardSetGetStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The requested card set does not exist.
}

/**
 * Represents possible statuses when retrieving a card.
 */
export enum CardGetStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST, // The requested card set does not exist.
    SET_HAS_NO_CARDS,
}

/**
 * Represents possible statuses when removing a card set.
 */
export enum CardSetRemoveStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The specified card set does not exist.
    SUCCESS              // Card set was successfully removed.
}

export enum CardRemoveStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The referenced card set does not exist.
    CARD_DOES_NOT_EXIST, // The referenced card in the set does not exist.
    MISSING_INFORMATION, // Required card details are missing.
    SUCCESS              // Card was successfully added.
}


/**
 * Represents possible statuses when registering a new user.
 */
export enum RegisterStatus {
    PASSWORD_MISMATCH, // Password confirmation does not match the original password.
    BAD_PASSWORD,      // Password does not meet security requirements.
    USERNAME_USED,     // The chosen username is already in use.
    EMAIL_USED,        // The provided email is already associated with an account.
    DATABASE_FAILURE,  // Error occurred while interacting with the database.
    SUCCESS            // User registration was successful.
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
    MODERATOR = "MODERATOR",       // User with moderation privileges.
    ADMINISTRATOR = "ADMINISTRATOR" // User with full administrative privileges.
}