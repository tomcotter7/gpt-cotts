from flask import Flask, render_template, request, jsonify
from ..backend.rag import rag

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/rag", methods=["POST"])
def get_model_response() -> dict:
    
    query = request.json["query"]
    model_response, chunks = rag(query)
    
    return jsonify({"model_response": model_response, "chunks": chunks})

if __name__ == "__main__":
    app.run(debug=True)