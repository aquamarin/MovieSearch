var DOMStrings = {
  movieList: $("#movieList"),
  searchButton: $(".searchButton"),
  itemName: $("#inputName"),
  searchName: $(".searchBox"),
  keyForSearch: "searchWords",
  keyForFavorites: "favorites",
  favoriteName: $("#favoritesList"),
};
var searchItems = [];
var favoritesList = [];
// bu fonksiyon localStoragede tutulan ögeler için id oluşturuyor.
var uuidv4 = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

//inputa yazılan ya da önceden aratılmış kelimelerden seçilen elemana göre apiden axios ile
// veriyi alıyoruz
var getData = function (data) {
  var searchData = data ? data : DOMStrings.itemName.val();
  axios
    .get("http://www.omdbapi.com/?s=" + searchData + "&apikey=b9af8b2e")
    .then(function (response) {
      var res = response.data;

      //aratılan kelimeyi local Storage eklemek için
      FuncForLocalStorage.search(searchData);

      //her axios isteği yapıldıgında input alanı ve sayfanın temizlemesini sağlıyor.
      DOMStrings.movieList.empty();
      DOMStrings.itemName.val("");

      //api den json olarak gelen verinin her bir ögesinin addItem fonksiyonuna gönderiyoruz.
      res.Search.forEach(function (list) {
        addItem(DOMStrings.movieList, list);
      });

      setRecursiveFunc();
    });
};

//search inputu için yerteri kadar karakter yazılıp yazılmadığının kontrolu yapılıyor.
var controlSearchInput = function () {
  if (DOMStrings.itemName.val().length >= 3) {
    DOMStrings.itemName.removeClass("is-danger");
    return true;
  } else {
    DOMStrings.itemName.addClass("is-danger");
    return false;
  }
};

// sayfadaki event olaylarının tutulduğu yer
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
  DOMStrings.searchButton.click(function () {
    if (flag) {
      getData();
    }
  });

  setRecursiveFunc();
};

//sayfa yüklendikten sonra ekelenen ögelerin eventlerini
//aktif etmek için kullanılan fonksiyon
var setRecursiveFunc = function () {
  // favori (kalp iconu) tıklandıgında icon değişimi yapılmasını sağlıyor
  $(".icon").click(function () {
    var isFarOrFas = $(this).find("svg");
    var Etarget;
    if (isFarOrFas.attr("data-prefix") == "far") {
      isFarOrFas.attr("data-prefix", "fas");

      //icona tıklanıp favori listesine eklemnesi için.
      Etarget = $(this).parents(".column");
      var id = uuidv4();
      var favorite = {
        id: id,
        div: Etarget,
      };
      favoritesList.push(favorite);
      Etarget.attr("id", id);
      Etarget.clone().appendTo(DOMStrings.favoriteName);
      FuncForLocalStorage.setItem(DOMStrings.keyForFavorites, favoritesList);
      //addItem(favoriteName);
    } else {
      isFarOrFas.attr("data-prefix", "far");

      //favori listesinden elemanı çıkarmak için
      Etarget = $(this).parents(".column");
      FuncForLocalStorage.deleteFavoritesItem(Etarget.attr("id"));
    }
  });

  // önceden aratılmış olan ögeler listesinden eleman çıkarmak için.
  $(".closeIcon").click(function () {
    var delItem = $(this).parent().parent().attr("key");
    FuncForLocalStorage.deleteItem(DOMStrings.keyForSearch, delItem);
    displaySearchItems(searchItems);
  });

  //önceden aratılmış olan ögeler listesindeki herhangi bir ögeye 
  //tıklandığında tekrar aratılması için 
  $(".box").click(function () {
    var movieData = $(this).find("p").text().trim();
    getData(movieData);
  });
};

// forEach ile gelen datanın html eklenmesini sağlıyor.
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

// Search edilen ögelerin görüntülenmesi için.
var displaySearchItems = function (searchItems) {
  //aynı ögelerin tekrar etmemesi için display etmeden önce temizliyoruz.
  DOMStrings.searchName.children().remove();
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
    DOMStrings.searchName.prepend(box);
  });
  setRecursiveFunc();
};

//localstorage olaylarının döndüğü yer
var FuncForLocalStorage = (function () {
  //id yi alıp aynı idye sahip olan objeyi siliyor
  var deleteSearchItem = function (id) {
    for (var i = 0; i < searchItems.length; i++) {
      if (searchItems[i].id == id) {
        searchItems.splice($.inArray(searchItems[i], searchItems), 1);
      }
    }
    deleteLocalStorage(DOMStrings.keyForSearch);
    setItemLocalStorage(DOMStrings.keyForSearch, searchItems);
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
      setItemLocalStorage(DOMStrings.keyForSearch, searchItems);
      if (searchItems.length > 10) {
        deleteSearchItem(searchItems[0].id);
      }
      displaySearchItems(searchItems);
    },

    getLocalStorage: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },
    deleteItem: function (key, id) {
      if (key == DOMStrings.keyForSearch) {
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
      deleteLocalStorage(DOMStrings.keyForFavorites);
      setItemLocalStorage(DOMStrings.keyForFavorites, favoritesList);
    },
  };
})();

var appController = {
  init: function () {
    var FFLStorage = FuncForLocalStorage;
    if (FFLStorage.getLocalStorage(DOMStrings.keyForSearch) !== null) {
      searchItems = FFLStorage.getLocalStorage(DOMStrings.keyForSearch);
      displaySearchItems(searchItems);
    }
    return setEventHandlers();
  },
};

appController.init();
