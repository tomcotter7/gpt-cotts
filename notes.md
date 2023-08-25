# Notes

## Bugs

### Issue with Corporate Firewall
	- Fix SLS issue when downloading model from hugging face: "downgrade 'requests' to '2.27.1'", "import os", "os.environ['CURL_CA_BUNDLE'] = ''".
    	- More info can be found on the open issue on GitHub: https://github.com/huggingface/transformers/issues/25552


## Generative AI

### LLM Training
	- [ReST for Language Modelling](https://arxiv.org/pdf/2308.08998.pdf)

	- **Enforcing Outputs**
		- https://shreyar.github.io/guardrails/

## NLP
### Text Summarization
	- https://github.com/miso-belica/sumy
	
### Topic Modelling

	- Latent Dirichlet Allocation (LDA)
		- An unsupervised ML model that can be used to discover topics in a corpus of documents.
		- https://www.youtube.com/watch?v=T05t-SqKArY
		- https://radimrehurek.com/gensim/auto_examples/tutorials/run_lda.html#sphx-glr-auto-examples-tutorials-run-lda-py
		- https://github.com/rwalk/gsdmm -> A version of LDA that is more suited to short text documents.
		
## Other Topics

### Conciousness
	- [Consciousness in AI](https://arxiv.org/abs/2308.08708)
	- Galileo's Error