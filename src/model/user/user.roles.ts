import { Card } from "../card/card.model";
import { CardService } from "../card/card.service";
import { CardAddStatus, CardRemoveStatus, CardGetStatus } from "../card/card.types";
import { CardSet } from "../cardSet/cardset.model";
import { CardSetService } from "../cardSet/cardset.service";
import { CardSetAddStatus, CardSetRemoveStatus, CardSetReportStatus, CardSetGetStatus } from "../cardSet/cardset.types";
import { User } from "./user.model";
import { Role } from "./user.types";

export class Regular implements User {
    readonly username: string;
    readonly email: string;
    readonly role: Role = Role.REGULAR;

    /**
     * Constructs a new Regular user.
     */
    constructor(username: string, email: string) {
        this.username = username;
        this.email = email;
    }

    async addSet(card_set: CardSet): Promise<CardSetAddStatus> {
        return CardSetService.addSet(this, card_set);
    }

    async deleteSet(setID: number): Promise<CardSetRemoveStatus> {
        return CardSetService.deleteSet(setID);
    }

    async getAllSets(): Promise<CardSet[] | CardSetGetStatus> {
        return CardSetService.getAllSets(this);
    }

    async getSet(setID: number): Promise<CardSet | CardSetGetStatus> {
        return CardSetService.getSet(setID, this);
    }

    async addCardToSet(card: Card): Promise<CardAddStatus> {
        return CardService.addCardToSet(card);
    }

    async deleteCardFromSet(card: Card): Promise<CardRemoveStatus> {
        return CardService.deleteCardFromSet(card);
    }

    async getCards(setID: number): Promise<Card[] | CardGetStatus> {
        return CardService.getCards(setID.toString());
    }
}

export class Moderator extends Regular {
    readonly role: Role = Role.MODERATOR;
}

export class Administrator extends Moderator {
    readonly role: Role = Role.ADMINISTRATOR;
}
