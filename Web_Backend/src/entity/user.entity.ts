export interface IUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    bio?: string;
    birthdate?: string;
    gender?: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export class User implements IUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    bio?: string;
    birthdate?: string;
    gender?: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<IUser>) {
        this.id = data.id || this.generateId();
        this.username = data.username || '';
        this.email = data.email;
        this.phone = data.phone;
        this.bio = data.bio;
        this.birthdate = data.birthdate;
        this.gender = data.gender;
        this.password = data.password || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    public toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

export interface RegisterUserDto {
    username: string;
    email?: string;
    phone?: string;
    password: string;
}

export interface LoginUserDto {
    username: string;
    password: string;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    phone?: string;
    bio?: string;
    birthdate?: string;
    gender?: string;
}

export interface UserResponseDto {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    bio?: string;
    birthdate?: string;
    gender?: string;
    createdAt: Date;
    updatedAt: Date;
}
