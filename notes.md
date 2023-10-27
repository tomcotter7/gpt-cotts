# Notes

## Networking

### FastAPI

A python framework for building APIs. Homepage is [here](https://fastapi.tiangolo.com/).

Once the app is set up - following the documentation - you can run it with: `uvicorn main:app --host 0.0.0.0 --port 8001`, to serve it externally.

### IPs

Find IP address on Linux: `ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'`

## Jupyter

### Notebook

Serving the notebook externally: `jupyter notebook --ip 0.0.0.0 --port 8888`

Adding a password to notebook: `jupyter notebook password`

## Docker

### Other Issues

#### Uploading Docker Images to other Computers

Save the docker image to a tar file: `docker save -o <path for generated tar file> <image name>`

Copy the tar file to the other computer and load it: `docker load -i <path to image tar file>`

Run the compose file: `docker-compose up -d`, this should be run in the same directory as the compose file.

This is mainly useful when you have a computer without internet connection that can't download the images / images aren't available on Docker Hub.

---

## Neovim

### Plugins

[How to write plugins in Lua](https://www.2n.pl/blog/how-to-write-neovim-plugins-in-lua)

Useful article on how to write plugins. TODO: neovim-ai -> built in AI plugin to handle documentation / tests

### Useful Tools

find & replace: `:%s/old/new/g`

---

## Corporate Stuff

### Issue with Corporate Firewall

Fix SLS issue when downloading model from hugging face: "downgrade 'requests' to '2.27.1'", "import os", "os.environ['CURL_CA_BUNDLE'] = ''".

More info can be found on the open issue on GitHub [here](https://github.com/huggingface/transformers/issues/25552).

---

## Dataiku

### WebApps

[WebApp Tutorial](https://knowledge.dataiku.com/latest/data-viz/webapps/tutorial-standard-html.html)

---

## Traditional ML

### Interpretability

[Interpretability Python Package](https://github.com/interpretml/interpret)

Allows you to train "glass-box" models and explainability for black-box models. **Glass-Box**: ML Models designed for interpretability.

Private data explainability here too - could definitely be useful. [link](https://arxiv.org/pdf/1602.04938.pdf)

LIME learns an interpretable model locally around the prediction of the black box model. This means it is model agnostic, although quite slow when performing this on 1000s of records.

The reasoning behind this is that AI/ML essentially requires a human in the loop for a lot of tasks. If you have an explaination of the prediction - the human is more likely to make the correct decision - i.e accept or reject the models prediction.

It could also be required that the model doesn't exploit certain features (such as clickbait titles on articles, etc as this could hurt user retention) to get higher cross validation accuracy scores.

### Maths

#### Linear Algebra

**The Chain Rule**: If $h(x) = f(g(x))$, then $h'(x) = f'(g(x)) \cdot g'(x)$.

Let's say our loss function is $Residual^2 = (Observed - Predicted)^2$, and we are using linear regression to predict the value of $y$ given $x$. We can write this as $y = \beta_0 + \beta_1x$. Therefore, our loss function is $Residual^2 = (Observed - (\beta_0 + \beta_1x))^2$. However, we can also write $Residual^2 = (Inside)^2$, which means we can use the chain chain as $f(g(x)) = (Inside)^2$ and $g(x) = (Observed - (\beta_0 + \beta_1x))$. Therefore, $\frac{\partial Residual^2}{\partial \beta_1} = \frac{\partial Residual^2}{\partial Inside} \cdot \frac{\partial Inside}{\partial \beta_1}$.  We can do the same with $\beta_0$.


---

## Generative AI

### Opinion Blog Posts

[Chatbots / HCI](https://wattenberger.com/thoughts/boo-chatbots)

*Good tools make it clear how they should be used*. 

Also, people want to interact with tools in different ways. The only current way to do that with LLMs is to add context via text.

Perhaps, we could think about adding "sliders". This shows your competency with the topic, how verbose a response, etc...

There is a spectrum of how much human input is required for a task - we want to stay human input > 50% of the total input.
    - This keeps the human engaged.

### ML Papers

[ML Papers of Week](https://github.com/dair-ai/ML-Papers-of-the-Week)

A list of ML papers worth reading - updated every week. I think I should dedicate some time every week to reading and understanding one of these.

[AI Foundational Basics](https://gist.github.com/veekaybee/be375ab33085102f9027853128dc5f0e)

Another list of AI foundational basics - should take some time to read through these.

#### RLAIF

[RLAIF - Paper](https://arxiv.org/pdf/2309.00267.pdf)

This paper shows the comparision between RLHF and RLAIF. They seem to produce comparative results statistically - although from some of the results in the paper (cherry picked too) - the RLHF is clearly slightly better.

One interesting point of note - They used chain of thought reasoning to compare the two summaries. So first they ask the model - "Given these two summaries - explain which is better". Then, using the response they ask "Which is better?".
They don't even use the response for this - they just looked at the probabilties of the tokens for "1" and "2" - so you don't have to determine the answer from the model response.


### Foundational LLM Concepts

#### Embeddings

[What are embeddings?](https://vickiboykis.com/what_are_embeddings/)

TODO: Read through this and make notes on it

#### Attention

[Attention - Explained](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/)

Seq-2-Seq models were the first to use Attention. In a typical Seq-2-Seq, RNNs are used to encode the original input sentence into a context vector. However, since this context vector is a 'pipeline' in a sense, it struggles with long contexts.

In the decoder stage, the RNNs used Attention. The Encoder would pass in all N hidden states (depending on the number of tokens). The Decoder would give each hidden state a softmaxed score, multiply it with the hidden state, essentially computing attention on the Encoder hidden states. This context vector can be combined with the hidden state of the decoder, which is passed into a feed-forward NN to output a word.

[Transformers - Explained](https://jalammar.github.io/illustrated-transformer/)

Language Models use a Decoder-Only Transformer architecture. These contain a feed-forward neural (FFN) network to determine the the next word. However, FFN can't look at words in context. So we need a self-attention layer before this.

[Self Attention - Explained](https://www.youtube.com/@SebastianRaschka)

##### Basic Self Attention

Taken from Sebastian Raschka's lecture series. Self-attention is the attention used in transformers. A very basic version can be described as follows:

You have an input sequence -> a sequence of word embedding vectors. For each input (i), we compute the dot product to every other input (j). This produces a scalar value. We then apply the softmax function to these scalars, so that they sum up to one. This gives us $a_{ij}$.

We then multiply $a_{ij}$ with each $x_j$ (the input) and sum these vectors to produce $A_i$, which is a word embedding for the input $x_i$, however is context-aware.

This is done for each $i$, to produce a matrix $A_{ij}$. The equation for $A_i$ is: $A_i = \Sigma_{j=1}^{T} \space a_{ij}x_{j}$.

##### Scaled Dot-Product Attention

Sebastian also goes through the self-attention introduced in *Attention Is All You Need*. The basic self-attention has no learnable parameters.

We introduce three trainable weight matrices that are multiplied with the input sequence embeddings $x_i$'s. These are query, key, value ($q,k,v$).

The attention values are still computed as a dot product, however we do not use $x_i$ and $x_j$, we instead use $q_i$ and $k_j$.

The equation for the context vector of the second word ($x_2$) is: $A(q_2, K, V) = \Sigma_{i=1}^{T}[\frac{exp(q_2 \cdot k_i^T)}{\Sigma_j \space exp(q_2 \cdot k_j^T)} \cdot v_i]$

This is just a weighted sum, the values are weighted by the attention weight (which has been softmaxed).

This is done for each word, which can obviously be performed in paralell. After this you obtain an attention score matrix.

##### Multi-Head Attention

This scaled dot product attetention previously mentioned is 1-head attention. Multi-head attention is just this with different $q, k, v$ matrices. This means we can attend to different parts of the sequence different. Again this can be done in parallel.

### Prompt Engineering

[Prompt Engineering](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/)

TODO: Read through this and make notes on it.


### LLM Inference

#### Math

[Maths of storing, inference and training of LLMs](https://blog.eleuther.ai/transformer-math/)

Model weights are stored in mixed precision - either fp16 + fp32 or fp16 + bf16. fpN is N-bit floating point. fp16 + fp32 means using lower precision for the majority of the model and higher precision for the parts where numerical stability is important. bf16 is bfloat16. This offers a larger dynamic range than fp16, whilst still providing the reduced memory usage and increased training speed.
        - Difference precisions require different memory:

In fp16/bf16, $memory_{model} = (2 bytes/param) \cdot (No.params)$.

In fp32 we require more memory: $memory_{model} = (4 bytes/param) \cdot (No.params)$.

There is also memory required for inference: $TotalMemory_{Inference} \approx (1.2) \cdot ModelMemory$.

So for example, Llama2-70b at fp16/bf16 requires around 168GB of RAM (most likely slightly more - so 200GB of RAM).

[LLM Inference Math](https://kipp.ly/transformer-inference-arithmetic/)

kv cache: we store the previously calculate key, value attention matrices for tokens that aren't changing. This happens when the model samples it's output token by token.

#### Inference Optimization

[Inference Optimization](https://lilianweng.github.io/posts/2023-01-10-inference-optimization/)

Most interesting thing from here was *Inference Quantization*. The essentially means setting the weights to use int 8-bit precision and keeping activation at fp32 or bf16. This cuts down on the memory required to store the model, as we are using 50% of the memory per parameter.

### Serving LLMs

[FlexFlow](https://github.com/flexflow/FlexFlow/). Uses speculative inference to improve the inference speed.

[Medus](https://github.com/FasterDecoding/Medusa). Improves the inference speed without using speculative inference.

[FastChat](https://github.com/lm-sys/FastChat). Python library to easily serve LLMs -> also useful for training and fine-tuning.

[TinyChat](https://github.com/mit-han-lab/llm-awq/tree/main). In this repo is Tiny Chat - which uses quantization to produce super fast LLMs.

### LLM Training

[ReST for Language Modelling](https://arxiv.org/pdf/2308.08998.pdf)

#### Enforcing Outputs

[Guardrails](https://shreyar.github.io/guardrails/)

[Magnetic](https://github.com/jackmpcollins/magentic#magentic)

### Other Useful LLM Stuff

#### Medium Articles

[Basic Langchain Rag](https://medium.com/@onkarmishra/using-langchain-for-question-answering-on-own-data-3af0a82789ed). This condenses down this [course](https://learn.deeplearning.ai/langchain-chat-with-your-data/lesson/1/introduction) - is a pretty cool implementation of Q&A with your own data.

#### LLM Utilization

[LangChain](https://python.langchain.com/docs/get_started/introduction.html). LangChain is a library for interacting with LLMs. One useful concept I've found so far

## NLP

### Preprocessing

[python-docx](https://python-docx.readthedocs.io/en/latest/index.html). This python library is useful for handling .docx files. Used previously for handling poorly formatted tables inside .docx files.

[regex101](https://regex101.com/). Useful website for testing regex.

### Text Summarization

[sumy](https://github.com/miso-belica/sumy)

### Topic Modelling

#### Latent Dirichlet Allocation (LDA)

An unsupervised ML model that can be used to discover topics in a corpus of documents.

    - https://www.youtube.com/watch?v=T05t-SqKArY
    - https://radimrehurek.com/gensim/auto_examples/tutorials/run_lda.html#sphx-glr-auto-examples-tutorials-run-lda-py
    - https://github.com/rwalk/gsdmm

Gibbs Sampling LDA is more suited to short form text (i.e Tweets)

## Other Topics

### Conciousness

[Consciousness in AI](https://arxiv.org/abs/2308.08708). TODO: Fill out some notes on this

Galileo's Error. TODO: Fill out some notes on this

## Image Classification

[ViT](https://arxiv.org/pdf/2010.11929.pdf): Comparable to ResNet when trained on large amounts of data. Turns the 2-D image into a 1-D encoding to feed into the encoder of a transformer (similar to BERT).
Once you have this, a classification head is trained -> but you can remove this and retrain it when fine-tuning

[Swin Transformer](https://arxiv.org/abs/2103.14030): This improves on the original ViT by using Shifted WINdows (SWIN) -> i.e convolutions, which mean it has a better potential to be suited towards more computer vision tasks, not just image classification.

There are also other methods produced that further combine convolutions and transformer (found [here](https://arxiv.org/pdf/2201.03545.pdf)).

These methods are modern image classification techniques, that perform on par with ResNet (with better scalability), if not better than ResNet.

### Image Recognition / Labelling

AWS has a good off-the-shelf service, found [here](https://aws.amazon.com/rekognition/resources/?nc=sn&loc=6) and [here](https://docs.aws.amazon.com/rekognition/latest/dg/labels-detect-labels-image.html).

The second link especially is very interesting - picking out objects in an image and returning them as multiple bounding boxes.

## Programming Languages

### Mojo

[The mojo homepage](https://www.modular.com/)

#### Syntax Highlighters

[Vim](https://github.com/czheo/mojo.vim)

#### Examples & Cheatsheets

[Mojo Cheatsheet](https://github.com/czheo/mojo-cheatsheet/blob/main/README.md)