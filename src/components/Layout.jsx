import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950">
            <MobileNav
                onMenuClick={() => setIsSidebarOpen(true)}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <main className="md:ml-64 min-h-screen p-8 pt-20 md:pt-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
