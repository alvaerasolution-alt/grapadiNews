import type { Auth } from '@/types/auth';
import type { Category } from '@/types/app';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash: {
                success: string | null;
                error: string | null;
            };
            navCategories: Category[];
            [key: string]: unknown;
        };
    }
}
