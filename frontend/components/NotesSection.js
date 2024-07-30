import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

function MarkdownSection({ title, content }) {
  return (
    <div>
      <h1 className="text-skyblue text-center"><b> {title} </b></h1>
      <Markdown remarkPlugins={remarkMath} rehypePlugins={rehypeKatex}>
        {content}
      </Markdown>
    </div>
  )
}

export function Section({ id, title, content }) {

  return (
    <div className="flex justify-center py-2">
        <MarkdownSection title={title} content={content} />
    </div>
  )
}
