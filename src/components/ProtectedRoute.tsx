import { useAppSelector } from "@/store/hook";
import { Navigate, Outlet } from "react-router-dom";
import { Loading } from "./Loading";
export default function ProtectedRoute({ types }: { types?: ("admin" | "advertiser" | "user" | "payment_processor" | "default")[] }) {
    const { user, loading, isAuthenticated } = useAppSelector((state) => state?.auth);
    const storedUser = localStorage.getItem("user");
    const parsedUser: { type?: "admin" | "advertiser" | "user" | "payment_processor" } | null = storedUser ? JSON.parse(storedUser) : null;
    const type = parsedUser?.type as "admin" | "advertiser" | "user" | "payment_processor" | undefined;

    if (loading) return <Loading />


    if (types && (!type || !types.includes(type))) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}