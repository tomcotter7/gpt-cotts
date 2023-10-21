from flask import Flask, render_template, request, jsonify, Response
from ..backend.rag import rag

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route("/rag", methods=["POST"])
def get_model_response() -> Response:

    query = request.json["query"]  # type: ignore
    model_response, chunks = rag(query)

    return jsonify({"model_response": model_response, "chunks": chunks})


if __name__ == "__main__":
    app.run(debug=True)
