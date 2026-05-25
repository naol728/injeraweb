import FloatingNav from "@/components/FloatingNav";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Desktop Sidebar Navbar */}
            <FloatingNav />

            <header className="hidden lg:block fixed left-0 top-0 h-full z-50">
                <Navbar />
            </header>

            {/* Mobile Navbar */}
            <header className="block lg:hidden fixed bottom-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* Main Content */}
            <main
                className="flex-1 w-full min-h-screen overflow-y-auto
                   lg:ml-24 pb-20 lg:pb-0
                   bg-background transition-all"
            >
                <Outlet />
            </main>
        </div>
    );
}
