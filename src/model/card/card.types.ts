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
 * Represents possible statuses when retrieving a card.
 */
export enum CardGetStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST, // The requested card set does not exist.
    SET_HAS_NO_CARDS,
}

export enum CardRemoveStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST,  // The referenced card set does not exist.
    CARD_DOES_NOT_EXIST, // The referenced card in the set does not exist.
    MISSING_INFORMATION, // Required card details are missing.
    SUCCESS              // Card was successfully added.
}