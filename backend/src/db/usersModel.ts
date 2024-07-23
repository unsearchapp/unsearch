import knex from "./db";

export interface User {
	_id: string;
	email: string;
	password: string;
	created_at: Date;
	updated_at: Date;
}

export const createUser = async (email: string, password: string): Promise<User> => {
	try {
		const [user]: User[] = await knex("Users").insert({ email, password }).returning("*");
		return user;
	} catch (error) {
		throw error;
	}
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
	try {
		const user: User | undefined = await knex("Users").where({ email: email }).first();

		return user;
	} catch (error) {
		return undefined;
	}
};

export const getUserById = async (id: number): Promise<User | undefined> => {
	try {
		const user: User | undefined = await knex("Users")
			.select("_id", "email")
			.where({ _id: id })
			.first();
		return user;
	} catch (error) {
		return undefined;
	}
};
