import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

function MarkdownSection({ title, content }) {
  return (
    <div className="max-w-full">
        <h1 className="text-skyblue text-center"><b> {title} </b></h1>
        <Markdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={rehypeKatex}
            children={content}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
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

export function Section({ id, title, content }) {
    return (
        <div className="flex justify-center py-2 rounded-xl border border-black text-center prose p-4 max-w-full md:min-w-full m-2">
            <MarkdownSection title={title} content={content} />
        </div>
    )
}
