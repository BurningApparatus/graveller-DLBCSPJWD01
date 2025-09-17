import { User } from '../models/userModel'
import { UserTable } from '../repositories/userTable'


export const users: User[] = [];

export class MockUserTable implements UserTable {
    private users: User[] = [];
    
    async createUser(name: string, password: string): Promise<User> {
        let user: User = {
            userID: users.length,
            name: name, 
            passwordHash: password,
            balance: 0,
        };
        this.users.push(user);
        return user;
    }
    async getByID(id: number): Promise<User | null> {
        return this.users.find((u) => u.userID == id) || null;
    }
    async getAll(): Promise<User[]> {
        return this.users;
    }
    async getByName(name: string): Promise<User | null> {
        return this.users.find((u) => u.name == name) || null;
    }
    updateUser(id: number, newUser: User): void {
        const i = this.users.findIndex((u) => u.userID == id);
        if (i >= 0) {
            let user = {
                userID: id,
                name: newUser.name,
                passwordHash: newUser.passwordHash,
                balance: newUser.balance
            };
            this.users[i] = user;
        }
    }
    deleteUser(id: number): void {
        this.users = this.users.filter(u => u.userID !== id);
    }

}
