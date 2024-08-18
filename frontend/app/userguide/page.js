"use client";

export default function UserGuide() {

    return (
        <div className="max-w-3xl mx-auto px-4 py">
            <h1 className="text-spearmint text-5xl font-bold m-4 text-center">User Guide</h1>
            <section className="mb-10">
                <h2 className="text-spearmint text-3xl font-semibold mb-4">Models</h2>
                <p className="text-lg mb-4">
                    Use the "expertise" slider to adjust how our AI models respond to your prompts.
                </p>
        
                <div className="space-y-4">
                    <h3 className="text-tangerine text-2xl font-semibold">GPT Models</h3>
                    <p className="text-lg">
                        OpenAI's GPT series, including GPT-3.5 and the more advanced GPT-4, offer versatile language understanding and generation capabilities.
                    </p> 
                </div>
                <div>
                    <h3 className="text-tangerine text-2xl font-semibold">Deepseek</h3>
                    <p className="text-lg">
                        Deepseek's models, particularly Deepseek-coder, specialize in coding tasks and provide tailored assistance for programming-related queries.
                    </p>
                </div>
                <div>
                    <h3 className="text-tangerine text-2xl font-semibold">Claude</h3>
                    <p className="text-lg">
                        Anthropic's Claude models, including Claude 3 Haiku and Claude 3.5 Sonnet (our most capable and default model), offer advanced language processing and generation.
                    </p>
                </div>
            </section>
    
            <section className="mb-10">
                <h2 className="text-spearmint text-3xl font-semibold mb-4">RAG (Retrieval Augmented Generation)</h2>
                <p className="text-lg mb">
                    RAG enhances our models by allowing them to access information from your personal notes. Click "query over your notes" to leverage this feature.
                </p>
                <p className="text-lg text-tangerine">
                    For advanced users: Adjust the reranker option if you feel the model isn't retrieving the most relevant information from your notes.
                </p>
            </section>
    
            <section>
                <h2 className="text-spearmint text-3xl font-semibold mb-4">Notes</h2>
                <p className="text-lg">
                    The notes section is your personal knowledge base. Store information here that you want our AI models to access and utilize in their responses.
                </p>
            </section>
        </div>  
    )

}
