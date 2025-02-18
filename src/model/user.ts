import dotenv = require('dotenv');
import path = require('path');
import bcrypt = require('bcrypt');
import { DB } from "./dbConnectNew";
import { loginStatus } from "./userLogin";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export enum RegisterStatus {
    PASSWORD_MISMATCH,
    BAD_PASSWORD,
    USER_ALREADY_EXISTS,
    DATABASE_FAILURE,
    OTHER
}

export enum LoginStatus {
    WRONG_PASSWORD,
    USER_DOES_NOT_EXIST,
    DATABASE_FAILURE,
    OTHER
}

export enum Role {
    REGULAR = "REGULAR",
    MODERATOR = "MODERATOR",
    ADMINISTRATOR = "ADMINISTRATOR"
}

export interface User {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: Role;
    logout(): void;
}

abstract class UserFactory {
    public abstract login(username: string, password: string): Promise<User | LoginStatus>;
}

export class UserCreator extends UserFactory {
    public async login(email: string, password: string): Promise<User | LoginStatus> {
        try {
            const db = await DB.create();

            if (db.connection instanceof Error) {
                console.error(db.connection.message);
                return LoginStatus.DATABASE_FAILURE;
            }

            const [rows]: any = await db.connection.execute(
                "SELECT username, email, hash, role FROM users WHERE email = ?",
                [email]
            );

            if (rows.length === 0) {
                return LoginStatus.USER_DOES_NOT_EXIST;
            }

            const userData = rows[0];
            const isPasswordCorrect = await bcrypt.compare(password, userData.hash);
            if (isPasswordCorrect) {
                switch (userData.role) {
                    case "REGULAR": {
                        return new Regular(userData.username, userData.email, userData.hash, userData.role);
                    }
                    case "MODERATOR": {
                        return new Moderator(userData.username, userData.email, userData.hash, userData.role);
                    }
                    case "ADMINISTRATOR": {
                        return new Administrator(userData.username, userData.email, userData.hash, userData.role);
                    }
                    default: {
                        console.error(`Invalid role: ${userData.role}`);
                        return LoginStatus.OTHER;
                    }
                }
            } else {
                return LoginStatus.WRONG_PASSWORD;
            }
        } catch (error) {
            console.error(`Login failed: ${(error as Error).message}`);
            return LoginStatus.DATABASE_FAILURE;
        }
    }
}

export class Regular implements User {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: Role = Role.REGULAR;
    private logged_in: boolean = false;

    constructor(username: string, email: string, password: string, role: Role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.logged_in = true;
    }

    logout(): void {
        this.logged_in = false;
        console.log(`${this.username} has logged out.`);
    }
}

export class Moderator implements User {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: Role = Role.MODERATOR;
    private logged_in: boolean = false;

    constructor(username: string, email: string, password: string, role: Role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.logged_in = true;
    }

    logout(): void {
        this.logged_in = false;
        console.log(`${this.username} has logged out.`);
    }
}

export class Administrator implements User {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: Role = Role.ADMINISTRATOR;
    private logged_in: boolean = false;

    constructor(username: string, email: string, password: string, role: Role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.logged_in = true;
    }

    logout(): void {
        this.logged_in = false;
        console.log(`${this.username} has logged out.`);
    }
}
