import React, { createContext, useEffect, ReactNode, useState } from "react";

interface User {
	_id: string;
	email: string;
	customerId: string;
	isPaid: boolean;
}

export interface AuthContextInterface {
	isAuthenticated: boolean;
	isPaid: boolean;
	user: User | null;
	checkAuth: () => void;
	login: (email: string, password: string) => Promise<User>;
	register: (email: string, password: string) => Promise<User>;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isPaid, setIsPaid] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const checkAuth = async () => {
		try {
			const response = await fetch("/api/checkAuth", {
				method: "GET",
				credentials: "include"
			});
			if (response.ok) {
				const data = await response.json();
				setIsAuthenticated(true);
				setUser(data.user);
				setIsPaid(data.user.isPaid);
			} else {
				setIsAuthenticated(false);
				setUser(null);
				setIsPaid(false);
			}
		} catch (error) {
			setIsAuthenticated(false);
			setUser(null);
			setIsPaid(false);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string): Promise<User> => {
		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const data = await response.json();

				setIsAuthenticated(true);
				setUser(data.user);
				setIsPaid(data.user.isPaid);
				return data.user;
			} else {
				throw new Error("Login failed");
			}
		} catch (error) {
			throw new Error("Login failed");
		}
	};

	const register = async (email: string, password: string): Promise<User> => {
		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const data = await response.json();
				setIsAuthenticated(true);
				setUser(data.user);
				setIsPaid(data.user.isPaid);
				return data.user;
			} else {
				throw new Error("Registration failed");
			}
		} catch (error) {
			throw new Error("Registration failed");
		}
	};

	const logout = async () => {
		try {
			const response = await fetch("/api/logout", {
				method: "POST",
				credentials: "include"
			});

			if (response.ok) {
				setIsAuthenticated(false);
				setUser(null);
				setIsPaid(false);
			} else {
				throw new Error("Logout failed");
			}
		} catch (error) {
			throw new Error("Logout failed");
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		!isLoading && (
			<AuthContext.Provider
				value={{ isAuthenticated, user, isPaid, checkAuth, login, register, logout }}
			>
				{children}
			</AuthContext.Provider>
		)
	);
};
