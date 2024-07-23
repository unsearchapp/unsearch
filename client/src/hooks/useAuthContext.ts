import { AuthContext, AuthContextInterface } from "../context/AuthContext";
import { useContext } from "react";

export const useAuthContext = (): AuthContextInterface => {
	const context = useContext(AuthContext);

	if (!context) {
		throw Error("useAuthContext must be used inside must be used inside an AuthContextProvider");
	}

	return context;
};
