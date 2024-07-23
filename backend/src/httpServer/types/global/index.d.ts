import { User as UserModel } from "../../../db/usersModel";

declare global {
	namespace Express {
		interface User extends UserModel {}
	}
}
