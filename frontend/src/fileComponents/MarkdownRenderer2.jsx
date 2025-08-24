import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkDeflist from "remark-deflist";
import { Clipboard, ClipboardCheck } from "lucide-react";

const MarkdownRenderer = ({ content, className }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Code copied! ✅");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const replacedContent = content && content?.replace(/(?<!`)`([^`\s]+)`(?!`)/g, '**$1**');

    return (
        <div className={`prose prose-lg prose-invert max-w-full overflow-hidden leading-8 space-y-6 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDeflist]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{

                    h1: ({ children }) => <h1 className="text-4xl font-bold mt-12 mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-3xl font-semibold mt-10 mb-6 text-gray-200 border-l-4 border-blue-400 pl-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-medium mt-8 mb-5 text-gray-300">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-xl font-medium mt-7 mb-4 text-gray-400">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-lg font-medium mt-6 mb-3 text-gray-400">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-base font-medium mt-5 mb-2 text-gray-400">{children}</h6>,


                    strong: ({ children }) => <strong className="font-bold text-gray-200">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                    del: ({ children }) => <del className="line-through text-gray-500">{children}</del>,
                    mark: ({ children }) => <mark className="bg-yellow-400/30 text-yellow-300 px-1.5 py-0.5 rounded-md">{children}</mark>,
                    sub: ({ children }) => <sub className="text-sm -bottom-0.5 text-gray-400">{children}</sub>,
                    sup: ({ children, node }) => {

                        if (node?.properties?.className?.includes('footnote-ref')) {
                            return <sup className="text-blue-400 ml-1 text-[0.8em]">{children}</sup>;
                        }

                        return <sup className="text-sm -top-0.5 text-gray-400">{children}</sup>;
                    },
                    kbd: ({ children }) => <kbd className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-md text-sm font-mono shadow-sm border border-gray-600">{children}</kbd>,
                    abbr: ({ title, children }) => (
                        <abbr title={title} className="underline decoration-dotted decoration-blue-400 cursor-help text-blue-300">{children}</abbr>
                    ),


                    ul: ({ children }) => <ul className="list-disc pl-6 space-y-3 marker:text-blue-400 marker:opacity-80">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 space-y-3 marker:text-gray-400 marker:font-medium">{children}</ol>,
                    li: ({ children }) => <li className="pl-3">{children}</li>,
                    dl: ({ children }) => <dl className="space-y-5 mt-4 mb-6">{children}</dl>,
                    dt: ({ children }) => <dt className="font-bold text-gray-200 border-b border-gray-600/50 pb-1">{children}</dt>,
                    dd: ({ children }) => <dd className="ml-6 mb-4 pl-3 border-l-2 border-blue-400/50 text-gray-400">{children}</dd>,

                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-400/80 pl-4 text-gray-300 bg-gray-800/30 p-4 rounded-r-md my-5">
                            {children}
                        </blockquote>
                    ),

                    hr: () => <hr className="border-t border-gray-600/50 my-8" />,

                    table: ({ children }) => (
                        <div className="overflow-x-auto w-full my-6 rounded-lg border border-gray-600/50 shadow-xl">
                            <table className="w-full divide-y divide-gray-600/50">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-800/40">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-gray-600/50">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-gray-800/30 transition-colors">{children}</tr>,
                    th: ({ children }) => <th className="px-4 py-3 text-left text-gray-300 font-semibold">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2.5 text-gray-400">{children}</td>,

                    img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-xl my-5 shadow-2xl mx-auto max-w-full h-auto" />,
                    figure: ({ children }) => <figure className="my-6 border border-gray-600/50 rounded-xl p-3 bg-gray-800/30">{children}</figure>,
                    figcaption: ({ children }) => <figcaption className="text-center text-sm text-gray-500 mt-2 italic">{children}</figcaption>,
                    iframe: ({ src, title }) => (
                        <iframe src={src} title={title} className="w-full aspect-video rounded-xl my-5 shadow-2xl border border-gray-600/50" allowFullScreen />
                    ),
                    video: ({ src }) => (
                        <video controls src={src} className="w-full rounded-xl my-5 shadow-2xl border border-gray-600/50">
                            Your browser does not support the video tag.
                        </video>
                    ),

                    details: ({ children }) => <details className="bg-gray-800/30 p-4 rounded-xl shadow-sm border border-gray-600/50 my-5">{children}</details>,
                    summary: ({ children }) => <summary className="cursor-pointer font-medium text-gray-300 hover:text-white transition-colors">{children}</summary>,
                    section: ({ children, node }) =>
                        node.properties?.className?.includes('footnotes') ? (
                            <section className="mt-10 pt-6 border-t border-gray-600/50 text-sm text-gray-500">{children}</section>
                        ) : (
                            <section>{children}</section>
                        ),

                    input: ({ type, checked }) =>
                        type === "checkbox" ? (
                            <input
                                type="checkbox"
                                checked={checked}
                                className="mr-2 w-4 h-4 text-blue-400 bg-gray-800 rounded border-gray-600/50 focus:ring-2 focus:ring-blue-500/80"
                                disabled
                            />
                        ) : null,

                    code({ inline, className, children, ...props }) {

                        const codeString = Array.isArray(children)
                            ? children.map((child) => {
                                if (typeof child === "string") return child;
                                if (child.props && typeof child.props.children === "string") {
                                    return child.props.children;
                                }
                                return "";
                            }).join("")
                            : String(children);


                        if (inline && /^[^\s]+$/.test(codeString.trim())) {
                            return (
                                <strong className="font-bold text-gray-200">
                                    {codeString.trim()}
                                </strong>
                            );
                        }

                        if (inline) {
                            return (
                                <code
                                    className="bg-gray-800/60 text-gray-200 px-1.5 py-0.5 rounded-md text-sm font-mono border border-gray-600/50"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        const index = Math.random();
                        return (
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        setCopiedIndex(index);
                                        copyToClipboard(codeString);
                                    }}
                                    className="absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
                                >
                                    {copiedIndex === index ? (
                                        <ClipboardCheck size={18} className="text-green-400" />
                                    ) : (
                                        <Clipboard size={18} className="text-blue-400" />
                                    )}
                                    <span className="text-xs font-medium">
                                        {copiedIndex === index ? "Copied" : "Copy"}
                                    </span>
                                </button>

                                <pre className="bg-gray-900 text-gray-100 p-5 rounded-xl overflow-x-auto my-6 max-w-full whitespace-pre-wrap shadow-2xl border border-gray-600/50">
                                    <code {...props} className={`${className} text-[15px] leading-relaxed font-mono`}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        );
                    },

                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300/50 transition-colors">
                            {children}
                        </a>
                    ),
                    div: ({ className, children }) => <div className={className || "my-4"}>{children}</div>,
                    span: ({ className, children }) => <span className={className || "text-gray-300"}>{children}</span>,
                }}
            >
                {replacedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;   