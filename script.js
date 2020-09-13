var form = $("#form_id");
var movieList = $("#movieList");
var searchButton = $(".searchButton");
var itemName = $("#inputName");
var searchName = $(".searchBox");
var searchItems = [];
var favoritesList = [];
var keyForSearch = "searchWords";
var keyForFavorites = "favorites";
var favoriteName = $("#favoritesList");

var uuidv4 = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

var getData = function (data) {
  searchData = data ? data : itemName.val();
  axios
    .get("http://www.omdbapi.com/?s=" + searchData + "&apikey=b9af8b2e")
    .then(function (response) {
      var res = response.data;

      FuncForLocalStorage.search(searchData);
      movieList.empty();
      itemName.val("");

      res.Search.forEach(function (list) {
        addItem(movieList, list);
      });
      // addItem ile iconun olduğu yer eklendiği için event burada çağrılmalıdır.
      setRecursiveFunc();
    });
};
var controlSearchInput = function () {
  if (itemName.val().length >= 3) {
    itemName.removeClass("is-danger");
    return true;
  } else {
    itemName.addClass("is-danger");
    return false;
  }
};
var setEventHandlers = function () {
  var flag = false;

  $(document).keypress(function (event) {
    flag = controlSearchInput();
    if (event.keyCode == "13" || event.which == "13") {
      event.preventDefault();
      if (flag) {
        getData();
      }
    }
  });
  searchButton.click(function () {
    if (flag) {
      getData();
    }
  });

  setRecursiveFunc();
};
var setRecursiveFunc = function () {
  $(".icon").click(function () {
    var isFarOrFas = $(this).find("svg");
    var Etarget;
    if (isFarOrFas.attr("data-prefix") == "far") {
      isFarOrFas.attr("data-prefix", "fas");
      Etarget = $(this).parents(".column");
      var id = uuidv4();
      var favorite = {
        id: id,
        div: Etarget,
      };
      favoritesList.push(favorite);
      Etarget.attr("id", id);
      Etarget.clone().appendTo(favoriteName);
      FuncForLocalStorage.setItem(keyForFavorites, favoritesList);
      //addItem(favoriteName);
    } else {
      isFarOrFas.attr("data-prefix", "far");
      Etarget = $(this).parents(".column");
      FuncForLocalStorage.deleteFavoritesItem(Etarget.attr("id"));
    }
  });
  $(".closeIcon").click(function () {
    var delItem = $(this).parent().parent().attr("key");
    FuncForLocalStorage.deleteItem(keyForSearch, delItem);
    displaySearchItems(searchItems);
  });
  $(".box").click(function () {
    var movieData = $(this).find("p").text().trim();
    getData(movieData);
  });
};
var addItem = function (list, data) {
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
  list.append(newHtml);
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
  setRecursiveFunc();
};

var FuncForLocalStorage = (function () {
  //id yi alıp aynı idye sahip olan objeyi siliyor
  var deleteSearchItem = function (id) {
    for (var i = 0; i < searchItems.length; i++) {
      if (searchItems[i].id == id) {
        searchItems.splice($.inArray(searchItems[i], searchItems), 1);
      }
    }
    deleteLocalStorage(keyForSearch);
    setItemLocalStorage(keyForSearch, searchItems);
    displaySearchItems(searchItems);
  };

  var setItemLocalStorage = function (key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  };
  var deleteLocalStorage = function (key) {
    localStorage.removeItem(key);
  };
  return {
    // aranan kelimeyi setItems arrayıne obje olarak ekliyor
    search: function (word) {
      var search = {
        id: uuidv4(),
        name: word,
      };
      searchItems.push(search);
      setItemLocalStorage(keyForSearch, searchItems);
      if (searchItems.length > 10) {
        deleteSearchItem(searchItems[0].id);
      }
      displaySearchItems(searchItems);
    },

    getLocalStorage: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },
    deleteItem: function (key, id) {
      if (key == keyForSearch) {
        deleteSearchItem(id);
      } else {
        deleteFavoritesItem(id);
      }
    },
    setItem: function (key, obj) {
      setItemLocalStorage(key, obj);
    },
    deleteFavoritesItem: function (id) {
      for (var i = 0; i < favoritesList.length; i++) {
        if (favoritesList[i].id == id) {
          favoritesList.splice($.inArray(favoritesList[i], favoritesList), 1);
        }
      }
      deleteLocalStorage(keyForFavorites);
      setItemLocalStorage(keyForFavorites, favoritesList);
    },
  };
})();

var appController = {
  init: function () {
    var FFLStorage = FuncForLocalStorage;
    if (FFLStorage.getLocalStorage(keyForSearch) !== null) {
      searchItems = FFLStorage.getLocalStorage(keyForSearch);
      displaySearchItems(searchItems);
    }
    return setEventHandlers();
  },
};

appController.init();
