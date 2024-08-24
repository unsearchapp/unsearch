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
				const text = await response.text(); // Get response text first
				try {
					const data = text ? JSON.parse(text) : {}; // Parse JSON if not empty
					setIsAuthenticated(true);
					setUser(data.user);
					setIsPaid(data.user.isPaid);
					return data.user;
				} catch (jsonError) {
					// Handle JSON parsing error
					throw new Error("Something went wrong, please try again later");
				}
			} else {
				// Extract error message from the response if available
				const text = await response.text(); // Get response text first
				let errorMessage = "Something went wrong, please try again later";

				// Handle errors for non-OK responses
				try {
					const errorData = text ? JSON.parse(text) : {};
					if (errorData.message) {
						errorMessage = errorData.message; // Preserve the original error message
					}
				} catch (jsonError) {
					// If parsing fails, keep the default error message
				}

				throw new Error(errorMessage); // Throw with preserved or default error message
			}
		} catch (error) {
			// Rethrow error with specific message
			if (error instanceof Error) {
				throw new Error(error.message || "Something went wrong, please try again later");
			} else {
				throw new Error("Something went wrong, please try again later");
			}
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
				const text = await response.text(); // Get response text first
				try {
					const data = text ? JSON.parse(text) : {}; // Parse JSON if not empty
					setIsAuthenticated(true);
					setUser(data.user);
					setIsPaid(data.user.isPaid);
					return data.user;
				} catch (jsonError) {
					// Handle JSON parsing error
					throw new Error("Something went wrong, please try again later");
				}
			} else {
				// Extract error message from the response if available
				const text = await response.text(); // Get response text first
				let errorMessage = "Something went wrong, please try again later";

				// Handle errors for non-OK responses
				try {
					const errorData = text ? JSON.parse(text) : {};
					if (errorData.message) {
						errorMessage = errorData.message; // Preserve the original error message
					}
				} catch (jsonError) {
					// If parsing fails, keep the default error message
				}

				throw new Error(errorMessage); // Throw with preserved or default error message
			}
		} catch (error) {
			// Rethrow error with specific message
			if (error instanceof Error) {
				throw new Error(error.message || "Something went wrong, please try again later");
			} else {
				throw new Error("Something went wrong, please try again later");
			}
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
