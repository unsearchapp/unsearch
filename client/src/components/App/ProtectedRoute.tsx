import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext"; // Adjust the import path

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
	requirePaid?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	redirectTo = "/login",
	requirePaid = true
}) => {
	const { isAuthenticated, isPaid } = useAuthContext();

	if (!isAuthenticated) {
		return <Navigate to={redirectTo} />;
	}

	if (requirePaid && !isPaid) {
		return <Navigate to="/plans" />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
