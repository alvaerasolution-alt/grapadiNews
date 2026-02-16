import { type Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Code,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface ToolbarProps {
    editor: Editor | null;
    onImageUpload?: () => void;
}

export default function Toolbar({ editor, onImageUpload }: ToolbarProps) {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }, [editor]);

    return (
        <div className="sticky top-0 z-10 flex w-full flex-wrap items-center gap-1 border-b border-border bg-background p-1">
            {/* History */}
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={
                                !editor.can().chain().focus().undo().run()
                            }
                            className="h-8 w-8 p-0"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={
                                !editor.can().chain().focus().redo().run()
                            }
                            className="h-8 w-8 p-0"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                </Tooltip>
            </div>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Text Formatting */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bold')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('italic')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('underline')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                    >
                        <Underline className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('strike')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Strikethrough</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Headings */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 2 })}
                        onPressedChange={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                    >
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 3 })}
                        onPressedChange={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                    >
                        <Heading3 className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Heading 3</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Lists */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bulletList')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('orderedList')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Ordered List</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Blocks */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('blockquote')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Blockquote</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('codeBlock')}
                        onPressedChange={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                        }
                    >
                        <Code className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Code Block</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Media */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('link')}
                        onPressedChange={setLink}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Link</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onImageUpload}
                        className="h-9 px-2"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Image</TooltipContent>
            </Tooltip>
        </div>
    );
}
