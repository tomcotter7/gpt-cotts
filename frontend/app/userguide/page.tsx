export default function UserGuide() {

    return (
        <div className="max-w-3xl mx-auto px-1 py-4">
            <h1 className="text-tangerine text-4xl font-bold text-center"> User Guide </h1>
            <section className="p-6">
                <p className="text-black">gpt-cotts is built with the goal to extend a brain. 'notes' is the page for saving the notes, ideas and thoughts the LLM should have access to. Currently, this is a simple wrapper around multiple LLMs. See the models section for more information.</p>
            </section>
            <h2 className="text-tangerine text-3xl font-bold text-center"> Models </h2>
            <section className="p-6">
                <p className="text-black">Use the "expertise" slider to adjust how the AI models respond to your prompts.</p>
                <div className="space-y-6">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">GPT Models</h3>
                            <p className="text-black">OpenAI's GPT series, including GPT-3.5 and the more advanced GPT-4, offer versatile language understanding and generation capabilities.</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Deepseek</h3>
                            <p className="text-black">Deepseek's models, particularly Deepseek-coder, specialize in coding tasks and provide tailored assistance for programming-related queries.</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Claude</h3>
                            <p className="text-black">Anthropic's Claude models, including Claude 3 Haiku and Claude 3.5 Sonnet (the most capable and default model), offer advanced language processing and generation.</p>
                    </div>
                </div>
            </section>
            <h2 className="text-tangerine text-3xl font-semibold mb-4">RAG (Retrieval Augmented Generation)</h2>
            <section className="p-6">
                <p className="text-black">We currently have a vanilla RAG setup, with query rewriting, embedding, retrieval and reranking performed before sending the retrieve content to the language model. RAG enhances our models by allowing them to access information from your personal notes. Click "query over your notes" to leverage this feature.</p>
                <div className="text-black font-medium border border-black p-2 shadow-lg m-2 bg-skyblue-light rounded">
                    <b> For advanced users: </b> 
                    <p> Adjust the reranker option if you feel the model isn't retrieving the most relevant information from your notes.</p>
                </div>
            </section>

            <h2 className="text-tangerine text-3xl font-semibold mb-4">Notes</h2>
                <section className="p-6">
                    <p className="text-black">The notes section is your personal knowledge base. Store information here that you want our AI models to access and utilize in their responses.</p>
                <div className="space-y-6">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Adding Notes</h3>
                        <p className="text-black">To add notes to an existing 'class' select the class from the dropdown and click edit. To add a new class, click the 'Add Class' button and enter the class name. </p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Editing Notes</h3>
                        <p className="text-black">To edit notes, click the 'Edit' button next to the class you want to edit. You can add, delete, or modify notes in the editor.</p>
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-black text-2xl font-semibold mb-2">Notes Format</h3>
                        <p className="text-black">The format of the notes has been optimised for high quality retrieval and answers. Therefore, it is recommended to follow to use headings ('#' of varying lengths) to separate the sections which will be used for retrieval. For example, a note titled 'Neovim' could look like this:</p>

                        <div className="border border-black rounded p-4 text-black m-2">
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
                            I have set up 'jk' to exit insert mode and return to normal mode.
                            <br />
                            ## Plugins
                            <br />
                            ...
                        </div>

                        <p className="text-black">Ensure that you don't use a single '#' as a heading, as it is used for the title of the note. Other than that, any markdown is valid, including code and math blocks.</p>
                    </div>

                            
                </div>
                
                </section>

        </div>
    )
}
