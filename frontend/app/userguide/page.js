export default function UserGuide() {

    return (
        <div className="max-w-3xl mx-auto px-1 py-4">
            <h1 className="text-tangerine text-4xl font-bold text-center"> User Guide </h1>
            <section className="p-6">
                gpt-cotts is built with the goal to extend a brain. 'notes' is the page for saving the notes, ideas and thoughts the LLM should have access to. Currently, this is a simple wrapper around multiple LLMs. See the models section for more information.
            </section>
            <h2 className="text-tangerine text-3xl font-bold text-center"> Models </h2>
            <section className="p-6">
                Use the "expertise" slider to adjust how the AI models respond to your prompts.
                <div className="space-y-6">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-white text-2xl font-semibold mb-2">GPT Models</h3>
                            OpenAI's GPT series, including GPT-3.5 and the more advanced GPT-4, offer versatile language understanding and generation capabilities.
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-white text-2xl font-semibold mb-2">Deepseek</h3>
                            Deepseek's models, particularly Deepseek-coder, specialize in coding tasks and provide tailored assistance for programming-related queries.
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-white text-2xl font-semibold mb-2">Claude</h3>
                            Anthropic's Claude models, including Claude 3 Haiku and Claude 3.5 Sonnet (the most capable and default model), offer advanced language processing and generation.
                    </div>
                </div>
            </section>
            <h2 className="text-tangerine text-3xl font-semibold mb-4">RAG (Retrieval Augmented Generation)</h2>
            <section className="p-6">
                We currently have a vanilla RAG setup, with query rewriting, embedding, retrieval and reranking performed before sending the retrieve content to the language model. RAG enhances our models by allowing them to access information from your personal notes. Click "query over your notes" to leverage this feature.
                <p className="text-skyblue-dark font-medium">
                    For advanced users: Adjust the reranker option if you feel the model isn't retrieving the most relevant information from your notes.
                </p>
            </section>

            <h2 className="text-tangerine text-3xl font-semibold mb-4">Notes</h2>
                <section className="p-6">
                    The notes section is your personal knowledge base. Store information here that you want our AI models to access and utilize in their responses.
                <div className="space-y-6">
                    <div className="p-4 rounded-lg">
                        <h3 className="text-2xl font-semibold mb-2">Adding Notes</h3>
                        To add notes to an existing 'class' select the class from the dropdown and click edit. To add a new class, click the 'Add Class' button and enter the class name. 
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-2xl font-semibold mb-2">Editing Notes</h3>
                        To edit notes, click the 'Edit' button next to the class you want to edit. You can add, delete, or modify notes in the editor.
                    </div>
                    <div className="p-4 rounded-lg">
                        <h3 className="text-2xl font-semibold mb-2">Notes Format</h3>
                        The format of the notes has been optimised for high quality retrieval and answers. Therefore, it is recommended to follow to use headings ('#' of varying lengths) to separate the sections which will be used for retrieval. For example, a note could be:

                        <p className="text-skyblue-dark font-medium">
                            ## Neovim
                            <br />
                            Neovim is a highly configurable, next-generation text editor. It is a fork of Vim, with a focus on extensibility and usability.
                            <br />
                            ### Keybindings
                            <br />
                            - `:w` - write the file
                            <br />
                            #### Custom Keybindings
                            <br />
                            I have set up 'jk' to exit insert mode and return to normal mode.
                            <br />
                            ### Plugins
                            <br />
                            ...
                        </p>
                    </div>

                            
                </div>
                
                </section>

        </div>
    )
}
