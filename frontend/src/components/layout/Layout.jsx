import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminHeader from './AdminHeader';

export default function Layout({ children }) {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                <AdminHeader />
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
