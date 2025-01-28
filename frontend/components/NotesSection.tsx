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
    <div className="max-w-full min-w-full border-4 border-black p-4">
      <h2 className="text-tangerine text-center"><b> {title} </b></h2>
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              // @ts-expect-error This follows the documentation  - https://github.com/remarkjs/react-markdown.
              <SyntaxHighlighter style={dark} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props} style={{ "whiteSpace": "pre-wrap", "wordWrap": "break-word", "maxWidth": "100%" }}>
                {children}
              </code>
            )
          },
        }}
      >{content}</Markdown>
    </div>
  )
}

interface SectionProps {
  title: string;
  content: string;
}

export function NotesSection({ title, content }: SectionProps) {
  return (
    <div className="flex justify-center rounded-xl text-center prose px-4 max-w-full md:min-w-full m-2 text-black">
      <MarkdownSection title={title} content={content} />
    </div>
  )
}
