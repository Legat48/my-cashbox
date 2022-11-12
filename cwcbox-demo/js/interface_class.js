"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var interfaceApp = new function Interface() {
  // сброс фокуса
  this.focusReset = function () {
    var blurElement = document.querySelector('.blurElement');
    blurElement.focus();
  }; //кастомный выпадающий список


  this.dropdown = function () {
    // функция обработчик всех дропдаунов
    // массив кнопок
    var dropdownBtnAll = document.querySelectorAll('.dropdown__btn_target');
    var dropdownBtn = Array.prototype.slice.call(dropdownBtnAll); // делает привычный массив из нодлиста
    //массив контейнеров дропдаунов

    var dropdownBoxAll = document.querySelectorAll('.dropdown-content-box');
    var dropdownBoxArr = Array.prototype.slice.call(dropdownBoxAll); //массив иконок

    var iconSpanAll = document.querySelectorAll('.dropdown__icon');
    var iconSpanArr = Array.prototype.slice.call(iconSpanAll); // проходим по всем кнопкам

    dropdownBtn.forEach(function (btn) {
      // все иконки на экране (нужно что бы переворачивать)
      var iconSpan = btn.querySelector('.dropdown__icon');
      btn.addEventListener('click', function () {
        var path = btn.dataset.dropdown; // console.log(btn.dataset.test)

        var dropdownBox = document.querySelector("[data-dropdown-box=\"".concat(path, "\"]")); // закрываем все списки и переключаем нажатый

        dropdownBoxArr.forEach(function (el) {
          if (dropdownBox !== el) {
            el.classList.remove('active');
          }
        }); // переворачиваем стрелочку при клике

        iconSpanArr.forEach(function (j) {
          if (iconSpan !== j) {
            j.classList.remove('dropdown__icon_active');
          }
        }); // переворачиваем все стрелочки

        console.log(dropdownBox);

        if (iconSpan) {
          iconSpan.classList.toggle('dropdown__icon_active');
        } // закрываем при нажатии вне дропдауна


        dropdownBox.classList.toggle('active');
      });
    }); // открытие и закрытие на клик дропдауна

    document.addEventListener('click', function (i) {
      if (!i.target.closest('.dropdown-content-box') && !i.target.closest('.dropdown__btn')) {
        iconSpanArr.forEach(function (j) {
          j.classList.remove('dropdown__icon_active');
        });
        dropdownBoxArr.forEach(function (el) {
          el.classList.remove('active');
        });
      }
    });
  }; // Работа бургера на появление и уход меню


  this.burger = function () {
    // анимация menu
    var burgerBtn = document.querySelector('.burger');
    var menu = document.querySelector('.header__menu');
    var substrate = document.querySelector('.substrate');

    function menuAnim() {
      // переключение бургера
      burgerBtn.classList.toggle('burger--active'); // появление и уход меню навигации

      if (burgerBtn.classList.contains('burger--active')) {
        substrate.style.display = 'block';
        menu.classList.add('menu_anim');
        menu.classList.add('menu_active'); // вызываем функцию которая берет информацию по чекам за текущую смену из базы данных(общую сумму если включен атол берем из атолла)

        interfaceApp.getWorkDayInfo();
      } else if (!burgerBtn.classList.contains('burger--active')) {
        //скрытие бургера
        substrate.style.display = 'none';
        menu.classList.remove('menu_anim');
        menu.classList.add('menu_anim-re'); //таймаут для анимации

        setTimeout(function () {
          menu.classList.remove('setting');
          menu.classList.remove('menu_anim-re');
          menu.classList.remove('menu_active');
          var categoryList = document.querySelector('.allCategory__list');
          if (categoryList) menu.removeChild(categoryList);
          menu.classList.remove('allCategory');
          menu.classList.remove('formed-orders');
        }, 550);
      }
    } //клик на открытие меню


    burgerBtn.addEventListener('click', menuAnim); //substrate-поле подменю(подложка) При клике на нео-скрытие бургера

    substrate.addEventListener('click', function () {
      if (document.querySelector('.burger').classList.contains('burger--active')) {
        menuAnim();
      }
    });
  }; // вызов отрисовки информации по чекам


  this.formedOrders = function () {
    var _this = this;

    var formedOrdersBtn = document.querySelector('#formedOrdersBtn'); //кнопка "Чеки"

    var formedOrdersRoot = document.querySelector('.header__menu'); //общая информация по чекам
    //открытие интерфейса с таблицами по чекам

    formedOrdersBtn.addEventListener('click', function () {
      preloader.preloader('body');
      formedOrdersRoot.classList.add('formed-orders');
      var btnDayNext = document.querySelector('.formed-orders__navbar-btn_next');
      btnDayNext.setAttribute('disabled', 'disabled');
      dateStrGlobalTemp = dateStrGlobal;

      _this.renderOrderByDay(dateStrGlobal, orderRenderLimit); // отрисовка чеков по дню


      interfaceApp.scrollFuncVert('.formed-orders__card-box_all', 35);
      interfaceApp.scrollFuncVert('.formed-orders__card-box_returned', 35); // скроллбар для товаров которые пробились(интерфейс чеков)

      interfaceApp.scrollFuncVert('.formed-orders__card-box_productList', 35); // скроллбар для категорий которые пробились(интерфейс чеков)

      interfaceApp.scrollFuncVert('.formed-orders__card-box_productListCategory', 35);
    }); //скрытие интерфейса с чеками

    formedOrdersRoot.addEventListener('click', function (e) {
      if (!e.target.closest('.formed-orders__box') && !e.target.matches('.formedOrdersBtn')) {
        formedOrdersRoot.classList.remove('formed-orders');
      }
    }); // навигация внутри интерфейса чеков

    var navBtnList = document.querySelectorAll('.formed-orders__navbar-link'); // массив кнопок навигации

    navBtnList.forEach(function (navBtn) {
      // переключение между вкладками в интерфейсе чеков
      navBtn.addEventListener('click', function (event) {
        event.preventDefault();

        if (!event.currentTarget.matches('.formed-orders__navbar-link_active')) {
          navBtnList.forEach(function (navBtn) {
            navBtn.classList.remove('formed-orders__navbar-link_active');
          });
          event.currentTarget.classList.add('formed-orders__navbar-link_active');
          var tabList = document.querySelectorAll('.formed-orders__tab-item');
          tabList.forEach(function (tabListItem) {
            tabListItem.classList.remove('formed-orders__tab-item_active');
          });
          var target = event.currentTarget.dataset.navtabkey;
          document.querySelector("[data-navtab=\"".concat(target, "\"]")).classList.add('formed-orders__tab-item_active');
        }
      });
    });
  };

  this.renderOrderByDay = function (day, limit) {
    var orderListIncome = [],
        orderItemList = {},
        ordersListRefaund = [];
    var limitStr = limit ? " limit ".concat(limit) : ''; // получение чеков из бд

    try {
      var resp = db.query("SELECT id, chtype, orderSumFinal, date, time, chtype, orderSumFinal, status, workdayId FROM orders WHERE date = '".concat(day, "' and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ") order by id desc").concat(limitStr));
      var respItem = db.query("SELECT name, amount, idOrder FROM orderItem WHERE idOrder in (SELECT id FROM orders WHERE date = '".concat(day, "' and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, "))"));
      Object.entries(resp).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        if ([1, 2, 3].indexOf(Number(value.status)) !== -1) {
          orderListIncome.unshift(value);
        } else {
          ordersListRefaund.unshift(value);
        }
      });
      Object.entries(respItem).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];

        if (orderItemList.hasOwnProperty("".concat(value["idOrder"]))) {
          orderItemList["".concat(value["idOrder"])].push({
            name: value["name"],
            amount: value["amount"]
          });
        } else {
          orderItemList["".concat(value["idOrder"])] = [{
            name: value["name"],
            amount: value["amount"]
          }];
        }
      });
    } catch (error) {
      try {
        db.conn.close();
      } catch (error) {}

      orderListIncome = [];
      ordersListRefaund = [];
    }

    renderOrderList('formed-orders__card-box', orderListIncome, orderItemList); //отрисовка чеков

    renderOrderList('formed-orders__card-box_returned', ordersListRefaund, orderItemList); //отрисовка чеков возврата

    renderOrderList('formed-orders__box'); // отрисовка  товаров и категорий в таблицу
    // создание таблицы

    function createTableHystoryOrder(root, category) {
      var tableCategory = category ? category : '',
          caption = '';

      if (category) {
        caption = el('caption', 'table__caption', [el('span', 'table__caption-name', "".concat(allCategoryList["".concat(tableCategory)], ": ")), el('span', 'table__caption-sum', [el('span', 'table__caption-sum-numb', ""), el('span', 'table__caption-sum-currency', " ".concat(currency))])]);
      }

      root.appendChild(el('table', 'table__table', [caption, el('thead', 'table__head', el('tr', '', [el('th', 'table__th', el('span', 'table__th-content', el('span', 'table__text', 'Позиция')), {
        'data-col': "table__name",
        'data-head': ''
      }), el('th', 'table__th', el('span', 'table__th-content', el('span', 'table__text', 'Цена')), {
        'data-col': "table__price",
        'data-head': ''
      }), el('th', 'table__th', el('span', 'table__th-content', el('span', 'table__text', 'Кол-во')), {
        'data-col': "table__amount",
        'data-head': ''
      }), el('th', 'table__th', el('span', 'table__th-content', el('span', 'table__text', ' Итого(С учетом бонусов и  скидок)')), {
        'data-col': "table__productSum",
        'data-head': ''
      })])), el('tbody', 'table__body', '')], {
        style: "border-spacing: 0px;border-collapse:collapse;",
        'data-category': "".concat(tableCategory)
      }));
    } // отрисовка строк


    function addRowForTable(element, root) {
      var row = root.querySelector("[data-techcard=\"".concat(element.idProd, "\"]"));

      if (row) {
        var counterDisplay = row.querySelector("[data-col=\"table__amount\"]");
        counterDisplay.textContent = Number(counterDisplay.textContent) + 1;
        var sumDisplay = row.querySelector("[data-col=\"table__productSum\"]");
        sumDisplay.textContent = Number(counterDisplay.textContent) * element.priceFinal;
        return;
      }

      var colArray = root.querySelectorAll("[data-head]");
      var tdList = []; //колонки в строке

      colArray.forEach(function (item) {
        var propName = item.dataset.col.split('__')[1];

        if (propName === 'name') {
          var newTd = el('td', '', [el('span', 'table__td-content', [el('span', 'table__text', "".concat(element["".concat(propName)], ": ").concat(element.bulkvalue).concat(element.bulkuntils))])], {
            'data-col': "".concat(item.dataset.col)
          });
          tdList.push(newTd);
        } else {
          var _newTd = el('td', '', [el('span', 'table__td-content', [el('span', 'table__text', "".concat(element["".concat(propName)]))])], {
            'data-col': "".concat(item.dataset.col)
          });

          tdList.push(_newTd);
        }
      });
      var newRow = el('tr', '', tdList, {
        'data-techcard': "".concat(element.idProd)
      });
      root.appendChild(newRow);
    } //отрисовка таблицы с продуктами


    function renderTableProduct(rootElement, rowArray) {
      var root = rootElement;
      var rowList = rowArray;

      try {
        rowList.forEach(function (element) {
          var itemListContainer = root.querySelector('.formed-orders__card-box_productList .table');
          var itemByCategoryContainer = root.querySelector('.formed-orders__card-box_productListCategory .table');
          var tableBody = itemByCategoryContainer.querySelector("[data-category=\"".concat(element.productCategory, "\"]"));
          var ItemListTable = itemListContainer.querySelector("table");

          if (!ItemListTable) {
            createTableHystoryOrder(itemListContainer);
            ItemListTable = itemListContainer.querySelector("table");
          }

          addRowForTable(element, ItemListTable);

          if (!tableBody) {
            createTableHystoryOrder(itemByCategoryContainer, element.productCategory);
            tableBody = itemByCategoryContainer.querySelector("[data-category=\"".concat(element.productCategory, "\"]"));
          }

          addRowForTable(element, tableBody);
          var categorySumCDisplay = itemByCategoryContainer.querySelector("[data-category=\"".concat(element.productCategory, "\"] .table__caption-sum-numb"));
          categorySumCDisplay.textContent = Number(categorySumCDisplay.textContent) + Number(element.priceFinal);
        });
      } catch (error) {
        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u043A\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0447\u0435\u043A\u043E\u0432 ".concat(error.message));
      }
    } //отрисовка продукта в чеке


    function renderOrderItem(rootSelector, selector, order) {
      var root = rootSelector;
      var cardList = [];
      order.cards.forEach(function (cardItem) {
        cardItem.amount = Number.isInteger(Number(cardItem.amount)) ? "".concat(cardItem.amount, "\u0448\u0442") : "".concat(cardItem.amount, "\u043A\u0433");
        var item = el('div', "".concat(selector, "__item"), [el('div', "".concat(selector, "__item-text"), "".concat(cardItem.name)), el('div', "".concat(selector, "__item-value"), "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: ".concat(cardItem.amount))]);
        cardList.push(item);
      }); //коррекция даты

      var x = order.time.split(':');
      var y = [];
      x.forEach(function (i) {
        y.push(i.length > 1 ? i : "0".concat(i));
      });
      order.time = y.join(':');
      var cardContent = el('div', "".concat(selector, "__card-content"), cardList);
      var statusСhtype = 'Без-нал расчет';

      if (order.chtype == 0) {
        statusСhtype = 'Наличный расчет';
      }

      if (order.chtype == 2) {
        statusСhtype = 'QRкод/NewPay';
      }

      var refaundBtnGroup = [1, 2, 3].indexOf(Number(order.status)) !== -1 && dateStrGlobal == dateStrGlobalTemp ? el('div', "".concat(selector, "__btn-group"), [el('button', "".concat(selector, "__btn ").concat(selector, "__btn_refaund btn"), "\u0412\u043E\u0437\u0432\u0440\u0430\u0442", {
        'data-value': "".concat(order.id),
        'data-chtype': "".concat(order.chtype)
      })]) : el('div', "".concat(selector, "__btn-group"), []);

      if (order.status == -1 && order.chtype != 0) {
        refaundBtnGroup.appendChild(el('button', "".concat(selector, "__btn ").concat(selector, "__btn_refaund ").concat(selector, "__btn_refaund_print btn"), "\u041D\u0430 \u043F\u0435\u0447\u0430\u0442\u044C", {
          'data-value': "".concat(order.id),
          'data-chtype': "".concat(order.chtype)
        }));
        refaundBtnGroup.querySelector("".concat(selector, "__btn_refaund_print")).addEventListener('click', function (e) {
          logger("\u041D\u0430\u0436\u0430\u0442\u0430 \u043A\u043D\u043E\u043F\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u043D\u0430 \u043F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430, \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 ".concat(e.target.dataset.value));

          if (useAtol === 1 && !troubleAtol) {
            // если используется атол
            var _order = subfunc.getOrderObg(7, Number(e.target.dataset.value));

            var productArr = subfunc.getProductArr(_order);

            if (devkkm.printReturtOrder(_order, productArr)) {
              popup("\u0427\u0435\u043A ".concat(_order.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
            } else {
              popup("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            }
          } else if (!useAtol) {
            var _order2 = subfunc.getOrderObg(7, Number(e.target.dataset.value));

            var _productArr = subfunc.getProductArr(_order2);

            var q = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(_order2.id));
            refaundBtn.textContent = 'Отменен';
            refaundBtn.setAttribute("disabled", "disabled");

            try {
              db.query(q);
            } catch (e) {
              logger("\u0447\u0435\u043A ".concat(Number(_order2.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(_order2), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(_productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
              popup("\u0447\u0435\u043A ".concat(Number(_order2.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
            }
          }

          ;
        });
      }

      var wkdayId = order.workdayId === '' ? "" : "\u0421\u043C\u0435\u043D\u0430: ".concat(order.workdayId);
      var newItem = el('div', "".concat(selector, "__card"), [el('div', "".concat(selector, "__card-left"), [el('div', "".concat(selector, "__card-header"), [el('div', "".concat(selector, "__header-item"), "\u0427\u0435\u043A \u2116 ".concat(order.id)), el('div', "".concat(selector, "__header-item"), "\u0414\u0430\u0442\u0430: ".concat(order.date)), el('div', "".concat(selector, "__header-item"), "\u0412\u0440\u0435\u043C\u044F: ".concat(order.time)), el('div', "".concat(selector, "__header-item"), "".concat(wkdayId)), el('div', "".concat(selector, "__header-item"), "\u0421\u0443\u043C\u043C\u0430: ".concat(order.orderSumFinal, " ").concat(currency)), el('div', "".concat(selector, "__header-item"), "".concat(statusСhtype))]), cardContent]), refaundBtnGroup]);

      if (order.status === '1') {
        var status = el('div', "".concat(selector, "__header-item ").concat(selector, "__header-item_status"), 'Не пропечатан');
        newItem.querySelector(".".concat(selector, "__card-header")).appendChild(status);
        newItem.querySelector(".".concat(selector, "__btn_refaund")).textContent = 'Возврат не доступен';
        newItem.querySelector(".".concat(selector, "__btn_refaund")).setAttribute('disabled', 'disabled');
      } else {
        var _status = el('div', "".concat(selector, "__header-item"), "\u0421\u0442\u0430\u0442\u0443\u0441: ".concat(order.status));

        if (order.status == 3 || order.status == 5) {
          _status.classList.add("".concat(selector, "__header-item_status_green"));
        }

        if (order.status == 6) {
          _status.textContent = 'Ошибочный чек(обратитесь к разработчику)';

          _status.classList.add("".concat(selector, "__header-item_status"));
        }

        if (order.status === '2') {
          _status.textContent = 'Ожидает отправки на сервер';
        } else if (order.status === '3') {
          _status.textContent = 'Зафиксирован';
        } else if (order.status === '4') {
          _status.textContent = 'Ожидает фиксации';
        } else if (order.status === '5') {
          _status.textContent = 'Зафиксирован';
        } else if (order.status === '-1') {
          _status.textContent = 'Не пропечатан';
        } else if (order.status === '-2') {
          _status.textContent = 'Ожидает отправки на сервер';
        }

        newItem.querySelector(".".concat(selector, "__card-header")).appendChild(_status);
      } // кнопка возврата и алгоритм возврата чека


      var refaundBtn = newItem.querySelector(".".concat(selector, "__btn_refaund"));

      if (refaundBtn) {
        refaundBtn.addEventListener('click', function (e) {
          logger("\u041D\u0430\u0436\u0430\u0442\u0430 \u043A\u043D\u043E\u043F\u043A\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430, \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 ".concat(e.target.dataset.value));
          var order = subfunc.getOrderObg(7, Number(e.target.dataset.value));
          var productArr = subfunc.getProductArr(order);
          interfaceApp.orderRefund(order, productArr);
        });
      }

      root.insertBefore(newItem, root.firstChild);
    } // отрисовка чеков


    function renderOrderList(rootSelect, orderListArr, orderItemObj) {
      var root; // очистка окна

      if (rootSelect !== 'formed-orders__box') {
        root = document.querySelector(".".concat(rootSelect)).querySelector('.simplebar-content');
        root.innerHTML = '';
      } // отрисовка табличек


      if (rootSelect === 'formed-orders__box') {
        var q,
            _resp,
            itemList = [];

        q = "SELECT * FROM orderItem WHERE idOrder IN (SELECT id FROM orders WHERE date = '".concat(day, "' AND status IN (1,2,3) and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, "))");

        try {
          _resp = db.query(q);
          Object.entries(_resp).forEach(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                key = _ref6[0],
                value = _ref6[1];

            itemList.push(value);
          });
        } catch (error) {
          try {
            db.conn.close();
          } catch (error) {} // alert('ошибка запроса ' + error.message)


          itemList = [];
        }

        if (itemList.length > 0) {
          var itemListContainer = document.querySelector(".".concat(rootSelect)).querySelector('.formed-orders__card-box_productList .table');
          var itemByCategoryContainer = document.querySelector(".".concat(rootSelect)).querySelector('.formed-orders__card-box_productListCategory .table');
          itemListContainer.innerHTML = '';
          itemByCategoryContainer.innerHTML = '';
          renderTableProduct(document.querySelector(".".concat(rootSelect)), itemList);
        }

        return;
      } // отрисовка прихода за день


      try {
        // обработка массива чеков
        var renderOrder = function renderOrder(orderId, ordersArrIndex, orderArr) {
          var itemList = [];

          if (orderItemList["".concat(orderId.id)]) {
            itemList = orderItemList["".concat(orderId.id)];
          }

          var renderingOrder = {
            id: orderId.id,
            date: orderId.date,
            time: orderId.time,
            workdayId: "".concat(orderId.workdayId) === 'null' ? '' : orderId.workdayId,
            chtype: orderId.chtype,
            orderSumFinal: orderId.orderSumFinal,
            cards: itemList,
            status: orderId.status
          };

          if (ordersArrIndex == orderArr.length - 1) {
            preloader.preloaderOff();
          }

          renderOrderItem(root, 'formed-orders', renderingOrder);
        }; // отрисовка прочих чеков


        if (rootSelect === 'formed-orders__card-box_returned') {
          try {
            var _ordersArr = orderListArr;

            var _orderSumContainer = document.querySelector(".formed-orders__card-box_returned .formed-orders__orders-info");

            var _ordersSumDiv = _orderSumContainer.querySelector(".formed-orders__ordersSum");

            var _ordersSumCashDiv = _orderSumContainer.querySelector(".formed-orders__ordersSum_cash");

            var _ordersSumNoncashDiv = _orderSumContainer.querySelector(".formed-orders__ordersSum_noncash");

            _ordersSumDiv.textContent = "\u0421\u0443\u043C\u043C\u0430 \u0447\u0435\u043A\u043E\u0432: 0\xA0".concat(currency);
            _ordersSumCashDiv.textContent = "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442: 0\xA0".concat(currency);
            _ordersSumNoncashDiv.textContent = "\u0411\u0435\u0437-\u043D\u0430\u043B \u0440\u0430\u0441\u0447\u0451\u0442: 0\xA0".concat(currency);

            if (_ordersArr.length > 0) {
              _ordersArr.forEach(function (item, index, arr) {
                return renderOrder(item, index, arr);
              });

              _ordersSumDiv.textContent = "\u0421\u0443\u043C\u043C\u0430 \u0447\u0435\u043A\u043E\u0432: ".concat(ordersReturnSumStat, "\xA0").concat(currency);
              _ordersSumCashDiv.textContent = "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442: ".concat(ordersReturnSumCashStat, "\xA0").concat(currency);
              _ordersSumNoncashDiv.textContent = "\u0411\u0435\u0437-\u043D\u0430\u043B \u0440\u0430\u0441\u0447\u0451\u0442: ".concat(ordersReturnSumCashLessStat, "\xA0").concat(currency);
            } else {
              preloader.preloaderOff();
            }
          } catch (error) {
            popup('Ошибка в отрисовке чеков');
            logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u043A\u0435 \u0447\u0435\u043A\u043E\u0432 ".concat(error.message));
            preloader.preloaderOff();
          }

          return;
        }

        var ordersArr = orderListArr;
        var orderSumContainer = document.querySelector(".formed-orders__orders-info");
        var ordersSumDiv = orderSumContainer.querySelector(".formed-orders__ordersSum");
        var ordersSumCashDiv = orderSumContainer.querySelector(".formed-orders__ordersSum_cash");
        var ordersSumNoncashDiv = orderSumContainer.querySelector(".formed-orders__ordersSum_noncash");
        ordersSumDiv.textContent = "\u0421\u0443\u043C\u043C\u0430 \u0447\u0435\u043A\u043E\u0432: 0\xA0".concat(currency);
        ordersSumCashDiv.textContent = "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442: 0\xA0".concat(currency);
        ordersSumNoncashDiv.textContent = "\u0411\u0435\u0437-\u043D\u0430\u043B \u0440\u0430\u0441\u0447\u0451\u0442: 0\xA0".concat(currency);

        if (ordersArr.length > 0) {
          ordersArr.forEach(function (item, index, arr) {
            return renderOrder(item, index, arr);
          });
          ordersSumDiv.textContent = "\u0421\u0443\u043C\u043C\u0430 \u0447\u0435\u043A\u043E\u0432: ".concat(ordersSumStat, "\xA0").concat(currency);
          ordersSumCashDiv.textContent = "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442: ".concat(ordersSumCashStat, "\xA0").concat(currency);
          ordersSumNoncashDiv.textContent = "\u0411\u0435\u0437-\u043D\u0430\u043B \u0440\u0430\u0441\u0447\u0451\u0442: ".concat(ordersSumCashLessStat, "\xA0").concat(currency);
        } else {
          preloader.preloaderOff();
        }
      } catch (error) {
        popup('Ошибка в отрисовке чеков');
        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u043A\u0435 \u0447\u0435\u043A\u043E\u0432 ".concat(error.message));
        preloader.preloaderOff();
      }
    }
  }; // Скроллбары
  // первым передаем класс скролла вторым расстояние прохождения


  this.scrollFuncVert = function (scrollBox) {
    var oneClick = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    // принимаем контейнер конкретного скролла
    var scrollWrapper = document.querySelector(scrollBox);
    var scrollInterval;
    /*скролл на 1px вниз за 10 милисек*/

    var wrap = scrollWrapper.querySelector('.simplebar-content-wrapper');
    var btnUp = scrollWrapper.querySelector('.btn_nav-up');
    var btnDown = scrollWrapper.querySelector('.btn_nav-down'); // функция скролла вверх

    function scrollUpFunc() {
      var scrollUp = function scrollUp() {
        wrap.scrollTop = wrap.scrollTop - oneClick;
      };

      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollUp, 10);
      setTimeout(function () {
        clearInterval(scrollInterval);
      }, 200);
    } // функция скролла вниз


    function scrollDownFunc() {
      var scrollDown = function scrollDown() {
        wrap.scrollTop = wrap.scrollTop + oneClick;
      };

      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollDown, 10);
      setTimeout(function () {
        clearInterval(scrollInterval);
      }, 200);
    }

    btnDown.addEventListener('click', function () {
      scrollDownFunc();
    });
    btnUp.addEventListener('click', function () {
      scrollUpFunc();
    });
  };

  this.scrollFuncHoryz = function (scrollBox) {
    var oneClick = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    // принимаем контейнер конкретного скролла
    var scrollWrapper = document.querySelector(scrollBox);
    var scrollInterval;
    /*скролл на 1px вниз за 10 милисек*/

    var wrap = scrollWrapper.querySelector('.simplebar-content-wrapper');
    var btnLeft = scrollWrapper.querySelector('.btn_nav-left');
    var btnRight = scrollWrapper.querySelector('.btn_nav-right'); // функция скролла лево

    function scrollLeftFunc() {
      var scrollLeftFunc = function scrollLeftFunc() {
        wrap.scrollLeft += oneClick;
      };

      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollLeftFunc, 8);
      setTimeout(function () {
        clearInterval(scrollInterval);
      }, 160);
    } // функция скролла право


    function scrollRigthFunc() {
      var scrollRigthFunc = function scrollRigthFunc() {
        wrap.scrollLeft -= oneClick;
      };

      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollRigthFunc, 10);
      setTimeout(function () {
        clearInterval(scrollInterval);
      }, 200);
    }

    btnLeft.addEventListener('click', function () {
      scrollLeftFunc();
    });
    btnRight.addEventListener('click', function () {
      scrollRigthFunc();
    });
  }; // ВСЕ ПО СЧЕТЧИКУ СДАЧИ


  this.surrender = function () {
    // обработчик счетчика сдачи
    function counterSurrender() {
      valueSurrender = valueStock - orderSumFinal;
      outputValueSurrenderArr.forEach(function (j) {
        if (valueSurrender > 0) {
          j.textContent = 'Сдача: ' + valueSurrender;
        } else {
          j.textContent = 'Сдача: ';
        }
      });
    } // счетчик введенных наличных


    function counterStock() {
      outputValueStockArr.forEach(function (j) {
        j.textContent = 'Получено: ';
      });
      btnDenominationArr.forEach(function (btnDenomination) {
        btnDenomination.addEventListener('click', function () {
          valueStock = Number("".concat(valueStock).concat(btnDenomination.textContent.trim()));
          outputValueStockArr.forEach(function (j) {
            j.textContent = 'Получено: ' + valueStock;
          });
          counterSurrender();
        });
      });
    } // очистка введенных наличных


    function clearStock() {
      btnClear.addEventListener('click', function () {
        outputValueStockArr.forEach(function (j) {
          j.textContent = 'Получено: ';
        });
        valueStock = 0;
        valueSurrender = 0;
        counterSurrender();
      });
      var btnDel = document.querySelector('.surrender__btn_del');
      btnDel.addEventListener('click', function () {
        valueStock = Number("".concat(valueStock).slice(0, -1));
        outputValueStockArr.forEach(function (j) {
          j.textContent = "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: ".concat(valueStock);
        });
        counterSurrender();
      });
    }

    ; // обработчик кнопки наличных

    function btnCashFunc() {
      if (surrenderWrap.classList.contains('surrender_deactiv')) {
        if (writeOffGlobal) {
          btnCash.textContent = 'Списание';
        } else {
          btnCash.textContent = 'Наличные';
        }

        btnCash.classList.remove('ready-payment');
        outputValueSurrenderArr.forEach(function (e) {
          e.style.opacity = 0;
        });
        outputValueStockArr.forEach(function (e) {
          e.style.opacity = 0;
        });
      } else {
        btnCash.textContent = 'Оплатить';
        btnCash.classList.add('ready-payment');
        /* это нужно для закрытия чека */

        outputValueSurrenderArr.forEach(function (e) {
          e.style.opacity = 1;
        });
        outputValueStockArr.forEach(function (e) {
          e.style.opacity = 1;
        });
      }
    } // вызов функций


    btnCashFunc();
    clearStock();
    counterSurrender();
    counterStock(); // проявление счетчика скидки

    btnCash.addEventListener('click', function () {
      surrenderWrap.classList.toggle('surrender_deactiv');
      btnCashFunc();
    }); // скрытие счетчика

    document.addEventListener('click', function (i) {
      if (!i.target.closest('.surrender') && !i.target.closest('.interaction__btn_cash')) {
        surrenderWrap.classList.add('surrender_deactiv');
        btnCashFunc();
      }

      counterSurrender();
    });
  }; //кнопка "все категории"


  this.btnAllCategory = function () {
    var btn = document.querySelector('#all-category');
    var root = document.querySelector('.header__menu');
    btn.addEventListener('click', function () {
      // отрисовка заного все кнопок
      var allCategoryList = el('div', "allCategory__list");
      root.appendChild(allCategoryList);
      root.classList.add('allCategory');
      menuApp.renderList('allCategory', menuApp.load('menuDb', null)); // открытие бургера

      document.getElementById('burger').click();
    });
  }; // отрисовка окна добавления в чек весового товара
  // card - техкарта из массива меню


  this.weigher = function (card) {
    //общий класс для карточки
    var weigher = 'weigher'; // обработка кнопки в окне добавления

    var weigherSubmit = function weigherSubmit(e) {
      e.preventDefault();
      var amount = document.querySelector(".".concat(weigher, "__input")).value / 1000;
      document.querySelector(".".concat(weigher, "__input")).value = '';
      entry.product(Number(card.id), card.name, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(card.parent));
      modalClose(document.querySelector('.modalR'));
    }; // валидация того что в инпуте


    var inputValidate = function inputValidate(e) {
      e.preventDefault();
      var input = document.querySelector(".".concat(weigher, "__input"));
      var submitBtn = document.querySelector(".".concat(weigher, "__submit"));
      clearTimeout(weigherDelay);
      weigherDelay = setTimeout(function () {
        input.value = input.value.replace(/[^\d]/g, '');

        if (input.value !== '') {
          if (input.value < 0) {
            input.value = 0;
          } else {
            submitBtn.removeAttribute('disabled');
          }
        } else {
          submitBtn.setAttribute('disabled', 'disabled');
        }
      }, 200);
    }; // переключатель состояния кнопки ручного/автоматического ввода веса


    var turnManual = function turnManual(e) {
      e.preventDefault();

      if (!e.target.matches(".".concat(weigher, "__btn-manual_active"))) {
        e.target.classList.add("".concat(weigher, "__btn-manual_active"));
        document.querySelector(".".concat(weigher, "__input")).removeAttribute('disabled');
        document.querySelector(".".concat(weigher, "__input")).value = '';
        document.querySelector(".".concat(weigher, "__autoInput")).setAttribute('disabled', 'disabled');
        document.querySelector(".".concat(weigher, "__submit")).setAttribute('disabled', 'disabled');
        e.target.parentNode.querySelector(".".concat(weigher, "__btn-auto_active")).classList.remove("".concat(weigher, "__btn-auto_active"));
      }
    }; // переключатель состояния кнопки ручного/автоматического ввода веса


    var turnAuto = function turnAuto(e) {
      e.preventDefault();

      if (!e.target.matches(".".concat(weigher, "__btn-auto_active"))) {
        e.target.classList.add("".concat(weigher, "__btn-auto_active"));
        document.querySelector(".".concat(weigher, "__input")).setAttribute('disabled', 'disabled');
        document.querySelector(".".concat(weigher, "__input")).value = '';
        document.querySelector(".".concat(weigher, "__autoInput")).removeAttribute('disabled');
        document.querySelector(".".concat(weigher, "__submit")).setAttribute('disabled', 'disabled');
        e.target.parentNode.querySelector(".".concat(weigher, "__btn-manual_active")).classList.remove("".concat(weigher, "__btn-manual_active"));
      }
    }; // пока не работает
    // передать с весов в инпут


    var takeWeight = function takeWeight(e) {
      e.preventDefault();

      if (useWeight) {
        var weightInput = document.querySelector(".".concat(weigher, "__input"));
        weightInput.value = '';
        var weight = 0;
        weight = myWeight.getWeight();
        weightInput.value = Number(weight);
      }
    }; // создание окна добавления весового товара


    var newWeigher = el('div', "".concat(weigher, "__container"), [el('div', "".concat(weigher, "__descr"), [el('h2', "".concat(weigher, "__title"), "".concat(card.name)), el('h2', "".concat(weigher, "__price"), "\u0426\u0435\u043D\u0430 \u0437\u0430 1\u043A\u0433 - ".concat(card.price, " ").concat(currency))]), el('div', "".concat(weigher, "__btn-group"), [el('button', "".concat(weigher, "__btn-auto btn"), "\u0412\u0435\u0441\u044B"), el("button", "".concat(weigher, "__btn-manual ").concat(weigher, "__btn-manual_active btn"), "\u0420\u0443\u0447\u043D\u043E\u0439 \u0432\u0432\u043E\u0434")]), el('form', "".concat(weigher, "__form"), [el('input', "".concat(weigher, "__input keyboard-input"), '', {
      type: 'number',
      placeholder: 'Введите вес в граммах(г)'
    }), el('div', "".concat(weigher, "__btn-group"), [el('button', "".concat(weigher, "__autoInput btn"), 'Снять замер', {
      disabled: 'disabled'
    }), el("button", "".concat(weigher, "__submit btn"), "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C", {
      disabled: 'disabled'
    })])])]);
    newWeigher.querySelector(".".concat(weigher, "__submit")).onclick = weigherSubmit;
    newWeigher.querySelector(".".concat(weigher, "__input")).oninput = inputValidate;

    newWeigher.querySelector(".".concat(weigher, "__input")).onfocus = function (e) {
      e.preventDefault();
      keyboardInit(e.target, false);
    };

    newWeigher.querySelector(".".concat(weigher, "__btn-auto")).onclick = turnAuto;
    newWeigher.querySelector(".".concat(weigher, "__btn-manual")).onclick = turnManual;
    newWeigher.querySelector(".".concat(weigher, "__autoInput")).onclick = takeWeight; // переделать на модульность

    var root = document.querySelector(".modalR__content");
    root.classList.add('weigher');
    root.innerHTML = '';
    root.appendChild(newWeigher);
    modalOpen(document.getElementById('modalR'));
  }; // функционал кнопки обновления


  this.btnFptsUpdate = function () {
    var btnFptsUpdate = document.querySelector('#btn-updateTerminal');
    btnFptsUpdate.addEventListener('click', function (e) {
      popup('Обновление подключение к фискальнику');
      devkkm.init();
    });
  }; // функционал кнопки сброса обновления


  this.btnUptadeTerminalReset = function () {// const btnUpdateReset = document.querySelector('#btn-updateTerminal-reset')
    // btnUpdateReset.addEventListener('click', updateTerminal.getBackupFile())
  }; // информация по рабочему дню


  this.getWorkDayInfo = function () {
    var divUseTerminal = document.querySelector(".menu__status_terminal");
    var divUseAtol = document.querySelector(".menu__status_atol");
    var infoContainer = document.querySelector('.info');
    var dayInfoContainer = document.querySelector('#info-00');
    var sum = dayInfoContainer.querySelector('.all-revenue');
    var cashSum = dayInfoContainer.querySelector('.cash-revenue');
    var cashLessSum = dayInfoContainer.querySelector('.cashLess-revenue');
    var orders = dayInfoContainer.querySelector('.number-orders');
    var averageOrder = dayInfoContainer.querySelector('.average-order');
    var cashSumReturnItem = dayInfoContainer.querySelector('.cash-revenue-return');
    var cashLessSumReturnItem = dayInfoContainer.querySelector('.cashLess-revenue-return');
    var qrSum = dayInfoContainer.querySelector('.qr-revenue');
    var qrReturn = dayInfoContainer.querySelector('.qr-return');
    var dayliPlanFiller = dayInfoContainer.querySelector('.daily-plan__filler');
    var dayliPlanDisplay = dayInfoContainer.querySelector('.daily-plan__display');
    var toCleanContainer = infoContainer.querySelectorAll('.info__container');
    toCleanContainer.forEach(function (i) {
      if (i.id !== 'info-00' && i.id !== 'info-plan-00') {
        infoContainer.removeChild(i);
      } else {
        if (i.id !== 'info-plan-00') {
          i.querySelector('.info-caption').textContent = "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0434\u0435\u043D\u044C(".concat(dateStrGlobal, ")");
        }
      }
    });
    var dailyStat = subfunc.getDailyStat();
    var dayliPlan = Math.ceil(Number(dailyStat.sum) / 100);
    dayliPlanDisplay.textContent = dayliPlan + '%';
    dayliPlanFiller.style.width = dayliPlan + '%';
    qrSum.textContent = "".concat(dailyStat.qrSum, " ").concat(currency);
    qrReturn.textContent = "".concat(dailyStat.qrReturn, " ").concat(currency);
    sum.textContent = dailyStat.sum + " ".concat(currency);
    orders.textContent = dailyStat.orders;
    averageOrder.textContent = dailyStat.averageOrder + " ".concat(currency);
    cashSumReturnItem.textContent = dailyStat.cashSumReturn + " ".concat(currency);
    cashLessSumReturnItem.textContent = dailyStat.cashLessSumReturn + " ".concat(currency);
    cashSum.textContent = dailyStat.cashSum + " ".concat(currency);
    cashLessSum.textContent = dailyStat.cashLessSum + " ".concat(currency);
    ordersSumStat = dailyStat.sum;
    ordersSumCashStat = dailyStat.cashSum;
    ordersSumCashLessStat = dailyStat.cashLessSum;
    ordersReturnSumStat = dailyStat.returnSum;
    ordersReturnSumCashStat = dailyStat.cashSumReturn;
    ordersReturnSumCashLessStat = dailyStat.cashLessSumReturn;

    try {
      var workDayListRes = db.query("SELECT id, tokenWorkdayOffline FROM workday WHERE dateDay = '".concat(dateStrGlobal, "'"));
      Object.entries(workDayListRes).forEach(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            key = _ref8[0],
            value = _ref8[1];

        var tokenWorkday = value.tokenWorkdayOffline;
        var stat = subfunc.getDailyStat(tokenWorkday);
        var newItem = el('div', "info__container", [el('h2', 'info__caption info-caption', "\u0421\u043C\u0435\u043D\u0430 ".concat(value.id)), el('ul', "info__list", [el('li', 'info__item', [el('h3', 'info__title', 'Выручка'), el('p', 'info__text all-revenue', "".concat(stat.sum, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Кол-во чеков:'), el('p', 'info__text number-orders', "".concat(stat.orders))]), el('li', 'info__item', [el('h3', 'info__title', 'Средний чек:'), el('p', 'info__text average-order', "".concat(stat.averageOrder, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Выручка наличный:'), el('p', 'info__text cash-revenue', "".concat(stat.cashSum, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Выручка безнал:'), el('p', 'info__text cash-revenue', "".concat(stat.cashLessSum, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Выручка QR code:'), el('p', 'info__text qr-revenue', "".concat(stat.qrSum, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Возврат наличный:'), el('p', 'info__text cash-revenue-return', "".concat(stat.cashSumReturn, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Возврат безнал:'), el('p', 'info__text cashLess-revenue-return', "".concat(stat.cashLessSumReturn, " ").concat(currency))]), el('li', 'info__item', [el('h3', 'info__title', 'Возврат QR code:'), el('p', 'info__text qr-return', "".concat(stat.qrReturn, " ").concat(currency))])])], {
          id: "info-".concat(tokenWorkday)
        });

        try {
          if (stat.cashSumReturn > 0 || stat.cashLessSumReturn > 0 || stat.cashSum > 0 || stat.cashLessSum > 0) {
            infoContainer.insertBefore(newItem, document.querySelector('#info-00').nextSibling);
          }
        } catch (error) {}
      });
    } catch (error) {
      popup('Смена архивирована');
      logger('Ошибка в отрисовке статистики:' + error.message);
    } //скрытие qr-code статистики


    setting.showQRcode(!!useQRcode);

    try {
      if (useTerminal) {
        divUseTerminal.classList.remove('menu__status_error');
      } else {
        divUseTerminal.classList.add('menu__status_error');
      }
    } catch (e) {}
  }; // дропдаун для настроек


  this.dropdownSelect = function (selector) {// const selectorWrapper = document.querySelector(selector)
    // const selectDisplay = selectorWrapper.querySelector('.dropdown__btn-text')
    // const selectDropdown = selectorWrapper.querySelector('.dropdown__content-box_select')
    // if(!selectorWrapper) {
    //   alert('Дропдаун не нашел селект по строке')
    // }
    // const btnNodeList = selectorWrapper.querySelector('.dropdown__list')
    // btnNodeList.addEventListener('click', (e) => {
    //   if(e.target.matches('.dropdown__item-btn_select')) {
    //     selectDisplay.textContent = e.target.textContent;
    //     selectDropdown.classList.remove('active')
    //   }
    // })
  };

  this.checklists = function () {};

  this.declaration = function () {
    var declarationWrap = document.querySelector('.declaration');
    declarationWrap.addEventListener('click', function () {
      declarationWrap.classList.toggle('declaration_active');
    });
  }; // функционал возврата
  //Попап на частичный возврат


  this.orderRefund = function (order, productArray) {
    if (!productArray) {
      return;
    }

    try {
      var root = document.querySelector(".body");
      var clasName = 'order-refund';
      var orderType = order.chtype == 0 ? 'наличными' : order.chtype == 1 ? 'безнал' : 'QR-code';
      var toTransactionProdList = [];
      var totalAmount = order.amount;
      var toTransactionOrder = {
        amount: order.amount,
        orderSumFinal: order.orderSumFinal,
        orderHashcode: order.hashcode,
        idOrder: order.id
      };
      var productList = productArray.map(function (product, index) {
        var input = el('input', 'counter__input keyboard-input keyboard-input_num', '', {
          type: 'number'
        });
        input.value = product.amount;
        input.id = "idProd".concat(index);
        input.addEventListener('focus', function (e) {
          e.preventDefault();
          keyboardInit(e.target, false);
        });
        input.addEventListener('input', function (e) {
          var btn = e.target;
          var checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input');
          clearTimeout(delay);
          delay = setTimeout(function () {
            if (isNaN(input.value)) {
              input.value = 0;
            }

            if (input.value.length > 10) {
              input.value = 999999999;
            }

            var newValue = Number(input.value);

            if (newValue >= maxValue) {
              newValue = maxValue;
              input.value = newValue;
              inputDisplay.textContent = "".concat(newValue, "/").concat(maxValue);
              checkBox.checked = false;
              checkBox.click();
            } else if (newValue < 1) {
              input.value = 0;
              inputDisplay.textContent = "0/".concat(maxValue);
              checkBox.checked = true;
              checkBox.click();
            } else {
              productArray[index].amount = newValue;
              document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = "".concat(productArray[index].interimPrice * productArray[index].amount, " ").concat(currency);
              inputDisplay.textContent = "".concat(newValue, "/").concat(maxValue);
              checkBox.checked = false;
              checkBox.click();
            }
          }, 200);
        });
        var maxValue = Number(product.amount);
        var label = el('label', 'counter__input-label', [input, el('span', 'counter__input-display', "".concat(maxValue, "/").concat(maxValue))]);
        var inputDisplay = label.querySelector('.counter__input-display');
        var plusBtn = el('button', 'counter__btn counter__btn_up btn btn_hover-alternate', '+', {
          id: "btnPlus".concat(index)
        });
        var minusBtn = el('button', 'counter__btn counter__btn_down btn btn_hover-alternate', '-', {
          id: "btnMinus".concat(index)
        });
        plusBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var newValue = Number(input.value) + 1;
          var btn = e.target;
          var checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input');

          if (newValue <= maxValue) {
            productArray[index].amount = newValue;
            inputDisplay.textContent = "".concat(newValue, "/").concat(maxValue);
            input.value = newValue;
          } else {
            productArray[index].amount = maxValue;
          }

          document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = "".concat(productArray[index].interimPrice * productArray[index].amount, " ").concat(currency);
          checkBox.checked = false;
          checkBox.click();
        });
        minusBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var btn = e.target;
          var checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input');
          var oldLength = String(input.value).length;
          var newValue = Number(input.value) - 1;
          if (String(newValue).length > oldLength) newValue = Number(String(newValue).substring(0, oldLength));

          if (newValue >= 1) {
            productArray[index].amount = newValue;
            document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = "".concat(productArray[index].interimPrice * productArray[index].amount, " ").concat(currency);
            inputDisplay.textContent = "".concat(newValue, "/").concat(maxValue);
            input.value = newValue;
            checkBox.checked = false;
            checkBox.click();
          } else {
            productArray[index].amount = 0;
            input.value = 0;
            inputDisplay.textContent = "0/".concat(maxValue);
            checkBox.checked = true;
            checkBox.click();
          }
        });
        return el('li', "".concat(clasName, "__item item-checkbox"), [el('input', "item-checkbox__input", '', {
          type: "checkbox",
          id: "proditem-".concat(index),
          name: 'order-item',
          checked: 'checked'
        }), el('label', "item-checkbox__label", [el('div', "".concat(clasName, "__item-info item-info"), [el('div', "item-info__item", [el('span', 'item-info__span', "".concat(product.name, " ").concat(product.bulkvalue).concat(product.bulkuntils))]), el('div', 'item-info__item item-info__item_counter counter counter_refund', [minusBtn, label, plusBtn]), el('div', "item-info__item", [el('span', 'item-info__span', 'Цена:'), el('span', 'item-info__span', "".concat(product.priceFinal, " ").concat(currency))]), el('div', "item-info__item", [el('span', 'item-info__span', 'Итого:'), el('span', 'item-info__span item-info__span_totalSum', "".concat(product.productSum, " ").concat(currency))])]), el('span', 'item-checkbox__icon', '')], {
          "for": "proditem-".concat(index)
        })]);
      });
      var newPreloader = el('div', 'preloader', [el('div', "preloader__content ".concat(clasName), [el('h2', "".concat(clasName, "__title"), "\u041C\u0435\u043D\u044E \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(orderType, ": \u2116").concat(order.id)), el('div', "".concat(clasName, "__list-wrap scrollbar"), el('ul', "".concat(clasName, "__list"), productList)), el('div', "".concat(clasName, "__subtotal-info"), [el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_toggle btn"), 'Выбрать/Убрать всё'), el('div', "".concat(clasName, "__subtotal-info-item"), 'Итого к отмене:'), el('div', "".concat(clasName, "__subtotal-info-item ").concat(clasName, "__subtotal-info-item_amount"), "\u041F\u043E\u0437\u0438\u0446\u0438\u0439: ".concat(order.amount)), el('div', "".concat(clasName, "__subtotal-info-item ").concat(clasName, "__subtotal-info-item_sum"), "\u041D\u0430 \u0441\u0443\u043C\u043C\u0443: ".concat(order.orderSumFinal, " ").concat(currency))]), el('div', "".concat(clasName, "__btn-group"), [el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_confirm btn"), 'Подтвердить'), el('button', "".concat(clasName, "__btn ").concat(clasName, "__btn_cancel btn"), 'Отменить')]), el('div', "".concat(clasName, "__scroll-btn ").concat(clasName, "__scroll-btn_up btn btn_nav btn_nav-up"), ''), el('div', "".concat(clasName, "__scroll-btn ").concat(clasName, "__scroll-btn_down btn btn_nav btn_nav-down"), '')])]);
      newPreloader.querySelector(".btn_nav-up").innerHTML = "<svg width=\"58\" height=\"58\" viewBox=\"0 0 58 58\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z\" stroke=\"white\" stroke-width=\"2\"/>\n      <path d=\"M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z\" fill=\"currentColor\"/>\n      </svg>";
      newPreloader.querySelector(".btn_nav-down").innerHTML = " <svg width=\"58\" height=\"58\" viewBox=\"0 0 58 58\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z\" stroke=\"white\" stroke-width=\"2\"/>\n      <path d=\"M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z\" fill=\"currentColor\"/>\n      </svg>";
      newPreloader.querySelector(".".concat(clasName, "__btn_cancel")).addEventListener('click', function (e) {
        e.preventDefault();
        preloader.preloaderOff();
      });
      var checkBoxList = newPreloader.querySelectorAll(".".concat(clasName, "__item"));

      if (checkBoxList.length > 0) {
        checkBoxList.forEach(function (item) {
          var input = item.querySelector('.item-checkbox__input');
          input.addEventListener('change', function (e) {
            e.preventDefault();
            toTransactionProdList = [];

            if (input.checked) {
              if (productArray[input.id.split('-')[1]].amount == 0) {
                var counterDisplay = document.querySelector('.item-checkbox .counter__input-display');
                var counterInput = document.querySelector('.item-checkbox .counter__input');
                var maxValue = Number(counterDisplay.textContent.split('/')[1]);
                productArray[input.id.split('-')[1]].amount = maxValue;
                document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = "".concat(productArray[input.id.split('-')[1]].interimPrice * productArray[input.id.split('-')[1]].amount, " ").concat(currency);
                counterDisplay.textContent = "".concat(maxValue, "/").concat(maxValue);
                counterInput.value = maxValue;
              }
            }

            checkBoxList.forEach(function (j) {
              var input = j.querySelector('.item-checkbox__input');

              if (input.checked) {
                toTransactionProdList.push(productArray[input.id.split('-')[1]]);
              }
            });

            if (toTransactionProdList.length > 0) {
              toTransactionOrder.orderSumFinal = 0;
              toTransactionOrder.amount = 0;
              toTransactionProdList.forEach(function (i) {
                toTransactionOrder.amount += Number(i.amount);
                toTransactionOrder.orderSumFinal += Number(i.interimPrice) * Number(i.amount);
              });
            } else {
              toTransactionOrder.amount = 0;
              toTransactionOrder.orderSumFinal = 0;
            }

            newPreloader.querySelector(".".concat(clasName, "__subtotal-info-item_amount")).textContent = "\u041F\u043E\u0437\u0438\u0446\u0438\u0439: ".concat(toTransactionOrder.amount);
            newPreloader.querySelector(".".concat(clasName, "__subtotal-info-item_sum")).textContent = "\u041D\u0430 \u0441\u0443\u043C\u043C\u0443: ".concat(toTransactionOrder.orderSumFinal, " ").concat(currency);
          });
        });
      }

      newPreloader.querySelector(".".concat(clasName, "__btn_toggle")).addEventListener('click', function (e) {
        e.preventDefault();

        if (checkBoxList.length > 0) {
          var checked = false;
          checkBoxList.forEach(function (item, index) {
            var input = item.querySelector('.item-checkbox__input');
            if (index == 0) checked = !input.checked;
            input.checked = !checked;
            input.click();
          });
        }
      });
      newPreloader.querySelector(".".concat(clasName, "__btn_confirm")).addEventListener('click', function (e) {
        e.preventDefault();

        if (toTransactionOrder.amount == totalAmount) {
          // стандартный возврат
          var refaundBtn = document.querySelector(".formed-orders [data-value=\"".concat(toTransactionOrder.idOrder, "\"]"));

          if (refaundBtn.dataset.chtype == 0) {
            var _order3 = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));

            var productArr = subfunc.getProductArr(_order3);
            logger(JSON.stringify(_order3) + '\n' + JSON.stringify(productArr));

            if (useAtol && !troubleAtol) {
              // если используется атол
              if (devkkm.printReturtOrder(_order3, productArr)) {
                popup("\u0427\u0435\u043A ".concat(_order3.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              } else {
                popup("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order3.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order3.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                troubleAtolCounter += 1;

                if (troubleAtolCounter === 2) {
                  devkkm.init();
                }

                if (troubleAtolCounter > 3) {
                  troubleAtol = 1;
                  document.querySelector('#trouble-atol-toggle').checked = true;
                  telegramNote('Аварийный режим атола включён');
                  dbMethods.updateDb('settings', {
                    value: 1
                  }, {
                    variable: 'troubleAtol'
                  });
                  popup('Перевод кассы в режим аварийной работы фискального регистратора');
                  postman.atolOrder();
                  troubleAtolCounter = 0;
                  var q = "UPDATE orders SET status = -1 WHERE id = ".concat(Number(_order3.id));

                  try {
                    db.query(q);
                    refaundBtn.textContent = 'Отменен';
                    refaundBtn.setAttribute("disabled", "disabled");
                  } catch (e) {
                    logger("\u0447\u0435\u043A ".concat(Number(_order3.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(_order3), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
                    popup("\u0447\u0435\u043A ".concat(Number(_order3.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
                  }
                }

                ;
              }
            } else if (useAtol && troubleAtol) {
              var _q = "UPDATE orders SET status = -1 WHERE id = ".concat(Number(_order3.id));

              try {
                db.query(_q);
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
                popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
              } catch (e) {
                try {
                  db.conn.close();
                } catch (error) {}

                popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(_order3.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(_order3.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(_order3), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)) + e.message);
              }
            } else {
              var _q2 = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(_order3.id));

              try {
                db.query(_q2);
                popup("\u0427\u0435\u043A ".concat(_order3.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              } catch (e) {
                try {
                  db.conn.close();
                } catch (error) {}

                logger("\u0447\u0435\u043A ".concat(Number(_order3.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(_order3), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
                popup("\u0447\u0435\u043A ".concat(Number(_order3.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
              }
            }

            ;
          } else if (refaundBtn.dataset.chtype == 2 && !refaundBtn.classList.contains('ready-payment')) {
            send.cancelQRcode(Number(refaundBtn.dataset.value), refaundBtn);
          } else if (useTerminal && !refaundBtn.classList.contains('ready-payment')) {
            sbbank.refund(Number(refaundBtn.dataset.value), refaundBtn);
          } else if (useAtol === 1 && !troubleAtol) {
            // если используется атол
            var _order4 = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));

            var _productArr2 = subfunc.getProductArr(_order4);

            if (devkkm.printReturtOrder(_order4, _productArr2)) {
              popup("\u0427\u0435\u043A ".concat(_order4.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
            } else {
              var _order5 = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));

              var _productArr3 = subfunc.getProductArr(_order5);

              popup("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order5.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(_order5.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              troubleAtolCounter += 1;

              if (troubleAtolCounter > 3) {
                troubleAtol = 1;
                document.querySelector('#trouble-atol-toggle').checked = true;
                telegramNote('Аварийный режим атола включён');
                dbMethods.updateDb('settings', {
                  value: 1
                }, {
                  variable: 'troubleAtol'
                });
                popup('Перевод кассы в режим аварийной работы фискального регистратора');
                postman.atolOrder();
                troubleAtolCounter = 0;
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              }

              ;
            }
          } else if (useAtol === 1 && troubleAtol) {
            var _order6 = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));

            var _productArr4 = subfunc.getProductArr(_order6);

            var _q3 = "UPDATE orders SET status = -1 WHERE id = ".concat(Number(_order6.id));

            try {
              db.query(_q3);
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
              popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
            } catch (e) {
              try {
                db.conn.close();
              } catch (error) {}

              popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(_order6.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(_order6.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(_order6), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(_productArr4)) + e.message);
            }
          } else {
            var _order7 = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));

            var _productArr5 = subfunc.getProductArr(_order7);

            var _q4 = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(_order7.id));

            refaundBtn.textContent = 'Отменен';
            refaundBtn.setAttribute("disabled", "disabled");

            try {
              db.query(_q4);
            } catch (e) {
              try {
                db.conn.close();
              } catch (error) {}

              logger("\u0447\u0435\u043A ".concat(Number(_order7.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(_order7), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(_productArr5), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
              popup("\u0447\u0435\u043A ".concat(Number(_order7.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
            }
          }

          ;
          refaundBtn.textContent = 'Отменен';
          refaundBtn.setAttribute("disabled", "disabled");
          preloader.preloaderOff();
        } else {
          if (!toTransactionProdList.length) {
            return;
          }

          var _q5 = "INSERT INTO orderrefund (idOrder, amount, orderSumFinal, orderHashcode) VALUES (".concat(toTransactionOrder.idOrder, ",").concat(toTransactionOrder.amount, ",").concat(toTransactionOrder.orderSumFinal, ",'").concat(toTransactionOrder.orderHashcode, "')");

          try {
            db.query(_q5);
          } catch (error) {
            db.conn.close();
            alert(_q5);
            throw 'Ошибка при добавлении в orderrefund';
          }

          toTransactionProdList.forEach(function (i) {
            var q = "UPDATE orderItem SET idOrderRefund = ".concat(toTransactionOrder.idOrder, ", amountRefund = ").concat(i.amount, " WHERE id = ").concat(Number(i.id));

            try {
              db.query(q);
            } catch (error) {
              db.conn.close();
              throw 'Ошибка при обновлении в orderItem';
            }
          });
          alert('Частичный возврат в разработке \n Выберите все продукты в чеке');
        }
      });
      newPreloader.addEventListener('click', function (e) {
        if (!e.target.closest('.preloader__content')) {
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
      try {
        db.conn.close();
      } catch (e) {}

      popup('Ошибка при возврате' + error.message);
      logger('Ошибка при возврате' + error.message);
    }
  };
}();