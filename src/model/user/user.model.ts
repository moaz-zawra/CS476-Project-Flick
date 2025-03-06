import { Role } from "./user.types";

export interface User {
    readonly username: string;
    readonly email: string;
    readonly role: Role;
}
