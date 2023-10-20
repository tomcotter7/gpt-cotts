from .querying.openai import query

def rag(input_query: str) -> str:
    
    chunks = []
    model_response = query(input_query, chunks)
    return model_response, chunks

