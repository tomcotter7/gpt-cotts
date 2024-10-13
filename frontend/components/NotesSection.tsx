import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import 'katex/dist/katex.min.css'

interface MarkdownSectionProps {
    title: string;
    content: string;
}

function MarkdownSection({ title, content }: MarkdownSectionProps) {
    return (
    <div className="max-w-full">
        <h2 className="text-tangerine text-center"><b> {title} </b></h2>
        <Markdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            children={content}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <SyntaxHighlighter style={dark} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
        />
    </div>
  )
}

interface SectionProps {
    title: string;
    content: string;
}

export function NotesSection({ title, content }: SectionProps) {
    return (
        <div className="flex justify-center py-2 rounded-xl text-center prose p-4 max-w-full md:min-w-full m-2 text-black">
            <MarkdownSection title={title} content={content} />
        </div>
    )
}
