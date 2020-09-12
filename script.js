var form = $("#form_id");
var movieList = $("#movieList");
var searchButton = $(".searchButton");
var movieName = $("#movieName");

var getData = function () {
  console.log(movieName);
  axios
    .get("http://www.omdbapi.com/?s=" + movieName.val() + "&apikey=b9af8b2e")
    .then(function (response) {
      var res = response.data;
      console.log(res);

      movieList.empty();
      movieName.val("");

      res.Search.forEach(function (list) {
        addItem(list);
      });
    });
};

var setEventHandlers = function () {
  searchButton.click(getData);

  $(document).keypress(function (event) {
    if (event.keyCode == "13" || event.which == "13") {
      event.preventDefault();
      getData();
    }
  });
};
var addItem = function (data) {
  var html, newHtml;
  html = 
  `<div class="column is-3">
    <div class="card">
      <div class="card-image">
        <figure class="image is-4by5"> 
          <img src="%poster%" /> 
        </figure> 
      </div> 
      <div class="card-content"> 
        <div class="media">
          <div class="media-content"> 
            <p class="title is-4">%title%</p>
          </div>  
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">%year%</p>
          <p class="card-footer-item">
            <span class="icon">
              <i class="far fa-heart" aria-hidden="true"></i>
            </span>
          </p>
        </footer>
      </div>
    </div>
  </div>`;

  // eğer datada poster, Poster: "N/A" ise boş gelmemesini sağlıyoruz.
  if (data.Poster === "N/A") {
    newHtml = html.replace(/%poster%/, "moviePoster.png");
  } else {
    newHtml = html.replace(/%poster%/, data.Poster);
  }
  newHtml = newHtml.replace(/%title%/, data.Title);
  newHtml = newHtml.replace(/%year%/, data.Year);
  // favori icon değişimi
  // dolu kalp icon classı : fa fa-heart
  movieList.append(newHtml);
};

var appController = {
  init: function () {
    return setEventHandlers();
  },
};

appController.init();
