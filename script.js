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
  var searchData = data ? data : doms.itemName.val();
  axios
    .get("http://www.omdbapi.com/?s=" + searchData + "&apikey=b9af8b2e")
    .then(function (response) {
      var res = response.data;

      //aratılan kelimeyi local Storage eklemek için
      storage.search(searchData);

      //her axios isteği yapıldıgında input alanı ve sayfanın temizlemesini sağlıyor.
      doms.movieList.empty();
      doms.itemName.val("");

      //api den json olarak gelen verinin her bir ögesinin addItem fonksiyonuna gönderiyoruz.
      res.Search.forEach(function (list) {
        addItem(doms.movieList, list);
      });

      setRecursiveFunc();
    });
};

//search inputu için yerteri kadar karakter yazılıp yazılmadığının kontrolu yapılıyor.
var controlSearchInput = function () {
  if (doms.itemName.val().length >= 3) {
    doms.itemName.removeClass("is-danger");
    return true;
  } else {
    doms.itemName.addClass("is-danger");
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
  doms.searchButton.click(function () {
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
      displayFavoriteItems(favoritesList);
      storage.setItem(doms.keyForFavorites, favoritesList);
      //addItem(favoriteName);
    } else {
      isFarOrFas.attr("data-prefix", "far");

      //favori listesinden elemanı çıkarmak için
      Etarget = $(this).parents(".column");
      FuncForLocalStorage.deleteItem(
        doms.keyForFavorites,
        Etarget.attr("id"),
        favoritesList
      );
    }
  });

  // önceden aratılmış olan ögeler listesinden eleman çıkarmak için.
  $(".closeIcon").click(function () {
    var delItem = $(this).closest(".searchItem").attr("key");
    searchList = doms.searchList.filter((obj) => obj.id !== delItem);
    displaySearchItems(searchItems);
    storage.setItem(doms.keyForSearch, searchList);
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
  doms.searchList.empty();
  console.log(searchItems);
  this.searchItems.forEach(function (item) {
    var html = `<div key="%key%" class="searchItem box column is-one-quarter">
          <div class="tile">
            <p>%name%</p>
            <span class="closeIcon">
              <i class="fas fa-times fa-2x"></i>
            </span>
          </div>
        </div>`;
    html = html.replace(/%key%/, item.id);
    html = html.replace(/%name%/, item.name);
    doms.searchList.prepend(html);
  });
  setRecursiveFunc();
};
displayFavoriteItems = function (favoriteItems) {
  doms.favoriteName.children().remove();
  favoriteItems.forEach(function (item) {
    var itemID, itemDiv;
    itemID = item.id;
    itemDiv = item.div;
    itemDiv.attr("id", itemID);
    itemDiv.clone().appendTo(doms.favoriteName);
    //doms.favoriteName.prepend(itemDiv);
  });
  setRecursiveFunc();
};

//localstorage olaylarının döndüğü yer
var storage = {
  // aranan kelimeyi setItems arrayıne obje olarak ekliyor
  search: function (word) {
    var search = {
      id: uuidv4(),
      name: word,
    };
    searchItems.push(search);
    this.setItem(doms.keyForSearch, searchItems);
    if (searchItems.length > 10) {
      console.log(searchItems);
      searchItems.shift();
    }
    displaySearchItems(searchItems);
  },

  getItem: function (key) {
    return JSON.parse(localStorage.getItem(key));
  },
  setItem: function (key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  },
};

var appController = {
  init: function () {
    this.searchItems = storage.getItem("searchList") || [];
    this.favoritesList = storage.getItem("favoritesList") || [];
    if (storage.getItem(doms.keyForSearch) !== null) {
      searchItems = storage.getItem(doms.keyForSearch);
      displaySearchItems(searchItems);
    }
    return setEventHandlers();
  },
  onload: function () {
    this.doms = {
      movieList: $("#movieList"),
      searchButton: $(".searchButton"),
      itemName: $("#inputName"),
      searchList: $(".searchBox"),
      keyForSearch: "searchWords",
      keyForFavorites: "favorites",
      favoriteName: $("#favoritesList"),
    };
  },
};

appController.init();

$(document).ready(function () {
  appController.onload();
});
