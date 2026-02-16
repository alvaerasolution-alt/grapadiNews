import { useState } from 'react';
import {
    useReadingPreferences,
    THEME_STYLES,
    FONT_FAMILY_MAP,
    LINE_HEIGHT_MAP,
    CONTENT_WIDTH_MAP,
    type ReadingTheme,
    type FontFamily,
    type LineHeight,
    type ContentWidth,
} from '@/hooks/use-reading-preferences';
import {
    Sun,
    Moon,
    Flame,
    Minus,
    Plus,
    Type,
    AlignJustify,
    MoveHorizontal,
    RotateCcw,
    Settings2,
    X,
} from 'lucide-react';

interface ReadingToolbarProps {
    preferences: ReturnType<typeof useReadingPreferences>;
}

const themeIcons: Record<ReadingTheme, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    warm: <Flame className="h-4 w-4" />,
};

export default function ReadingToolbar({ preferences }: ReadingToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        preferences: prefs,
        setTheme,
        setFontFamily,
        setLineHeight,
        setContentWidth,
        increaseFontSize,
        decreaseFontSize,
        resetAll,
        fontSizeMin,
        fontSizeMax,
    } = preferences;

    const isDark = prefs.theme === 'dark';

    return (
        <div className="sticky top-4 z-30 mb-6">
            {/* Toggle Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-200 hover:scale-105 bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700`}
                    aria-label="Reading preferences"
                    id="reading-toolbar-toggle"
                >
                    {isOpen ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Settings2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Mode Baca</span>
                </button>
            </div>

            {/* Toolbar Panel */}
            {isOpen && (
                <div
                    className="mt-2 rounded-xl border border-gray-700 bg-gray-800/95 p-4 text-gray-200 shadow-xl backdrop-blur-sm transition-all duration-300"
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Theme Switcher */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-60">
                                <Sun className="h-3 w-3" /> Tema
                            </label>
                            <div className="flex gap-1">
                                {(
                                    Object.keys(THEME_STYLES) as ReadingTheme[]
                                ).map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => setTheme(theme)}
                                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${prefs.theme === theme
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        aria-label={`Theme: ${THEME_STYLES[theme].label}`}
                                    >
                                        {themeIcons[theme]}
                                        <span className="hidden sm:inline">
                                            {THEME_STYLES[theme].label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-60">
                                <Type className="h-3 w-3" /> Ukuran{' '}
                                <span className="font-mono text-[10px]">
                                    {prefs.fontSize}px
                                </span>
                            </label>
                            <div className="flex gap-1">
                                <button
                                    onClick={decreaseFontSize}
                                    disabled={prefs.fontSize <= fontSizeMin}
                                    className="flex flex-1 items-center justify-center rounded-lg bg-gray-700 px-2 py-1.5 text-gray-300 transition-all hover:bg-gray-600 disabled:opacity-30"
                                    aria-label="Decrease font size"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={increaseFontSize}
                                    disabled={prefs.fontSize >= fontSizeMax}
                                    className="flex flex-1 items-center justify-center rounded-lg bg-gray-700 px-2 py-1.5 text-gray-300 transition-all hover:bg-gray-600 disabled:opacity-30"
                                    aria-label="Increase font size"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-60">
                                <Type className="h-3 w-3" /> Font
                            </label>
                            <div className="flex gap-1">
                                {(
                                    Object.keys(
                                        FONT_FAMILY_MAP,
                                    ) as FontFamily[]
                                ).map((family) => (
                                    <button
                                        key={family}
                                        onClick={() => setFontFamily(family)}
                                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${prefs.fontFamily === family
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {FONT_FAMILY_MAP[family].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Line Height */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-60">
                                <AlignJustify className="h-3 w-3" /> Spasi
                            </label>
                            <div className="flex gap-1">
                                {(
                                    Object.keys(
                                        LINE_HEIGHT_MAP,
                                    ) as LineHeight[]
                                ).map((lh) => (
                                    <button
                                        key={lh}
                                        onClick={() => setLineHeight(lh)}
                                        className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-medium transition-all ${prefs.lineHeight === lh
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {LINE_HEIGHT_MAP[lh].label.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Width + Reset */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-60">
                                <MoveHorizontal className="h-3 w-3" /> Lebar
                            </label>
                            <div className="flex gap-1">
                                {(
                                    Object.keys(
                                        CONTENT_WIDTH_MAP,
                                    ) as ContentWidth[]
                                ).map((width) => (
                                    <button
                                        key={width}
                                        onClick={() => setContentWidth(width)}
                                        className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-medium transition-all ${prefs.contentWidth === width
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {CONTENT_WIDTH_MAP[width].label.charAt(
                                            0,
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={resetAll}
                                    className="rounded-lg bg-gray-700 px-2 py-1.5 text-gray-300 transition-all hover:bg-red-900/50 hover:text-red-300"
                                    aria-label="Reset all preferences"
                                    title="Reset"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
