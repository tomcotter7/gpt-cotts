function addChat(data, color) {
  var new_row = document.createElement("div");
  new_row.classList.add("row", "pt-2", "px-4")
  new_row.textContent = "";
  var new_col = document.createElement("div");
  new_col.classList.add("col", "mx-auto", "border", "bg-" + color, "rounded", "border-light", "border-3");
  var new_p = document.createElement("md-block");
  new_p.classList.add("text-white")
  new_p.textContent = data;
  new_col.appendChild(new_p);
  new_row.appendChild(new_col);
  document.getElementById("responses").prepend(new_row);
}

document.getElementById("clear").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("responses").innerHTML = "";
    document.getElementById("query-input").value = "";
    $.ajax({
      url: "/reset",
      type: "POST",
      data: JSON.stringify({}),
      contentType: "application/json; charset=utf-8",
      success: function(data) {
        console.log(data['status']);
      }     
  });
});

document.getElementById("rag-form").addEventListener("submit", function(event) {
    event.preventDefault();
    var query = document.getElementById("query-input").value;
    var rag = document.getElementById("useRag").checked;
    document.getElementById("query-input").value = "";
    addChat(query, 'info');
    $.ajax({
        url: "/rag",
        type: "POST",
        data: JSON.stringify({query: query, rag: rag}),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            var model_response = data['model_response'];
            var chunks = data['chunks'];
            console.log(chunks);
            addChat(model_response, 'success');
        }
    });
});

document.getElementById("query-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.get
    document.getElementById("submit-query").click();
  }
})

function expandTextarea(id) {
    document.getElementById(id).addEventListener('keyup', function() {
        this.style.overflow = 'hidden';
        this.style.height = 0;
        this.style.height = this.scrollHeight + 'px';
    }, false);
}

expandTextarea('query-input');
