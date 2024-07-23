import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
	const { login } = useAuthContext();

	return async (email: string, password: string) => {
		await login(email, password);
	};
};

export const useRegister = () => {
	const { register } = useAuthContext();

	return async (email: string, password: string) => {
		await register(email, password);
	};
};

export const useLogout = () => {
	const { logout } = useAuthContext();

	return async () => {
		await logout();
	};
};
