import { useState, useEffect, useCallback } from 'react';

export type ReadingTheme = 'light' | 'dark' | 'warm';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type LineHeight = 'compact' | 'normal' | 'spacious';
export type ContentWidth = 'narrow' | 'normal' | 'wide';

export interface ReadingPreferences {
    theme: ReadingTheme;
    fontSize: number;
    fontFamily: FontFamily;
    lineHeight: LineHeight;
    contentWidth: ContentWidth;
}

const STORAGE_KEY = 'reading-preferences';

const DEFAULT_PREFERENCES: ReadingPreferences = {
    theme: 'dark',
    fontSize: 18,
    fontFamily: 'sans',
    lineHeight: 'normal',
    contentWidth: 'normal',
};

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 24;
const FONT_SIZE_STEP = 2;

export const THEME_STYLES: Record<
    ReadingTheme,
    { background: string; color: string; label: string }
> = {
    light: {
        background: '#0D0D0D',
        color: '#e5e7eb',
        label: 'Light',
    },
    dark: {
        background: '#0D0D0D',
        color: '#e0e0e0',
        label: 'Dark',
    },
    warm: {
        background: '#1a1510',
        color: '#d4c5a0',
        label: 'Warm',
    },
};

export const FONT_FAMILY_MAP: Record<FontFamily, { css: string; label: string }> = {
    sans: {
        css: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        label: 'Sans',
    },
    serif: {
        css: "'Georgia', 'Times New Roman', serif",
        label: 'Serif',
    },
    mono: {
        css: "'JetBrains Mono', ui-monospace, monospace",
        label: 'Mono',
    },
};

export const LINE_HEIGHT_MAP: Record<LineHeight, { value: number; label: string }> = {
    compact: { value: 1.5, label: 'Compact' },
    normal: { value: 1.75, label: 'Normal' },
    spacious: { value: 2.0, label: 'Spacious' },
};

export const CONTENT_WIDTH_MAP: Record<ContentWidth, { value: string; label: string }> = {
    narrow: { value: '640px', label: 'Narrow' },
    normal: { value: '768px', label: 'Normal' },
    wide: { value: '896px', label: 'Wide' },
};

function loadPreferences(): ReadingPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_PREFERENCES, ...parsed };
        }
    } catch {
        // ignore parse errors
    }
    return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: ReadingPreferences): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // ignore storage errors
    }
}

export function useReadingPreferences() {
    const [preferences, setPreferences] = useState<ReadingPreferences>(loadPreferences);

    useEffect(() => {
        savePreferences(preferences);
    }, [preferences]);

    const setTheme = useCallback((theme: ReadingTheme) => {
        setPreferences((prev) => ({ ...prev, theme }));
    }, []);

    const setFontFamily = useCallback((fontFamily: FontFamily) => {
        setPreferences((prev) => ({ ...prev, fontFamily }));
    }, []);

    const setLineHeight = useCallback((lineHeight: LineHeight) => {
        setPreferences((prev) => ({ ...prev, lineHeight }));
    }, []);

    const setContentWidth = useCallback((contentWidth: ContentWidth) => {
        setPreferences((prev) => ({ ...prev, contentWidth }));
    }, []);

    const increaseFontSize = useCallback(() => {
        setPreferences((prev) => ({
            ...prev,
            fontSize: Math.min(prev.fontSize + FONT_SIZE_STEP, FONT_SIZE_MAX),
        }));
    }, []);

    const decreaseFontSize = useCallback(() => {
        setPreferences((prev) => ({
            ...prev,
            fontSize: Math.max(prev.fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN),
        }));
    }, []);

    const resetFontSize = useCallback(() => {
        setPreferences((prev) => ({
            ...prev,
            fontSize: DEFAULT_PREFERENCES.fontSize,
        }));
    }, []);

    const resetAll = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES);
    }, []);

    const getArticleStyles = useCallback((): React.CSSProperties => {
        const themeStyle = THEME_STYLES[preferences.theme];
        const fontFamilyStyle = FONT_FAMILY_MAP[preferences.fontFamily];
        const lineHeightStyle = LINE_HEIGHT_MAP[preferences.lineHeight];
        const widthStyle = CONTENT_WIDTH_MAP[preferences.contentWidth];

        return {
            backgroundColor: themeStyle.background,
            color: themeStyle.color,
            fontSize: `${preferences.fontSize}px`,
            fontFamily: fontFamilyStyle.css,
            lineHeight: lineHeightStyle.value,
            maxWidth: widthStyle.value,
        };
    }, [preferences]);

    return {
        preferences,
        setTheme,
        setFontFamily,
        setLineHeight,
        setContentWidth,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        resetAll,
        getArticleStyles,
        fontSizeMin: FONT_SIZE_MIN,
        fontSizeMax: FONT_SIZE_MAX,
    };
}
