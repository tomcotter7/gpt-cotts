from flask import Flask, render_template
from ..backend.rag import RAG

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("index.html")