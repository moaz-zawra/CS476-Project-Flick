import bcrypt = require('bcrypt');
function handleLogin(email: string, password: string) {

}

//Wont catch everything, but atleast makes sure its something@otherthing.com
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}



