import Navbar from "@/components/Navbar";
import TrialBanner from "@/components/TrialBanner";

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <TrialBanner />
            {children}
        </>
    );
}
