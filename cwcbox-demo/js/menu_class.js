"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var menuApp = new function Menu() {
  //открытие файла меню.
  this.openJson = function (name) {
    try {
      var iStream = fso.OpenTextFile("resourses\\".concat(name, ".JSON"), 1, false);

      if (!iStream) {
        alert("ошибка открытия файла меню. Дальнейшая работа кассы невозможна" + "resourses\\".concat(name, ".JSON"));
        logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u043C\u0435\u043D\u044E: resourses\\".concat(name, ".JSON"));
        return;
      }

      var data = iStream.ReadLine(); // Usually looped for several lines

      iStream.Close();
      return data;
    } catch (error) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0438 \u0444\u0430\u0439\u043B\u044B \u043C\u0435\u043D\u044E".concat(error.message));
    }
  }; // перезапись меню, вызывается если пришел ответ с сервера с массивом меню


  this.writeJson = function (name, content) {
    if (!content) {
      logger('Пришло пустое меню');
      return;
    }

    try {
      var iStream = fso.OpenTextFile("resourses\\".concat(name, ".JSON"), 2, true);

      if (!iStream) {
        alert("Can't open file" + "resourses\\".concat(name, ".JSON"));
        return;
      }

      iStream.WriteLine(content);
      iStream.Close();
      carrentArray = []; //обнуление глобального массива
    } catch (error) {
      logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 writeJson ".concat(error.message));
    }
  }; //подгрузка массива


  this.load = function (fileName, filterByParent, filterByName) {
    try {
      //если глобальный массив существует возвращаем массив меню
      if (carrentArray.length > 0) {
        if (filterByName) {
          var _data2 = carrentArray.filter(function (el) {
            return el.name.toString().toLowerCase().includes(filterByName) && (el.type === 'product' || el.type === 'promotion');
          });

          return _data2;
        }

        var _data = carrentArray.filter(function (el) {
          return el.parent === filterByParent;
        });

        return _data;
      } // открытие меню из файла


      var mdata = this.openJson(fileName);
      var jsn = JSON.parse(mdata);
      var menu = jsn.data;
      carrentArray = menu || []; //присваивание к глобальной переменной меню

      scannerObg = {}; // обновление массива меню для сканера
      // коррекция меню от лишних символов

      if (carrentArray.length > 0) {
        carrentArray.forEach(function (e) {
          e.name = e.name.split('\t').join(''); //очитска меню по \t

          e.name = e.name.split('\n').join(''); //очитска меню по \n

          e.name = e.name.split('"').join(''); //очитска меню по "

          e.name = e.name.split('\\').join('/'); //очитска меню по /
        });
      } //создание объекта меню для сканера


      if (carrentArray.length > 0) {
        carrentArray.forEach(function (e) {
          try {
            if (e.cards) {
              if (e.cards[0].code) {
                e.cards.forEach(function (j) {
                  var id = j.id;
                  var name = e.name;
                  var parent = e.parent;
                  var product = j.product;
                  var subname = j.subname;
                  var weighted = j.weighted;
                  var bulk_value = j.bulk_value;
                  var bulk_untils = j.bulk_untils;
                  var cashback_percent = j.cashback_percent;
                  var price = j.price;
                  scannerObg["".concat(j.code)] = {
                    id: id,
                    name: name,
                    parent: parent,
                    product: product,
                    subname: subname,
                    weighted: weighted,
                    bulk_value: bulk_value,
                    bulk_untils: bulk_untils,
                    cashback_percent: cashback_percent,
                    price: price
                  };
                });
              }
            }
          } catch (e) {
            logger('Ошибка в load' + e.message);
          }
        });
      } // поиск по значению импута поиска


      if (filterByName) {
        var _data3 = menu.filter(function (el) {
          return el.name.toString().toLowerCase().includes(filterByName) && (el.type === 'product' || el.type === 'promotion');
        });

        return _data3;
      } // фильтр по родителю для отрисовки товаров и подкатегорий


      var data = menu.filter(function (el) {
        return el.parent === filterByParent;
      }) || [];
      var dataCategory = menu.filter(function (el) {
        return el.type === 'category';
      });

      if (dataCategory.length > 0) {
        dataCategory.forEach(function (element) {
          // создание массивоподобного объета для отрисовки категорий
          if (!allCategoryList.hasOwnProperty("".concat(element.id))) {
            allCategoryList["".concat(element.id)] = element.name;
          }
        });
      }

      if (!data && !filterByName) {
        logger('Пустое меню в load');
      }

      return data || [];
    } catch (error) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043C\u0435\u043D\u044E ".concat(error.message));
    }
  }; // универсальная функция отрисовки меню


  this.renderList = function (selector, data) {
    var _this = this;

    if (!data) {
      var message = JSON.stringify(data);
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043C\u0435\u043D\u044E \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u043D\u044E: ".concat(message));
      return;
    } else {
      try {
        if (data.length <= 0) {
          return;
        }
      } catch (error) {
        return;
      }
    }

    var root = document.querySelector(".".concat(selector));

    if (!root) {
      popup("\u043A\u043E\u0440\u043D\u0435\u0432\u043E\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u043F\u043E \u0441\u0435\u043B\u0435\u043A\u0442\u043E\u0440\u0443 ".concat(selector, " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"));
      return;
    }

    var itemList = root.querySelector(".".concat(selector, "__list"));
    itemList.innerHTML = ''; //очистка меню
    // отрисовка слайдера категорий и меню по кнопке все категории

    if (selector === 'category' || selector === 'allCategory') {
      data.unshift({
        name: 'Популярное',
        id: 'popular'
      });
      data.forEach(function (element) {
        var newItem = el('button', "".concat(selector, "__item btn"), "".concat(element.name), {
          id: "".concat(selector).concat(element.id)
        });

        if (element.id == 1 || element.name == 'Кофейное меню' || element.id === 'popular') {
          newItem.classList.add("".concat(selector, "__item_first"));
        } // событие отрисовки товаров из категории в интерфейс


        newItem.addEventListener('click', function () {
          if (selector === 'allCategory') {
            document.getElementById('burger').click();
          }

          if (element.id === 'popular') {
            menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
          } else {
            menuApp.renderList('content', menuApp.load('menuDb', element.id));
          }
        });
        itemList.appendChild(newItem);
      });
      return;
    } // отрисовка каточек в интерфейс


    if (selector === 'content') {
      data.forEach(function (element) {
        //отрисовка в интерфейс подкатегории
        if (element.type === 'category') {
          var newItem = el('div', "".concat(selector, "__item"), [el('button', "".concat(selector, "__title btn"), "".concat(element.name))], {
            id: "subCategory-".concat(element.id)
          });
          newItem.addEventListener('click', function (e) {
            interfaceApp.focusReset(); //сброс фокуса

            menuApp.renderList('content', menuApp.load('menuDb', element.id));
          });
          itemList.appendChild(newItem);
        } // отрисовка в интерфейс товара


        if (element.type === 'product' || element.type === 'promotion') {
          var buttonsWrapper = el('div', "".concat(selector, "__box-unit"));

          var _newItem = el('div', "".concat(selector, "__item"), [el('button', "".concat(selector, "__title btn"), "".concat(element.name)), buttonsWrapper], {
            id: "product-".concat(element.id)
          }); // если это техкарта в категории акци


          if (element.hasOwnProperty('products')) {
            if (!element.enable) return;
            element.products.forEach(function (card, i) {
              if (i > 0) return;
              var newItemButton = el('button', "".concat(selector, "__unit btn btn_hover"), [el('div', "".concat(selector, "__unit-value"), "".concat(element.price).concat(currency)), el('div', "".concat(selector, "__unit-price"), "")]);
              newItemButton.addEventListener('click', function (e) {
                interfaceApp.focusReset(); //сброс фокуса

                if (card.weighted) {
                  card.name = element.name;
                  card.parent = element.parent;

                  try {
                    interfaceApp.weigher(card);
                  } catch (error) {
                    alert(error.message);
                  }

                  return;
                }

                var amount = 1;
                var maxSale = 1; //запись в базу данных и в глобальный объект товара

                entry.product(Number(element.id), element.name, card.bulk_value || 1, card.bulk_untils || 'шт', Number(element.price), Number(amount), 0, Number(element.parent), maxSale);
              });
              buttonsWrapper.appendChild(newItemButton);
            });
            itemList.appendChild(_newItem);
            return;
          }

          element.cards.forEach(function (card) {
            var newItemButton = el('button', "".concat(selector, "__unit btn btn_hover"), [el('div', "".concat(selector, "__unit-value"), "".concat(card.bulk_value, " ").concat(card.bulk_untils)), el('div', "".concat(selector, "__unit-price"), "".concat(card.price).concat(currency))]);
            newItemButton.addEventListener('click', function (e) {
              interfaceApp.focusReset();

              if (card.weighted) {
                card.name = element.name;
                card.parent = element.parent;

                try {
                  interfaceApp.weigher(card);
                } catch (error) {
                  alert(error.message);
                }

                return;
              }

              var amount = 1; // На какой тех карте отобразится экран выбора сиропа

              if ((element.id == 186 || element.id == 187 || element.id == 13 || element.id == 1438) && useToppingMenu == 1) {
                _this.toppingSelect({
                  element: element,
                  card: card
                });

                return;
              }

              entry.product(Number(card.id), element.name, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(element.parent));
            });
            buttonsWrapper.appendChild(newItemButton);
          });
          itemList.appendChild(_newItem);
        }
      });
    }
  }; // меню по айдишникам


  this.loadById = function (fileName, arrId) {
    try {
      //если глобальный массив существует возвращаем массив меню
      if (carrentArray.length > 0) {
        popCarrentArray = carrentArray;
        return popCarrentArray.filter(function (el) {
          return arrId.indexOf("".concat(el.id)) != '-1' && (el.type === 'product' || el.type === 'promotion');
        });
      } // открытие меню из файла


      var mdata = this.openJson(fileName);
      var jsn = JSON.parse(mdata);
      var menu = jsn.data;
      popCarrentArray = menu || []; //присваивание к глобальной переменной меню
      // коррекция меню от лишних символов

      popCarrentArray = popCarrentArray.filter(function (el) {
        return arrId.indexOf("".concat(el.id)) != '-1' && (el.type === 'product' || el.type === 'promotion');
      });

      if (popCarrentArray.length > 0) {
        popCarrentArray.forEach(function (e) {
          e.name = e.name.split('\t').join(''); //очитска меню по \t

          e.name = e.name.split('\n').join(''); //очитска меню по \n

          e.name = e.name.split('"').join(''); //очитска меню по "

          e.name = e.name.split('\\').join('/'); //очитска меню по /
        });
      }

      return popCarrentArray || [];
    } catch (error) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043C\u0435\u043D\u044E \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0445 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 ".concat(error.message));
    }
  };

  this.toppingSelect = function (param) {
    var card = param.card;
    var element = param.element;
    var amount = 1;
    var productArray = [];
    var type = element.id == 187 ? 1 : 0;
    var menuType = type == 1 ? 'топпинга' : 'сиропа';

    try {
      var addNewLi = function addNewLi(product) {
        var newLi = el('li', "".concat(clasName, "__item"), [product.name, el('div', "".concat(clasName, "__delete-wrapper"), el('button', "".concat(clasName, "__delete-item"), 'X'))]);
        newLi.querySelector(".".concat(clasName, "__delete-item")).addEventListener('click', function (e) {
          e.preventDefault();
          e.target.closest(".".concat(clasName, "__item")).remove();
          var q = "DELETE FROM toppinglist WHERE name = '".concat(product.name, "'");

          try {
            db.query(q);
          } catch (error) {
            db.conn.close();
            popup('Ошибка при добавлении добавки' + error.message);
            logger('Ошибка при добавлении добавки' + error.message);
          }
        });
        newLi.addEventListener('click', function (e) {
          e.preventDefault();

          if (!!e.target.closest(".".concat(clasName, "__delete-wrapper"))) {
            return;
          }

          var newName = element.name + ': ' + product.name;
          popup(product.name);
          entry.product(Number(card.id), newName, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(element.parent));
          preloader.preloaderOff();
        });
        return newLi;
      };

      var root = document.querySelector(".body");
      var clasName = 'topping-select';

      try {
        var resp = db.query("SELECT id, name FROM toppinglist WHERE type = ".concat(type));
        Object.entries(resp).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              value = _ref2[1];

          productArray.push(value);
        });
      } catch (error) {
        db.conn.close();
        popup('Ошибка в получении меню сиропов/топпинга' + error.message);
        logger('Ошибка в получении меню сиропов/топпинга' + error.message);
      }

      productArray.sort(function (a, b) {
        return b - a;
      });
      var productList = productArray.map(function (product) {
        return addNewLi(product);
      });
      var newPreloader = el('div', 'preloader', [el('div', "preloader__content ".concat(clasName), [el('h2', "".concat(clasName, "__title"), "\u041C\u0435\u043D\u044E \u0432\u044B\u0431\u043E\u0440\u0430 ".concat(menuType)), el('div', "".concat(clasName, "__list-wrap scrollbar"), el('ul', "".concat(clasName, "__list"), productList)), el('div', "".concat(clasName, "__btn-group"), [el('lable', "".concat(clasName, "__lable ").concat(clasName, "__btn_add"), [el('input', "".concat(clasName, "__input"), '', {
        placeholder: 'Введите наименование'
      }), el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_confirm btn"), 'Создать+'), el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_delete btn"), 'Удалить-')]), el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_cancel btn"), 'Отменить')]), el('div', "".concat(clasName, "__scroll-btn ").concat(clasName, "__scroll-btn_up btn btn_nav btn_nav-up"), ''), el('div', "".concat(clasName, "__scroll-btn ").concat(clasName, "__scroll-btn_down btn btn_nav btn_nav-down"), '')])]);
      newPreloader.querySelector(".btn_nav-up").innerHTML = "<svg width=\"58\" height=\"58\" viewBox=\"0 0 58 58\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path d=\"M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z\" stroke=\"white\" stroke-width=\"2\"/>\n        <path d=\"M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z\" fill=\"currentColor\"/>\n        </svg>";
      newPreloader.querySelector(".btn_nav-down").innerHTML = " <svg width=\"58\" height=\"58\" viewBox=\"0 0 58 58\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z\" stroke=\"white\" stroke-width=\"2\"/>\n      <path d=\"M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z\" fill=\"currentColor\"/>\n      </svg>";
      newPreloader.querySelector(".".concat(clasName, "__btn_cancel")).addEventListener('click', function (e) {
        e.preventDefault();
        preloader.preloaderOff();
      });
      var nodeList = newPreloader.querySelector(".".concat(clasName, "__list"));
      newPreloader.querySelector(".".concat(clasName, "__btn_confirm")).addEventListener('click', function (e) {
        e.preventDefault();
        var newItem = newPreloader.querySelector(".".concat(clasName, "__input")).value;

        if (newItem.length <= 2) {
          return;
        }

        newPreloader.querySelector(".".concat(clasName, "__input")).value = '';
        nodeList.insertBefore(addNewLi({
          name: newItem
        }), nodeList.firstChild);
        var q = "INSERT into toppinglist (name, type) values ('".concat(newItem, "',").concat(type, ")");

        try {
          db.query(q);
        } catch (error) {
          db.conn.close();
          popup('Ошибка при добавлении добавки' + error.message);
          logger('Ошибка при добавлении добавки' + error.message);
        }
      });
      newPreloader.querySelector(".".concat(clasName, "__btn_delete")).addEventListener('click', function (e) {
        nodeList.classList.toggle("".concat(clasName, "__list_delete"));
      });
      newPreloader.addEventListener('click', function (e) {
        if (!e.target.closest('.preloader__content') && !e.target.closest(".".concat(clasName, "__delete-wrapper"))) {
          preloader.preloaderOff();
        }
      });
      root.appendChild(newPreloader);
      new SimpleBar(newPreloader.querySelector(".scrollbar"), {
        scrollbarMaxSize: 100,
        autoHide: true,
        clickOnTrack: false
      });
      interfaceApp.scrollFuncVert(".".concat(clasName), 38);
    } catch (error) {
      popup('Ошибка при отрисовке меню добавок' + error.message);
      logger('Ошибка при отрисовке меню добавок' + error.message);
    }
  };
}();