import Navbar from "@/components/Navbar";
import TrialBanner from "@/components/TrialBanner";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import FloatingActions from "@/components/FloatingActions";

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ViewModeProvider>
            <Navbar />
            <TrialBanner />
            {children}
            <FloatingActions />
        </ViewModeProvider>
    );
}
