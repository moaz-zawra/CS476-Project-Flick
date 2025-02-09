import "express-session";

//Custom session
declare module "express-session" {
    interface SessionData {
        logged_in?: boolean;
        user_info?: { username: string; role?: string };
    }
}
