"use client";

export default function UserGuide() {

    return (
        <div class="max-w-3xl mx-auto px-4 py-8">
            <h1 class="text-tangerine text-5xl font-bold mb-8 text-center">User Guide</h1>
    
            <section class="mb-12 rounded-lg shadow-md p-6">
                <h2 class="text-tangerine text-3xl font-semibold mb-4">Models</h2>
                <p class="text-lg mb-2 text-gray-700">
                    Use the "expertise" slider to adjust how our AI models respond to your prompts.
                </p>
        
                <div class="space-y-6">
                    <div class="p-4 rounded-lg">
                        <h3 class="text-white text-2xl font-semibold mb-2">GPT Models</h3>
                        <p class="text-lg">
                            OpenAI's GPT series, including GPT-3.5 and the more advanced GPT-4, offer versatile language understanding and generation capabilities.
                        </p> 
                    </div>
                    <div class="p-4 rounded-lg">
                        <h3 class="text-white text-2xl font-semibold mb-2">Deepseek</h3>
                        <p class="text-lg">
                            Deepseek's models, particularly Deepseek-coder, specialize in coding tasks and provide tailored assistance for programming-related queries.
                        </p>
                    </div>
                    <div class="p-4 rounded-lg">
                        <h3 class="text-white text-2xl font-semibold mb-2">Claude</h3>
                        <p class="text-lg">
                            Anthropic's Claude models, including Claude 3 Haiku and Claude 3.5 Sonnet (the most capable and default model), offer advanced language processing and generation.
                        </p>
                    </div>
                </div>
            </section>

            <section class="mb-12 rounded-lg shadow-md p-6">
                <h2 class="text-tangerine text-3xl font-semibold mb-4">RAG (Retrieval Augmented Generation)</h2>
                <p class="text-lg mb-4">
                    RAG enhances our models by allowing them to access information from your personal notes. Click "query over your notes" to leverage this feature.
                </p>
                <p class="text-lg text-skyblue-dark font-medium">
                    For advanced users: Adjust the reranker option if you feel the model isn't retrieving the most relevant information from your notes.
                </p>
            </section>

            <section class="rounded-lg shadow-md p-6">
                <h2 class="text-tangerine text-3xl font-semibold mb-4">Notes</h2>
                <p class="text-lg">
                    The notes section is your personal knowledge base. Store information here that you want our AI models to access and utilize in their responses.
                </p>
            </section>
</div>
    )

}
