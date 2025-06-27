"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DataRefresher() {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [router]);

    return null; // This component does not render anything
}
