import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect, useRef } from 'react';
import Toolbar from './toolbar';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
    className?: string;
}

export default function TiptapEditor({
    content,
    onChange,
    placeholder = 'Write something amazing...',
    editable = true,
    className,
}: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadRef = useRef<((file: File) => void) | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // We use custom configuration
            }),
            Heading.configure({
                levels: [2, 3, 4],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg border border-border shadow-sm',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm min-h-[300px] max-w-none px-4 py-3 focus:outline-none sm:prose-base dark:prose-invert',
                    className,
                ),
            },
            handleDrop: (view, event, slice, moved) => {
                if (
                    !moved &&
                    event.dataTransfer &&
                    event.dataTransfer.files &&
                    event.dataTransfer.files[0]
                ) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        uploadRef.current?.(file);
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.indexOf('image') === 0) {
                            const file = item.getAsFile();
                            if (file) {
                                uploadRef.current?.(file);
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
        },
    });

    const handleImageUpload = useCallback(
        async (file: File) => {
            if (!file || !editor) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                // Get CSRF token from document.cookie
                const getXsrfToken = () => {
                    const match = document.cookie.match(
                        new RegExp('(^| )XSRF-TOKEN=([^;]+)'),
                    );
                    if (match) return decodeURIComponent(match[2]);
                    return null;
                };

                const token = getXsrfToken();
                const response = await fetch('/media/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-XSRF-TOKEN': token || '',
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(error.message || 'Image upload failed');
                    return;
                }

                const data = await response.json();
                const url = data.urls.medium || data.urls.original;

                editor.chain().focus().setImage({ src: url }).run();
            } catch (error) {
                console.error('Upload error:', error);
                alert('An error occurred while uploading the image.');
            }
        },
        [editor],
    );

    // Keep the ref updated with the latest handler (which closes over the latest editor instance)
    useEffect(() => {
        uploadRef.current = handleImageUpload;
    }, [handleImageUpload]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-md border border-input bg-background shadow-sm">
            <Toolbar
                editor={editor}
                onImageUpload={() => fileInputRef.current?.click()}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={onFileSelect}
            />

            <EditorContent editor={editor} />
        </div>
    );
}
