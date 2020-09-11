var form = $("#form_id");
var movieList = $("#movieList");
var searchButton = $(".searchButton");

var getData = function () {
  var movieName = $("#movieName").val();
  console.log(movieName);
  axios
    .get("http://www.omdbapi.com/?s=" + movieName + "&apikey=b9af8b2e")
    .then(function (response) {
      var res = response.data;
      console.log(res);
      
      movieList.empty();
      $("#movieName").val("");

      res.Search.forEach(function (list) {
        addItem(list);
      });
    });
};

var setEventHandlers = function () {
  searchButton.click(getData);
};
var addItem = function (data) {
  var html, newHtml;
  html =
    '<div class="column is-3"><div class="card"><div class="card-image"><figure class="image"> <img src="%poster%" /> </figure> </div> <div class="card-content"> <div class="media"><div class="media-content"> <p class="title is-4">%title%</p></div>  </div><footer class="card-footer"><p class="card-footer-item">%year%</p><p class="card-footer-item">Favori icon</p></footer></div></div></div>';

  newHtml = html.replace(/%poster%/, data.Poster);
  newHtml = newHtml.replace(/%title%/, data.Title);
  newHtml = newHtml.replace(/%year%/, data.Year);
  movieList.append(newHtml);
};

var appController = {
  init: function () {
    return setEventHandlers();
  },
};

appController.init();
