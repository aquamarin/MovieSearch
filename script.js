var movieName = $("#movieName").val();
var form = $("#form_id");
var movieList = $("#movieList");

form.on("submit", function (event) {
  event.preventDefault();
  $.ajax({
    method: "GET",
    url: "http://www.omdbapi.com/?s=" + movieName + "&apikey=b9af8b2e",
  }).then(function (response) {
    console.log(response);
    movieList.html("");
    response.Search.forEach(function (list) {
      movieList.append(
        "<li>" +
          "<h2>" +
          list.Title +
          "</h2>" +
          "<p>" +
          list.Year +
          "</p>" +
          "<img src='" +
          list.Poster +
          "'>" +
          "</li>"
      );
    });
  });
});
