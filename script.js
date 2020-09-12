var form = $("#form_id");
var movieList = $("#movieList");
var searchButton = $(".searchButton");
var itemName = $("#inputName");
var searchName = $(".searchBox");
var searchItems = [];

var getData = function (data) {
  searchData = data ? data : itemName.val();
  axios
    .get("http://www.omdbapi.com/?s=" + searchData + "&apikey=b9af8b2e")
    .then(function (response) {
      console.log(searchData);
      var res = response.data;

      FuncForLocalStorage.search(searchData);
      movieList.empty();
      itemName.val("");

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
var controlSearchInput = function () {
  var character = itemName.val().length;
  if (character >= 3) {
    itemName.removeClass("is-danger");
    getData()
  } else {
    itemName.toggleClass("is-danger");
    
  }
};
var setEventHandlers = function () {
  searchButton.click(controlSearchInput);

  $(document).keypress(function (event) {
    if (event.keyCode == "13" || event.which == "13") {
      event.preventDefault();
      controlSearchInput();
    }
  });
  $(".closeIcon").click(function () {
    var delItem = $(this).parent().parent().attr("key");
    FuncForLocalStorage.deleteItem(delItem);
    displaySearchItems(searchItems);
  });
  $(".box").click(function () {
    var movieData = $(this).find("p").text().trim();
    getData(movieData);
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
  //aynı ögelerin tekrar etmemesi için display etmeden önce temizliyoruz.
  searchName.children().remove();
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
              <i class="fas fa-times fa-2x"></i>
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
    displaySearchItems(searchItems);
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
      if (searchItems.length > 10) {
        deleteSearchItem(searchItems[0].id);
      }
      displaySearchItems(searchItems);
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
