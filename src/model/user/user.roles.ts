import { Card } from "../card/card.model";
import { CardService } from "../card/card.service";
import { CardAddStatus, CardRemoveStatus, CardGetStatus, CardEditStatus } from "../card/card.types";
import { CardSet } from "../cardSet/cardset.model";
import { CardSetService } from "../cardSet/cardset.service";
import { CardSetAddStatus, CardSetRemoveStatus, CardSetReportStatus, CardSetGetStatus, CardSetShareStatus, CardSetEditStatus } from "../cardSet/cardset.types";
import { User } from "./user.model";
import {banResult, Role, unbanResult, UserAction, UserActivity, UserChangeStatus} from "./user.types";
import {UserService} from "./user.service";

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

    async editSet(set:CardSet): Promise<CardSetEditStatus> {
        return CardSetService.editSet(this, set);
    }

    async getAllSets(): Promise<CardSet[] | CardSetGetStatus> {
        return CardSetService.getAllSets(this);
    }

    async getSet(setID: number): Promise<CardSet | CardSetGetStatus> {
        return CardSetService.getSet(setID);
    }

    async addCardToSet(card: Card): Promise<CardAddStatus> {
        return CardService.addCardToSet(card);
    }

    async deleteCardFromSet(cardID: number, setID: number): Promise<CardRemoveStatus> {
        return CardService.deleteCardFromSet(cardID,setID);
    }

    async editCardInSet(card:Card): Promise<CardEditStatus> {
        return CardService.editCardInSet(card);
    }

    async shareSet(setID: number, username: string): Promise<CardSetShareStatus> {
        return CardSetService.shareSet(this, username, setID);
    }

    async getCards(setID: number): Promise<Card[] | CardGetStatus> {
        return CardService.getCards(setID.toString());
    }
    async logAction(action: UserAction){
        return UserService.logUserAction(this, action);
    }

    async getWeeklyActivity(): Promise<UserActivity[]>{
        const activity = await UserService.getUserActivityLast7Days(this);
        return activity ?? [];
    }
    async getAllTimeActivity(): Promise<UserActivity[]>{
        const activity = await UserService.getUserActivityAllTime(this);
        return activity ?? [];
    }

    async getSharedSets(): Promise<CardSet[] | CardSetGetStatus> {
        return CardSetService.getSharedSets(this);
    }

    async changeDetails(username:string, email:string): Promise<UserChangeStatus>{
        return UserService.changeUserDetails(this,username,email);
    }
    async changePassword(currentPassword:string, newPassword:string): Promise<UserChangeStatus>{
        return UserService.changeUserPassword(this,currentPassword,newPassword);
    }

    async getSharedSet(setID: number): Promise<CardSet | CardSetGetStatus> {
        return CardSetService.getSharedSet(this, setID);
    }

    async getCardsInSharedSet(setID: number): Promise<Card[] | CardGetStatus> {
        return CardService.getCardsInSharedSet(this, setID);
    }

    async removeSharedSet(setID: number): Promise<CardSetRemoveStatus> {
        return CardSetService.removeSharedSet(this, setID);
    }
}


export class Moderator extends Regular {
    readonly role: Role = Role.MODERATOR;

    async getRegularUsers(): Promise<Regular[]> {
        return UserService.getRegularUsers();
    }
    async getUsersWeeklyActivity(): Promise<{ [username: string]: UserActivity[] }> {
        //Get the regular users
        const regularUsers = await this.getRegularUsers();

        //Fetch the activity for each user and format the result
        const userActivities: { [username: string]: UserActivity[] } = {};

        for (const user of regularUsers) {
            const username = user.username;
            const activity = await UserService.getUserActivityLast7Days(user);

            //Only add the activity if it's not null
            if (activity) {
                userActivities[username] = activity;
            }
        }

        return userActivities;
    }
    async getUsersAllTimeActivity(): Promise<{ [username: string]: UserActivity[] }> {
        //Get the regular users
        const regularUsers = await this.getRegularUsers();

        //Fetch the activity for each user and format the result
        const userActivities: { [username: string]: UserActivity[] } = {};

        for (const user of regularUsers) {
            const username = user.username;
            const activity = await UserService.getUserActivityAllTime(user);

            //Only add the activity if it's not null
            if (activity) {
                userActivities[username] = activity;
            }
        }

        return userActivities;
    }
    async banUser(): Promise<banResult>{
        return banResult.SUCCESS
    }
    async unbanUser(): Promise<unbanResult>{
        return unbanResult.SUCCESS
    }
}

export class Administrator extends Moderator {
    readonly role: Role = Role.ADMINISTRATOR;

    async getModeratorUsers(): Promise<Moderator[]> {
        return UserService.getModeratorUsers();
    }
}
