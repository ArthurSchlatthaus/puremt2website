import React, {useEffect} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import "../styles/Editor.css";

const Editor = ({value, onChange, clearContent}) => {
    const editor = useEditor({
        extensions: [StarterKit, Image], content: value, autofocus: true, editable: true, onUpdate: ({editor}) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (clearContent && editor && editor.commands) {
            editor.commands.clearContent();
        }
    }, [clearContent, editor]);

    const addImage = () => {
        const url = prompt("Enter image URL");
        if (url && url.trim() !== "") {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                alert("Please enter a valid URL");
                return;
            }
            editor.chain().focus().setImage({src: url}).run();
        }
    };

    const handleButtonClick = (action) => (e) => {
        e.preventDefault(); // Prevent form submission
        action();
    };

    if (!editor) return null;

    return (<div className="editor-container">
        <div className="toolbar">
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => editor.chain().focus().toggleStrike().run())}
            >
                <s>S</s>
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
            >
                • List
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
            >
                1. List
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(addImage)}
            >
                🖼 Image
            </button>
            <button
                type="button"
                className="toolbar-btn"
                onClick={handleButtonClick(() => {
                    const url = prompt("Enter link URL");
                    if (url) editor.chain().focus().extendMarkRange("link").setLink({href: url}).run();
                })}
            >
                🔗 Link
            </button>
        </div>
        <EditorContent editor={editor} className="editor-content"/>
    </div>);
};

export default Editor;
