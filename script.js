// bu fonksiyon localStoragede tutulan ögeler için id oluşturuyor.
var uuidv4 = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

//localstorage olaylarının döndüğü yer
var storage = {
  // aranan kelimeyi setItems arrayıne obje olarak ekliyor
  setItem: function (key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  },

  getItem: function (key) {
    return JSON.parse(localStorage.getItem(key));
  },
};

/* //search inputu için yerteri kadar karakter yazılıp yazılmadığının kontrolu yapılıyor.
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
    //displaySearchItems(searchItems);
    storage.setItem(doms.keyForSearch, searchList);
  });

  //önceden aratılmış olan ögeler listesindeki herhangi bir ögeye
  //tıklandığında tekrar aratılması için
  $(".box").click(function () {
    var movieData = $(this).find("p").text().trim();
    getData(movieData);
  });
};

// Search edilen ögelerin görüntülenmesi için.
var displaySearchItems = function (searchItems) {
  //aynı ögelerin tekrar etmemesi için display etmeden önce temizliyoruz.
  doms.searchList.empty();
  console.log(searchItems);
  searchItems.forEach(function (item) {
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

var search = function (word) {
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
};*/

var appController = {
  init: function () {
    this.apiKey = "b9af8b2e";
    this.apiRoot = "http://www.omdbapi.com/";
    this.movies = [];
    this.searchItems = storage.getItem("searchList") || [];
    this.favoritesList = storage.getItem("favoritesList") || [];
  },
  onload: function () {
    this.doms = {
      searchForm: $("#searchForm"),
      movieList: $("#movieList"),
      submit: $("#submit"),
      itemName: $("#inputName"),
      searchList: $(".searchBox"),
      keyForSearch: "searchWords",
      keyForFavorites: "favorites",
      favoriteName: $("#favoritesList")
    };
    this.bindActions();
  },
  bindActions: function () {
    this.doms.searchForm.on("submit", this.searchSubmit.bind(this));
  },
  searchSubmit: function (e) {
    console.log(e.target);
    e.preventDefault();
    var searchData = this.doms.itemName.val();
    this.getData(searchData);
  },
  //inputa yazılan ya da önceden aratılmış kelimelerden seçilen elemana göre apiden axios ile
  // veriyi alıyoruz
  getData: function (data) {
    axios
      .get(`${this.apiRoot}?s=${data}&apiKey=${this.apiKey}`)
      .then( (response) => {
        this.movies = response.data;

        //aratılan kelimeyi local Storage eklemek için
        //storage.search(data);

        //her axios isteği yapıldıgında input alanı ve sayfanın temizlemesini sağlıyor.
        this.doms.movieList.empty();
        this.doms.itemName.val("");

        //api den json olarak gelen verinin her bir ögesinin addItem fonksiyonuna gönderiyoruz.
        this.movies.Search.forEach( (list)=> {
          this.addItem(list);
        });
      });
  },
  // forEach ile gelen datanın html eklenmesini sağlıyor.
  addItem: function (data) {
    var html = `<div class="column is-3">
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
    html = html.replace(
      /%poster%/,
      data.Poster === "N/A" ? "moviePoster.png" : data.Poster
    );
    html = html.replace(/%title%/, data.Title);
    html = html.replace(/%year%/, data.Year);

    this.doms.movieList.append(html);
  },
};

appController.init();

$(document).ready(function () {
  appController.onload();
});

