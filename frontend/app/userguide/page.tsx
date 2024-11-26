export default function UserGuide() {

    return (
        <div className="max-w-3xl mx-auto px-1 py-4">
            <h1 className="text-tangerine text-4xl font-bold text-center"> User Guide </h1>
            <section className="p-6">
                <p className="text-black mb-2">gpt-cotts is built with the goal to extend a brain. &apos;notes&apos; is the page for saving the notes, ideas and thoughts the LLM should have access to. Currently, this is a simple wrapper around multiple LLMs. See the <u><span className="text-tangerine"><a href="#models">models</a></span></u> section for more information on the models we have access to.</p>
                <p className="text-black">This tool does not have custom prompts. This comes from the opinion that most users don&apos;t want to mess around with custom prompts, and we can hide that complexity behind knobs, dials & buttons. This is also more intuitive to use, and it relates more to traditional internet browsing.</p>
            </section>
            <h2 className="text-tangerine text-3xl font-bold"> Models </h2>
            <section id="model" className="p-6">
                <p className="text-black">Use the &quot;expertise&quot; slider to adjust how the AI models respond to your prompts.</p>
                <div className="space-y-6 bg-skyblue-light rounded shadow-lg border border-black m-4">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">GPT Models</h3>
                            <p className="text-black">OpenAI&apos;s GPT series, including GPT-4o-mini and the more advanced GPT-4o</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Deepseek Chat V2.5</h3>
                            <p className="text-black">Deepseek Chat V2.5 is more advanced combination of DeepseekChat & DeepseekCoder. This means that it is a little better than the other models at coding specific tasks.</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Claude</h3>
                            <p className="text-black">Anthropic&apos;s Claude models, including Claude 3 Haiku and Claude 3.5 Sonnet (the most capable and default model)</p>
                    </div>
                </div>
                <p className="text-black">Keep a eye on <u><span className="text-tangerine"><a href="https://x.com/_tcotts">my X profile</a></span></u> for my opinions on the models and their capabilities.</p>
            </section>
            <h2 className="text-tangerine text-3xl font-semibold mb-4">RAG (Retrieval Augmented Generation)</h2>
            <section className="p-6">
                <p className="text-black">We currently have a vanilla RAG setup, with query rewriting, embedding, retrieval and reranking performed before sending the retrieve content to the language model. RAG enhances our models by allowing them to access information from your personal notes. Click &quot;query over your notes&quot; to leverage this feature (You can also press Alt+r).</p>
                <div className="text-black font-medium border border-black p-2 shadow-lg m-2 bg-skyblue-light rounded">
                    <b> For advanced users: </b> 
                    <p> Adjust the reranker option if you feel the model isn&apos;t retrieving the most relevant information from your notes.</p>
                </div>
            </section>

            <h2 className="text-tangerine text-3xl font-semibold mb-4">Notes</h2>
                <section className="p-6">
                    <p className="text-black">The notes section is your personal knowledge base. Store information here that you want our AI models to access and utilize in their responses.</p>
                <div className="space-y-6">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Adding Notes</h3>
                        <p className="text-black">To add notes to an existing &apos;class&apos; select the class from the dropdown and click edit. To add a new class, click the &apos;Add Class&apos; button and enter the class name. </p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Editing Notes</h3>
                        <p className="text-black">To edit notes, click the &apos;Edit&apos; button next to the class you want to edit. You can add, delete, or modify notes in the editor.</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Notes Format</h3>
                        <p className="text-black">The format of the notes has been optimised for high quality retrieval and answers. Therefore, it is recommended to follow to use headings (&apos;#&apos; of varying lengths) to separate the sections which will be used for retrieval. For example, a note titled &apos;Neovim&apos; could look like this:</p>

                        <div className="border border-black rounded p-4 text-black m-2 bg-skyblue shadow-lg">
                            ## What is Neovim?
                            <br />
                            Neovim is a highly configurable, next-generation text editor. It is a fork of Vim, with a focus on extensibility and usability.
                            <br />
                            ## Keybindings
                            <br />
                            - `:w` - write the file
                            <br />
                            ### Custom Keybindings
                            <br />
                            I have set up &apos;jk&apos; to exit insert mode and return to normal mode.
                            <br />
                            ## Plugins
                            <br />
                            ...
                        </div>

                        <p className="text-black">Ensure that you don&apos;t use a single &apos;#&apos; as a heading, as it is used for the title of the note. Other than that, any markdown is valid, including code and math blocks.</p>
                    </div>

                            
                </div>
                
                </section>
            
            <h2 className="text-tangerine text-3xl font-semibold mb-4">Rubberduck Mode</h2>
            <section className="p-6">
                <p className="text-black"> The RubberDuck mode is a feature I added for when I&apos;m programming. It comes from when my A-Level CS teacher gave me a Rubber duck to talk to as debugging tool. In this mode, the AI will never solve problems or provide answers. However, it will try to guide you towards things you potentially haven&apos;t thought of. I&apos;d recommended trying out this mode while you&apos;re programming as well. </p>
            </section>

            <h2 className="text-tangerine text-3xl font-semibold mb-4">tldraw</h2>
            <section className="p-6">
                <p className="text-black">This tool also has a tldraw integration because I think it&apos;s cool. In the future, a teach.tldraw-like functionality will be added, as I find that super cool.</p>
            </section>

        </div>
    )
}
