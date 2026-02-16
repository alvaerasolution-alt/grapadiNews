export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    category_id: number;
    category: Category;
    tags?: Tag[];
    status: 'draft' | 'pending' | 'published' | 'rejected';
    view_count: number;
    points_awarded_on_publish: number;
    points_awarded_from_views: number;
    created_at: string;
    updated_at: string;
    meta_title?: string;
    meta_description?: string;
    featured_image?: string;
}

export interface RedemptionItem {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    point_cost: number;
    rupiah_value: number;
    is_active: boolean;
    sort_order: number;
    redemption_requests_count?: number;
}

export interface RedemptionRequestRow {
    id: number;
    item_name: string;
    point_cost: number;
    rupiah_value: number;
    payment_method: 'bank_transfer' | 'e_wallet';
    payment_method_label: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    status_label: string;
    admin_note: string | null;
    created_at: string;
    created_at_human: string;
    processed_at: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface RedemptionRequestDetail extends RedemptionRequestRow {
    item: {
        id: number;
        name: string;
        description: string | null;
    };
    bank_name: string | null;
    account_number: string | null;
    account_holder: string | null;
    ewallet_provider: string | null;
    ewallet_number: string | null;
    ewallet_name: string | null;
    processor: { name: string } | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
