document.getElementById("clear").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("responses").innerHTML = "";
});

document.getElementById("rag-form").addEventListener("submit", function(event) {
    event.preventDefault();
    var query = document.getElementById("query-input").value;
    $.ajax({
        url: "/rag",
        type: "POST",
        data: JSON.stringify({query: query}),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            var model_response = data['model_response'];
            var new_row = document.createElement("div");
            new_row.classList.add("border", "rounded", "row", "pt-2", "bg-info")
            new_row.innerHTML = "";
            var new_col = document.createElement("div");
            new_col.classList.add("col", "mx-auto");
            var new_p = document.createElement("p");
            new_p.classList.add("text-light");
            new_p.innerHTML = model_response;
            new_col.appendChild(new_p);
            new_row.appendChild(new_col);
            document.getElementById("responses").appendChild(new_row);

        }
    });
});