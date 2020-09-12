var form = $("#form_id");
var movieList = $("#movieList");
var searchButton = $(".searchButton");
var movieName = $("#movieName");
var searchName = $(".searchBox");
var searchItems = [];

var getData = function () {
  axios
    .get("http://www.omdbapi.com/?s=" + movieName.val() + "&apikey=b9af8b2e")
    .then(function (response) {
      console.log(movieName.val());
      var res = response.data;

      FuncForLocalStorage.search(movieName.val());
      movieList.empty();
      movieName.val("");

      res.Search.forEach(function (list) {
        addItem(list);
      });
      // addItem ile iconun olduğu yer eklendiği için event burada çağrılmalıdır.
      $(".icon").click(function () {
        var isFarOrFas = $(this).find("svg");
        if (isFarOrFas.attr("data-prefix") == "far") {
          isFarOrFas.attr("data-prefix", "fas");
        } else {
          isFarOrFas.attr("data-prefix", "far");
        }
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
  $(".closeIcon").click(function () {
    var delItem = $(this).parent().parent().attr("key");
    FuncForLocalStorage.deleteItem(delItem);
    displaySearchItems(searchItems);
  });
};
var addItem = function (data) {
  var html, newHtml;
  html = `<div class="column is-3">
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
  movieList.append(newHtml);
};

var displaySearchItems = function (searchItems) {
  searchItems.forEach(function (item) {
    var itemID, itemName, box;
    itemID = item.id;
    itemName = item.name;

    box =
      `<div key="` +
      itemID +
      `" class="box column is-one-quarter">
            <div class="tile">
            <p> ` +
      itemName +
      `</p>
            <span class="closeIcon">
              <i class="fas fa-times"></i>
            </span>
          </div>
        </div>`;
    searchName.prepend(box);
  });
};

var FuncForLocalStorage = (function () {
  //id yi alıp aynı idye sahip olan objeyi siliyor
  var deleteSearchItem = function (id) {
    for (var i = 0; i < searchItems.length; i++) {
      if (searchItems[i].id == id) {
        searchItems.splice($.inArray(searchItems[i], searchItems), 1);
      }
    }
    deleteLocalStorage();
    setItemLocalStorage(searchItems);
  };

  var setItemLocalStorage = function (obj) {
    localStorage.setItem("searchWords", JSON.stringify(obj));
  };
  var deleteLocalStorage = function () {
    localStorage.removeItem("searchWords");
  };

  var uuidv4 = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  return {
    // aranan kelimeyi setItems arrayıne obje olarak ekliyor
    search: function (word) {
      var search = {
        id: uuidv4(),
        name: word,
      };
      searchItems.push(search);
      setItemLocalStorage(searchItems);
    },

    getLocalStorage: function () {
      return JSON.parse(localStorage.getItem("searchWords"));
    },
    deleteItem: function (id) {
      deleteSearchItem(id);
    },
  };
})();

var appController = {
  init: function () {
    var FFLStorage = FuncForLocalStorage;
    if (FFLStorage.getLocalStorage() !== null) {
      searchItems = FFLStorage.getLocalStorage();
      displaySearchItems(searchItems);
    }
    return setEventHandlers();
  },
};

appController.init();
