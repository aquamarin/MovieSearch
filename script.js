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
      submit: $("#submit"),
      movieList: $("#movieList"),
      itemName: $("#inputName"),
      searchList: $(".searchBox"),
      keyForSearch: "searchWords",
      favoritesList: $("#favoritesList"),
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
    // hem movie listsindeki icona tıklayınca hemde favori listesindeki
    //iconu tıklayınca handle favorite çalışmalı
    this.doms.movieList.on(
      "click",
      ".favorite",
      this.handleFavorite.bind(this)
    );
    this.doms.favoritesList.on(
      "click",
      ".favorite",
      this.handleFavorite.bind(this)
    );
    this.doms.itemName.on("keyup", this.handleValidation.bind(this));
  },
  handleFavorite: function (event) {
    var key = $(event.target).closest(".movieItem").attr("key");
    console.log(key);
    var isFavorite = this.favoritesList.find((obj) => obj.imdbID === key);

    if (isFavorite) {
      this.favoritesList = this.favoritesList.filter(
        (obj) => obj.imdbID !== key
      );
    } else {
      var movie = this.movies.find((obj) => obj.imdbID === key);
      this.favoritesList.push(movie);
    }
    storage.setItem("favoritesList", this.favoritesList);
    // movielist ve favorilist tekrar beraber render ediliyor
    this.render();
  },
  handleSearchDelete: function (event) {
    var delItem = $(event.target).closest(".searchItem").attr("key");
    this.searchItems = this.searchItems.filter((obj) => obj.id !== delItem);
    this.displaySearchItems();
    storage.setItem(this.doms.keyForSearch, this.searchItems);
  },

  // input alanına mesaj yazılırken controlu sağlıyor
  handleValidation: function (e) {
    var text = e.target.value;
    if (text.length < 3) {
      this.doms.submit.prop("disabled", true);
      this.doms.itemName.addClass("is-danger");
    } else {
      this.doms.submit.prop("disabled", false);
      this.doms.itemName.removeClass("is-danger");
    }
  },
  handleSearchClick: function (event) {
    var name = $(event.target).text().trim();
    this.getData(name);
  },
  searchSubmit: function (event) {
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
        this.movies = response.data.Search;
        console.log(this.movies.Search);
        //aratılan kelimeyi local Storage eklemek için
        this.search(data);
        //her axios isteği yapıldıgında input alanı temizlemesini sağlıyor.
        this.doms.itemName.val("");

        //api den json olarak gelen verinin her bir ögesinin addItem fonksiyonuna gönderiyoruz.
        this.render();
      });
  },
  // forEach ile gelen datanın html eklenmesini sağlıyor.
  addItem: function (data) {
    var html = `<div class="movieItem column is-3" key=%key%>
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
          <p class="card-footer-item favorite">
            <span class="icon">
              <i class="%icon%" aria-hidden="true"></i>
            </span>
          </p>
        </footer>
      </div>
    </div>
  </div>`;

    //imdbID zaten data ile gelen unique bir sayı oldugu için
    //tekrar uuidv4 kullamaya gerek yok.
    html = html.replace(/%key%/, data.imdbID);
    // eğer datada poster, Poster: "N/A" ise boş gelmemesini sağlıyoruz.
    html = html.replace(
      /%poster%/,
      data.Poster === "N/A" ? "moviePoster.png" : data.Poster
    );
    html = html.replace(/%title%/, data.Title);
    html = html.replace(/%year%/, data.Year);
    //yukarıda eklediğimiz imbdID ile iconun classını değiştireğiz
    var isFavorite = this.favoritesList.find(
      (obj) => obj.imdbID === data.imdbID
    );
    html = html.replace(/%icon%/, isFavorite ? "fas fa-heart" : "far fa-heart");
    return html;
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
  displayMovieItems: function () {
    this.doms.movieList.empty();
    this.movies.forEach((movie) => {
      var movie = this.addItem(movie);
      this.doms.movieList.append(movie);
    });
  },
  displayFavorites: function () {
    this.doms.favoritesList.empty();
    this.favoritesList.forEach((data) => {
      var item = this.addItem(data);
      this.doms.favoritesList.append(item);
    });
  },
  render: function () {
    this.displaySearchItems();
    this.displayMovieItems();
    this.displayFavorites();
  },
};

appController.init();

$(document).ready(function () {
  appController.onload();
});
