import { users } from "../shared/schema.js";

// Interfaz de almacenamiento convertida a comentarios para JavaScript
// Métodos:
// - getUser(id): Promise<User | undefined>
// - getUserByUsername(username): Promise<User | undefined>
// - createUser(user): Promise<User>

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();