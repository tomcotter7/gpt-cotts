# AWS
## Sagemaker
Sagemaker allows you to use / train modles on AWS, except that no data is sent to Amazon or leaves your VPC. TODO: Read [this](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html)

# Corporate Stuff
## Issue with Corporate Firewall
Fix SLS issue when downloading model from hugging face: "downgrade 'requests' to '2.27.1'", "import os", "os.environ['CURL_CA_BUNDLE'] = ''".
More info can be found on the open issue on GitHub [here](https://github.com/huggingface/transformers/issues/25552).

# Docker
## Tips & Tricks
### Uploading Docker Images to other Computers
Save the docker image to a tar file: `docker save -o <path for generated tar file> <image name>`
Copy the tar file to the other computer and load it: `docker load -i <path to image tar file>`
Run the compose file: `docker-compose up -d`, this should be run in the same directory as the compose file.
This is mainly useful when you have a computer without internet connection that can't download the images / images aren't available on Docker Hub.

# Generative AI
## RAG
### Prompting Techniques
- [Paper](https://arxiv.org/pdf/2312.16171v1.pdf) with 26 different prompting techniques has been released. They focus on strategies that help LLMs produce better outputs.
- [Prompt Enigeering Guide](https://www.promptingguide.ai/). A website with a collection of prompts for different scenarios.
#### Information Compression (LLMLingua)
- [LLMLingua](https://www.llmlingua.com/), uses a smaller (<=7b) model to compute a prompt which contains all of the relevant knowledge in much less tokens.
- They use the statement that tokens with lower perplexity (i.e. the token aligns well with the internal distribution inside the LLM), actually have little effect on the LLMs comprehension of the context. Therefore, we can remove / transform some of these.
- In the paper they regard 'Perplexity' as a *meausre of how well a language model predicts a sample*.
- They train a small lanugage model on the output of the large language model they are using to align the small lanugage model to the distribution of  the large one.
- "We employ the GPT-3.5-Turbo-0301 and the Claude-v1.3 as the target LLMs"
- Interestingly, all these techniques just slightly decrease the token count, the largest decrease can from removing stop words.
#### Information Compression (LongLLMLingua)
- An extension on LLMLingua, using this technique "Therefore, we propose to use the perplexity of the question $x_{que}$ conditioned on different contexts $x_{doc}_k$ to represent the association between them.
- They look at contrastive perplexity which is the perplexity of each demonstration / document with respect to the question itself.
- They also propose a subsequence recovery algorithm as in document Q&A the compressed strings might result in incomplete answers.
#### Storing Prompts / Structured Output Enforcing
- **Enforcing JSON outputs** - use Pydantic! I have collated some great blog posts here - [Jason Liu](https://blog.pydantic.dev/blog/2024/01/04/steering-large-language-models-with-pydantic/) and this random [guy](https://www.youtube.com/watch?v=VKeYaIEk82s) using dynamic pydantic models using `create_model`. Here is a potential library for this - [Instructor](https://jxnl.github.io/instructor/), although it's probably overkill right now.
#### Prompt Engineering
- [Prompt Engineering](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/). TODO: Read through this and make notes on it.
- [Step Back Prompting](https://arxiv.org/pdf/2310.06117.pdf) - A prompting technique which tells the model to deal with the question from first principles. i.e. ask it a complex physics question, the model should first determine the equation that will power the answer, then provide the answer - rather than doing it in one step.
### Multi-Tenancy (Role Based Access Control)
- [RABC Qdrant](https://qdrant.tech/documentation/tutorials/llama-index-multitenancy/). Just metadata filtering, but production ready.
### Retrieval Techniques
#### Hypothetical Questions
- Hypothetical Questions. Generate a question for each chunk and then when searching, query over this index. Replace the result with the corresponding chunk. The statement the user asks is more likely to be similar to the 'hypothetical question' than the chunk itself.
#### HyDE
[Hypothetical Document Embedding (HyDE)](https://boston.lti.cs.cmu.edu/luyug/HyDE/HyDE.pdf). Generate a 'chunk' based on a input question and then use a combination of the question and 'hypothetical chunk' to query the index.
#### Context Enrichment
Sentence Window Retrieval - Additional context around the retrieved sentence is pass to the LLM. Embed super small sentences, and then add context to the retrieved sentence when passing it to the LLM. Increasing the sentence window retrieval can increase the context relevant & groundedness up to a point.
Auto Merging Retrieval - The document is structured as a tree, and if enough of the 'child nodes' are returned by the retrieval, the parent node is returned. Imagine the child nodes as sentences in a paragraph, and the parent node is the entire paragraph. In this, we want to only embed the leaf nodes. 
#### Fusion Retrieval
Also known as hybrid search, fusion retrieval is the combination of dense vector search (i.e the one produced by an embedding model) and a standard sparse vector retrieval algorithm such as BM-25. The two retrieved results are combined with the Reciprocal Rank Fusion algorithm.
#### Reciprocal Rank Fusion
RRF simply sorts the documents according to a naive scoring formula. Given a set of $D$ documents , and a set of rankings $R$, we can compute: $RRFScore(d \in D) = \Sigma_{r \in R} \frac{1}{k + r(d)}$. This is then used to sort the documents.
#### Query Transformations
A family of techniques which use the LLM as a reasoning engine.
One is **Sub Query Taansformation** - Use an LLM to turn the query into multiple sub-queries. "Which has more Github start, Langchain or Llamaindex?" -> "How many Github stars does Langchain have?" and "How many Github stars does Llamaindex have?". These two queries are send to the index in parallel and the results are combined.
#### Context Referencing
We can use fuzzy matching to get the relevant context used in the answer from the retrieved context - this can be used to highlight where the answer came from. Good for UI / HCI
#### Response Synthesis
Vanilla RAG just sends the context and question as a chunk - this can be improved in many ways. One interesting one is to *iteratively refine the answer by sending the retrievved context to the LLM chunk by chunk*.
#### Reranking
Rerank the outputs for better context awareness.
- Here is a super fast library to do so [FlashRank](https://github.com/PrithivirajDamodaran/FlashRank).
- Here are some details on re-ranking with cross-encoders - [SBERT CE](https://www.sbert.net/examples/applications/cross-encoder/README.html)
#### Adding Noise
This [paper](https://arxiv.org/pdf/2401.14887.pdf) suggests that adding noise to the prompt - i.e. gathering irrevelant documents is actually more beneficial than gathering related documents which don't answer the question in terms of accuracy. Whether this is a feature or a bug of LLMs is up in the air - but it could be interesting to play with.
### Safety
Meta has LLamaGuard - part of their purple Llama safety initiative. It ensures 3 things currently, *prompt injection*, *insecure output handling* and *sensitive information disclosure*. [Here](https://towardsdatascience.com/safeguarding-your-rag-pipelines-a-step-by-step-guide-to-implementing-llama-guard-with-llamaindex-6f80a2e07756) is a good medium article on the topic.
### Evaluation
A "RAG Triad" exists for evaluation, which is "Groundedness", "Answer Relevance" and "Context Relevance". "Groundedness" means 'Is the response supported by the context?', "Answer Relevance" means 'Is the response relevant to the query?", and "Context Relevance" means 'Is the retrieved context relevant to the query?'.
#### NDCG - Normalized Discounted Cumulative Gain
Determined by dividing the Discounted Cumulative GAIN (DCG) by the ideal DCG (i.e a perfect ranking). DCG measures the total relevance of an item in a list with a discount that helps adddress the diminshing value of items further down the list.

We can break this down:
    - CG@K - The sum of scores of all relevant items among the top-K results
    - DCG@K - Add a logarithmic penalty to each item in the list as you move down the list (sum the results)

More details [here](https://www.evidentlyai.com/ranking-metrics/ndcg-metric)
## Opinion Blog Posts
[Chatbots / HCI](https://wattenberger.com/thoughts/boo-chatbots)
*Good tools make it clear how they should be used*. 
Perhaps, we could think about adding "sliders". This shows your competency with the topic, how verbose a response, etc...
There is a spectrum of how much human input is required for a task - we want to stay human input > 50% of the total input.
## Interesting Papers
### Resources for accessing papers
[ML Papers of Week](https://github.com/dair-ai/ML-Papers-of-the-Week)
[AI Foundational Basics](https://gist.github.com/veekaybee/be375ab33085102f9027853128dc5f0e)
### Mixtral 8x7b
[Mixtral](https://arxiv.org/abs/2401.04088). A LLM has an Attention Layer and a Feed Forward Layer. The FFN is linear, such that previously all tokens follow the same path after being passed through the attention layer. In this paper, they have multiple 'experts' i.e. multiple FFNs, and we can route the tokens through specific FFNs (2) and combine the results. It's called *sparse* because each token does not to go every expert. [Here](https://www.youtube.com/watch?v=mwO6v4BlgZQ&t=224s) is YKs video on the topic
### RLAIF
[RLAIF - Paper](https://arxiv.org/pdf/2309.00267.pdf)
This paper shows the comparision between RLHF and RLAIF. They seem to produce comparative results statistically - although from some of the results in the paper (cherry picked too) - the RLHF is clearly slightly better.
One interesting point of note - They used chain of thought reasoning to compare the two summaries. So first they ask the model - "Given these two summaries - explain which is better". Then, using the response they ask "Which is better?".
They don't even use the response for this - they just looked at the probabilties of the tokens for "1" and "2" - so you don't have to determine the answer from the model response.
### Eco-Assistant
[Eco-Assistant - Paper](https://arxiv.org/pdf/2310.03046.pdf)
Uses multiple calls to smaller language models (which are orders of magnitude cheaper) to interact with APIs. Only if the small model can't do it does it move on to more expensive models. Overall, this is cheaper. Results in a 5x cost reduction.
### DSPy
[DSPy](https://huggingface.co/papers/2310.03714)
They argue that prompt engineering is brittle, and akin to manually finetuning weights on a classifier. This abstracts LM pipelines as *text transformation graphs*. These can be automatically optimised for better results. From the paper "DSPy contributes three abstractions toward automatic optimization: signatures, modules, and teleprompters. Signatures abstract the input/output behavior of a module; modules replace existing hand-prompting techniques and can be composed in arbitrary pipelines; and teleprompters optimize all modules in the pipeline to maximize a metric.". Prompts go from 'You are an AI assistant ....' to 'question -> answer'. Teleprompters are powerful optimizers (included in DSPy) that can learn to bootstrap and select effective prompts for the modules of any program. (The "tele-" in the name means "at a distance", i.e., automatic prompting at a distance.)
### CoVe - Chain of Verification
[CoVe](https://arxiv.org/pdf/2309.11495.pdf)
TODO: Read through this and make notes on it.
### QMoE: Sub 1-bit compression
[QMoE](https://arxiv.org/pdf/2310.16795.pdf)
TODO: Read through this and make notes on it.
### LLM in a Flash (Apple)
Recent [Paper](https://arxiv.org/pdf/2312.11514.pdf) by Apple on how to get LLMs on edge devices.

They introduced two techniques, *Windowing*, which only loads parameters from Flash Memory (larger than DRAM) if they are non-zero, and only load params for the last few tokens. This is a sliding window approach that reduces the number of IO requests required to build the weights. *Row-Column Building* - storing a concatenating row and column of the up-projection and down-projection layers to read bigger contiguous chunks from flask memory. These layers transform input data into higher and lower dimensional representations respectively. These two operations together allow the authors to load just 2% of the feed forward neural network from flash for each inference query.

They basically just exploit the sparsity of FFN, and as such only need to transfer the non-sparse params from Flash to DRAM. Some techniques they use to keep latency low are:
*Selective Persistance Strategy*: The embeddings and matrices with the attention mechanism (1/3 of model size) are kept in memory. Keeps inference performance high.
*Anticipating ReLU sparsity*: A new predictor that only predicts whether the outputs will be zero'd by ReLU which means that they won't have to be loaded into memory.
## Foundational LLM Concepts
### Embeddings
[What are embeddings?](https://vickiboykis.com/what_are_embeddings/)
### Attention
#### Attention & Transformers - Explained
[Attention - Explained](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/)
Seq-2-Seq models were the first to use Attention. In a typical Seq-2-Seq, RNNs are used to encode the original input sentence into a context vector. However, since this context vector is a 'pipeline' in a sense, it struggles with long contexts.
In the decoder stage, the RNNs used Attention. The Encoder would pass in all N hidden states (depending on the number of tokens). The Decoder would give each hidden state a softmaxed score, multiply it with the hidden state, essentially computing attention on the Encoder hidden states. This context vector can be combined with the hidden state of the decoder, which is passed into a feed-forward NN to output a word.
[Transformers - Explained](https://jalammar.github.io/illustrated-transformer/)
Language Models use a Decoder-Only Transformer architecture. These contain a feed-forward neural (FFN) network to determine the the next word. However, FFN can't look at words in context. So we need a self-attention layer before this.
[Self Attention - Explained](https://www.youtube.com/@SebastianRaschka)
#### Basic Self Attention
Taken from Sebastian Raschka's lecture series. Self-attention is the attention used in transformers. A very basic version can be described as follows:
You have an input sequence -> a sequence of word embedding vectors. For each input (i), we compute the dot product to every other input (j). This produces a scalar value. We then apply the softmax function to these scalars, so that they sum up to one. This gives us $a_{ij}$.
We then multiply $a_{ij}$ with each $x_j$ (the input) and sum these vectors to produce $A_i$, which is a word embedding for the input $x_i$, however is context-aware.
This is done for each $i$, to produce a matrix $A_{ij}$. The equation for $A_i$ is: $A_i = \Sigma_{j=1}^{T} \space a_{ij}x_{j}$.
#### Scaled Dot-Product Attention
Sebastian also goes through the self-attention introduced in *Attention Is All You Need*. The basic self-attention has no learnable parameters.
We introduce three trainable weight matrices that are multiplied with the input sequence embeddings $x_i$'s. These are query, key, value ($q,k,v$).
The attention values are still computed as a dot product, however we do not use $x_i$ and $x_j$, we instead use $q_i$ and $k_j$.
The equation for the context vector of the second word ($x_2$) is: $A(q_2, K, V) = \Sigma_{i=1}^{T}[\frac{exp(q_2 \cdot k_i^T)}{\Sigma_j \space exp(q_2 \cdot k_j^T)} \cdot v_i]$
This is just a weighted sum, the values are weighted by the attention weight (which has been softmaxed).
This is done for each word, which can obviously be performed in paralell. After this you obtain an attention score matrix.
#### Multi-Head Attention
This scaled dot product attetention previously mentioned is 1-head attention. Multi-head attention is just this with different $q, k, v$ matrices. This means we can attend to different parts of the sequence different. Again this can be done in parallel.
## LLM Inference
### Math
[Maths of storing, inference and training of LLMs](https://blog.eleuther.ai/transformer-math/)
Model weights are stored in mixed precision - either fp16 + fp32 or fp16 + bf16. fpN is N-bit floating point. fp16 + fp32 means using lower precision for the majority of the model and higher precision for the parts where numerical stability is important. bf16 is bfloat16. This offers a larger dynamic range than fp16, whilst still providing the reduced memory usage and increased training speed.
        - Difference precisions require different memory:
In fp16/bf16, $memory_{model} = (2 bytes/param) \cdot (No.params)$.
In fp32 we require more memory: $memory_{model} = (4 bytes/param) \cdot (No.params)$.
There is also memory required for inference: $TotalMemory_{Inference} \approx (1.2) \cdot ModelMemory$.
So for example, Llama2-70b at fp16/bf16 requires around 168GB of RAM (most likely slightly more - so 200GB of RAM).
[LLM Inference Math](https://kipp.ly/transformer-inference-arithmetic/)
kv cache: we store the previously calculate key, value attention matrices for tokens that aren't changing. This happens when the model samples it's output token by token.
### Inference Optimization
[Inference Optimization](https://lilianweng.github.io/posts/2023-01-10-inference-optimization/)
Most interesting thing from here was *Inference Quantization*. The essentially means setting the weights to use int 8-bit precision and keeping activation at fp32 or bf16. This cuts down on the memory required to store the model, as we are using 50% of the memory per parameter.
## Serving LLMs
### FlexFlow
[FlexFlow](https://github.com/flexflow/FlexFlow/). Uses speculative inference to improve the inference speed.
### Medus
[Medus](https://github.com/FasterDecoding/Medusa). Improves the inference speed without using speculative inference.
### FastChat
[FastChat](https://github.com/lm-sys/FastChat). Python library to easily serve LLMs -> also useful for training and fine-tuning.
### TinyChat
[TinyChat](https://github.com/mit-han-lab/llm-awq/tree/main). In this repo is Tiny Chat - which uses quantization to produce super fast LLMs.
### Petals
[Petals](https://petals.dev/). This is a library for running LLMs in the style of bit-torrent. This means other people run different parts of the model. Llama2 runs at 6 tokens/sec.
## LLM Training
### ReST
[ReST for Language Modelling](https://arxiv.org/pdf/2308.08998.pdf)

# Git
## Tips & Tricks
*Get the email of the author of the last commit*: `git log --format="%ae" | head -1`
*Move existing, uncomitted work to a new branch in Git*: `git switch -c <new-branch>`.

# Image Classification
## ViT
[ViT](https://arxiv.org/pdf/2010.11929.pdf)
Comparable to ResNet when trained on large amounts of data. Turns the 2-D image into a 1-D encoding to feed into the encoder of a transformer (similar to BERT).
Once you have this, a classification head is trained -> but you can remove this and retrain it when fine-tuning
## Swin
[Swin Transformer](https://arxiv.org/abs/2103.14030): This improves on the original ViT by using Shifted WINdows (SWIN) -> i.e convolutions, which mean it has a better potential to be suited towards more computer vision tasks, not just image classification.
## Other Methods
There are also other methods produced that further combine convolutions and transformer (found [here](https://arxiv.org/pdf/2201.03545.pdf)).
## Image Recognition / Labelling
AWS has a good off-the-shelf service, found [here](https://aws.amazon.com/rekognition/resources/?nc=sn&loc=6) and [here](https://docs.aws.amazon.com/rekognition/latest/dg/labels-detect-labels-image.html).
The second link especially is very interesting - picking out objects in an image and returning them as multiple bounding boxes.

# Jenkins
## Groovy
### Useful Tips
We can use `when` to only execute a stage given a certain condition. For example, we can define a function `def isPullRequest() { return env.CHANGE_ID != null}`, and then use a `when` clause like so: `stage('Stage A') { when { expression { return isPullRequest() } } steps { ... } }`. This will only execute the steps of the stage if the expression is true.
## Environment Variables
To view all environment variables available to you on a Jenkins instance, go to *jenkins-instance-url*/env-vars.html.

# Jupyter
## Notebook
Serving the notebook externally: `jupyter notebook --ip 0.0.0.0 --port 8888`
Adding a password to notebook: `jupyter notebook password`

# Lectures
## Stanford NLP
[Youtube](https://www.youtube.com/watch?v=rmVRLeJRkl4&list=PLoROMvodv4rMFqRtEuo6SGjY4XbRIVRd4&index=1)
## MIT - Efficient ML
[Youtube](https://www.youtube.com/watch?v=rCFvPEQTxKI&list=PL80kAHvQbh-pT4lCkDT53zT8DKmhE0idB)
## AI Engineer Summit 2023
[YouTube](https://www.youtube.com/@aiDotEngineer)

# NLP
## Preprocessing
[python-docx](https://python-docx.readthedocs.io/en/latest/index.html). This python library is useful for handling .docx files. Used previously for handling poorly formatted tables inside .docx files.
[regex101](https://regex101.com/). Useful website for testing regex.
## Text Summarization
[sumy](https://github.com/miso-belica/sumy)
## Topic Modelling
### Latent Dirichlet Allocation (LDA)
An unsupervised ML model that can be used to discover topics in a corpus of documents.
    - https://www.youtube.com/watch?v=T05t-SqKArY
    - https://radimrehurek.com/gensim/auto_examples/tutorials/run_lda.html#sphx-glr-auto-examples-tutorials-run-lda-py
    - https://github.com/rwalk/gsdmm
Gibbs Sampling LDA is more suited to short form text (i.e Tweets)

# Neovim
## Plugins
[How to write plugins in Lua](https://www.2n.pl/blog/how-to-write-neovim-plugins-in-lua)
Useful article on how to write plugins.
## Useful Tools
find & replace: `:%s/old/new/g`
vimgrep: `vimgrep /^# / %` would populate all instances of a line starting with '# ', into a buffer which can be opened with :copen.

# Networking
## FastAPI
A python framework for building APIs. Homepage is [here](https://fastapi.tiangolo.com/).
Once the app is set up - following the documentation - you can run it with: `uvicorn main:app --host 0.0.0.0 --port 8001`, to serve it externally.
## IPs
Find IP address on Linux: `ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'`

# PowerBI
## Slicers
[Video](https://www.youtube.com/watch?v=c_MjL1Cngbs) on default value for slicers.

# Programming Languages
## Mojo
### Resources
[The mojo homepage](https://www.modular.com/)
### Syntax Highlighters
[Vim](https://github.com/czheo/mojo.vim)
### Examples & Cheatsheets
[Mojo Cheatsheet](https://github.com/czheo/mojo-cheatsheet/blob/main/README.md)
## Go (Golang)
### Creating a Go Module
`go mod init <module-name>`.
If you want to use that folder (module) in a different folder you can do `go mod edit -replace <module-name>=<path-to-module>`. Finally, run `go mod tidy` to clean up any imports.
## Python
### Pip
You can find the requirements for a package using the pypi json endpoint `https://pypi.org/pypi/<package>/<version>/json`.
## Bash
You can run a bash script without forking it by prefixing it with a dot: `. ./script.sh`

# Traditional ML
## Interpretability
[Interpretability Python Package](https://github.com/interpretml/interpret)
Allows you to train "glass-box" models and explainability for black-box models. **Glass-Box**: ML Models designed for interpretability.
Private data explainability here too - could definitely be useful. [link](https://arxiv.org/pdf/1602.04938.pdf)
LIME learns an interpretable model locally around the prediction of the black box model. This means it is model agnostic, although quite slow when performing this on 1000s of records.
The reasoning behind this is that AI/ML essentially requires a human in the loop for a lot of tasks. If you have an explaination of the prediction - the human is more likely to make the correct decision - i.e accept or reject the models prediction.
It could also be required that the model doesn't exploit certain features (such as clickbait titles on articles, etc as this could hurt user retention) to get higher cross validation accuracy scores.
## Maths
### Linear Algebra
**The Chain Rule**: If $h(x) = f(g(x))$, then $h'(x) = f'(g(x)) \cdot g'(x)$.
Let's say our loss function is $Residual^2 = (Observed - Predicted)^2$, and we are using linear regression to predict the value of $y$ given $x$. We can write this as $y = \beta_0 + \beta_1x$. Therefore, our loss function is $Residual^2 = (Observed - (\beta_0 + \beta_1x))^2$. However, we can also write $Residual^2 = (Inside)^2$, which means we can use the chain chain as $f(g(x)) = (Inside)^2$ and $g(x) = (Observed - (\beta_0 + \beta_1x))$. Therefore, $\frac{\partial Residual^2}{\partial \beta_1} = \frac{\partial Residual^2}{\partial Inside} \cdot \frac{\partial Inside}{\partial \beta_1}$.  We can do the same with $\beta_0$.
### Books
[Linear Algebra Done Right](https://linear.axler.net/)

