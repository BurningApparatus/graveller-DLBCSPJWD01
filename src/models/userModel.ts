export interface UserRegister {
    name: string,
    password: string,
}

export interface User {
    userID: number,
    name: string,
    passwordHash: string,
    balance: number,
}
