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

/*
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
};

*/

var appController = {
  init: function () {
    this.apiKey = "b9af8b2e";
    this.apiRoot = "http://www.omdbapi.com/";
    this.movies = [];
    this.searchItems = storage.getItem("searchWords") || [];
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
      favoriteName: $("#favoritesList"),
    };
    this.bindActions();
    this.displaySearchItems();
  },
  bindActions: function () {
    this.doms.searchForm.on("submit", this.searchSubmit.bind(this));
    this.doms.searchList.on(
      "click",
      ".closeIcon",
      this.handleSearchDelete.bind(this)
    );
    this.doms.searchList.on("click", "p", this.handleSearchClick.bind(this));
  },
  handleSearchDelete: function (event) {
    var delItem = $(event.target).closest(".searchItem").attr("key");
    this.searchItems = this.searchItems.filter((obj) => obj.id !== delItem);
    this.displaySearchItems();
    storage.setItem(this.doms.keyForSearch, this.searchItems);
  },
  handleSearchClick: function (event) {
    var name = $(event.target).text().trim();
    this.getData(name);
  },
  searchSubmit: function (event) {
    console.log(event.target);
    event.preventDefault();
    var searchData = this.doms.itemName.val();
    this.getData(searchData);
  },
  //inputa yazılan ya da önceden aratılmış kelimelerden seçilen elemana göre apiden axios ile
  // veriyi alıyoruz
  getData: function (data) {
    axios
      .get(`${this.apiRoot}?s=${data}&apiKey=${this.apiKey}`)
      .then((response) => {
        this.movies = response.data;

        //aratılan kelimeyi local Storage eklemek için
        this.search(data);

        //her axios isteği yapıldıgında input alanı ve sayfanın temizlemesini sağlıyor.
        this.doms.movieList.empty();
        this.doms.itemName.val("");

        //api den json olarak gelen verinin her bir ögesinin addItem fonksiyonuna gönderiyoruz.
        this.movies.Search.forEach((list) => {
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

  search: function (word) {
    this.searchItems.push({
      id: uuidv4(),
      name: word,
    });
    if (this.searchItems.length > 10) {
      console.log(this.searchItems);
      this.searchItems.shift();
    }
    storage.setItem(this.doms.keyForSearch, this.searchItems);
    this.displaySearchItems();
  },
  // Search edilen ögelerin görüntülenmesi için.
  displaySearchItems: function () {
    //aynı ögelerin tekrar etmemesi için display etmeden önce temizliyoruz.
    this.doms.searchList.empty();
    this.searchItems.forEach((item) => {
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
      this.doms.searchList.prepend(html);
    });
  },
};

appController.init();

$(document).ready(function () {
  appController.onload();
});
