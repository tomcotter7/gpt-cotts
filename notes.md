# Notes

## Federated Learning

  - https://arxiv.org/abs/1602.05629
  - https://arxiv.org/abs/1811.04017

## Bugs

### Issue with Corporate Firewall
	- Fix SLS issue when downloading model from hugging face: "downgrade 'requests' to '2.27.1'", "import os", "os.environ['CURL_CA_BUNDLE'] = ''".
    	- More info can be found on the open issue on GitHub: https://github.com/huggingface/transformers/issues/25552

## Platforms

### Dataiku

**WebApps**
	- https://knowledge.dataiku.com/latest/data-viz/webapps/tutorial-standard-html.html

## Generative AI

### Opinion Blog Posts

	- https://wattenberger.com/thoughts/boo-chatbots -> Chatbots are not the future of AI.

### ML Papers

	- https://github.com/dair-ai/ML-Papers-of-the-Week ->
	- https://gist.github.com/veekaybee/be375ab33085102f9027853128dc5f0e -> A list of ML papers that are worth reading - no vendor bullshit

### Foundational LLM Concepts

**Embeddings**

	- https://vickiboykis.com/what_are_embeddings/

**Attention**

	- [Attention](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/)

Seq-2-Seq models were the first to use Attention. In a typical Seq-2-Seq, RNNs are used to encode the original input sentence into a context vector. However, since this context vector is a 'pipeline' in a sense, it struggles with long contexts.

In the decoder stage, the RNNs used Attention. The Encoder would pass in all N hidden states (depending on the number of tokens). The Decoder would give each hidden state a softmaxed score, multiply it with the hidden state, essentially computing attention on the Encoder hidden states. This context vector can be combined with the hidden state of the decoder, which is passed into a feed-forward NN to output a word.


	- [Transformer](https://jalammar.github.io/illustrated-transformer/)

Language Models use a Decoder-Only Transformer architecture. These contain a feed-forward neural (FFN) network to determine the the next word. However, FFN can't look at words in context. So we need a self-attention layer before this.




### LLM Inference

**Math**

	- [Maths of storing, inference and training of LLMs](https://blog.eleuther.ai/transformer-math/)

Model weights are stored in mixed precision - either fp16 + fp32 or fp16 + bf16. fpN is N-bit floating point. fp16 + fp32 means using lower precision for the majority of the model and higher precision for the parts where numerical stability is important. bf16 is bfloat16. This offers a larger dynamic range than fp16, whilst still providing the reduced memory usage and increased training speed.
		- Difference precisions require different memory:

In fp16/bf16, $memory_{model} = (2 bytes/param) \cdot (No.params)$.

In fp32 we require more memory: $memory_{model} = (4 bytes/param) \cdot (No.params)$.

There is also memory required for inference: $TotalMemory_{Inference} \approx (1.2) \cdot ModelMemory$.

	- [LLM Inference Math](https://kipp.ly/transformer-inference-arithmetic/)

kv cache: we store the previously calculate key, value attention matrices for tokens that aren't changing. This happens when the model samples it's output token by token.
### LLM Training
	- [ReST for Language Modelling](https://arxiv.org/pdf/2308.08998.pdf)

	- **Enforcing Outputs**
		- https://shreyar.github.io/guardrails/

## NLP

### Text Summarization
	- https://github.com/miso-belica/sumy

	
### Topic Modelling

	- Latent Dirichlet Allocation (LDA)
An unsupervised ML model that can be used to discover topics in a corpus of documents.

	- https://www.youtube.com/watch?v=T05t-SqKArY
	- https://radimrehurek.com/gensim/auto_examples/tutorials/run_lda.html#sphx-glr-auto-examples-tutorials-run-lda-py
    - https://github.com/rwalk/gsdmm

Gibbs Sampling LDA is more suited to short form text (i.e Tweets)
		
## Other Topics

### Conciousness
	- [Consciousness in AI](https://arxiv.org/abs/2308.08708)
	- Galileo's Error
