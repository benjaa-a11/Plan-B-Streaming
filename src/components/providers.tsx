'use client';

import { ThemeProvider } from "@/components/theme-provider";
import { ChannelFilterProvider } from '@/hooks/use-channel-filters';
import { MovieFilterProvider } from '@/hooks/use-movie-filters';
import { Toaster } from '@/components/ui/toaster';
import LayoutWrapper from '@/components/layout-wrapper';
import type { ReactNode } from 'react';

type ProvidersProps = {
    children: ReactNode;
    channelCategories: string[];
    movieCategories: string[];
};

export function Providers({ children, channelCategories, movieCategories }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="plan-b-theme"
            enableSystem
        >
            <ChannelFilterProvider initialCategories={channelCategories}>
                <MovieFilterProvider initialCategories={movieCategories}>
                    <LayoutWrapper>{children}</LayoutWrapper>
                    <Toaster />
                </MovieFilterProvider>
            </ChannelFilterProvider>
        </ThemeProvider>
    );
}
