import knex from "./db";

export interface User {
	_id: string;
	email: string;
	password: string;
	customerId: string;
	isPaid: boolean;
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

export const getUserById = async (_id: string): Promise<User | undefined> => {
	try {
		const user: User | undefined = await knex("Users")
			.select("_id", "email", "customerId", "isPaid")
			.where({ _id })
			.first();
		return user;
	} catch (error) {
		return undefined;
	}
};

export const setCustomerId = async (_id: string, customerId: string) => {
	try {
		await knex("Users").where({ _id }).update({ customerId, isPaid: true });
	} catch (error) {
		throw error;
	}
};

export const updateUserIsPaid = async (customerId: string, isPaid: boolean) => {
	try {
		await knex("Users").where({ customerId }).update({ isPaid });
	} catch (error) {
		throw error;
	}
};
