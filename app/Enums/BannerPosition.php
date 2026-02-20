<?php

namespace App\Enums;

enum BannerPosition: string
{
    case ArticleTop = 'article_top';
    case ArticleBottom = 'article_bottom';
    case HomeBelowNavbar = 'home_below_navbar';
    case HomeHeroBelow = 'home_hero_below';
    case HomeSidebar = 'home_sidebar';
    case HomeFeedInline = 'home_feed_inline';
    case CategoryTop = 'category_top';
    case CategorySidebar = 'category_sidebar';
    case HomeMidSection = 'home_mid_section';
    case GlobalPopup = 'global_popup';

    public function label(): string
    {
        return match ($this) {
            self::ArticleTop => 'Atas Artikel',
            self::ArticleBottom => 'Bawah Artikel',
            self::HomeBelowNavbar => 'Home — Bawah Navbar',
            self::HomeHeroBelow => 'Home — Bawah Hero',
            self::HomeSidebar => 'Home — Sidebar',
            self::HomeFeedInline => 'Home — Sisipan Feed',
            self::HomeMidSection => 'Home — Antar Section',
            self::CategoryTop => 'Kategori — Atas',
            self::CategorySidebar => 'Kategori — Sidebar',
            self::GlobalPopup => 'Popup Global',
        };
    }
}
