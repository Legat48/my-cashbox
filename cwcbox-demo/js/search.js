"use strict";

var searchInput = document.querySelector('#search-input');
var delay = null;

function renderSerchedData() {
  var filterString = searchInput.value.toString().toLowerCase();

  if (filterString === '') {
    return;
  }

  menuApp.renderList('content', menuApp.load('menuDb', null, filterString));
}

function search() {
  searchInput.addEventListener('focus', function (e) {
    var filterString = searchInput.value.toString().toLowerCase();

    if (filterString === '') {
      menuApp.renderList('content', menuApp.load('menuDb', 9));
      return;
    }

    e.preventDefault();
    keyboardInit(e.target, false);
  });
  searchInput.addEventListener('input', function () {
    clearTimeout(delay);
    delay = setTimeout(renderSerchedData, 400);
  });
}

search();