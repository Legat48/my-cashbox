"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// функции записи рабочей информации по чеку и товарам
var entry = new function Entry() {
  // запись нового товара
  this.product = function (idProd, name, bulkvalue, bulkuntils, price, amount, cashback_percent, parent) {
    var maxSale = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
    var message = "\u0412\u044B\u0437\u0432\u0430\u043B\u0430\u0441\u044C \u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0437\u0430\u043F\u0438\u0441\u0438 \u043D\u043E\u0432\u043E\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u0430. \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 ".concat(idOrderGlobal, " \u0412 \u043D\u0435\u0451 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043E idProd ").concat(idProd, ",name ").concat(name, ",bulkvalue ").concat(bulkvalue, ",bulkuntils ").concat(bulkuntils, ",price ").concat(price, ",amount ").concat(amount, ",cashback_percent ").concat(Number(cashback_percent) / 100, ",parent ").concat(parent, ", maxSale ").concat(maxSale);
    logger(message); // смотрим такой товар в массиве товаров который локально подгружен в массив

    if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
      var searchInput = document.querySelector('#search-input');
      searchInput.value = '';

      var _iterator = _createForOfIteratorHelper(productArr),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var i = _step.value;

          //   // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
          if (i.idProd == idProd && parent == i.productCategory) {
            var prodName = name.split(': ')[1];

            if ((i.name.includes('Сироп') || i.name.includes('Топпинг') || i.name.includes('Раф')) && !i.name.includes(prodName)) {
              i.name += '/' + prodName;
            }

            i.amount = Number(i.amount) + 1;
            q = "UPDATE orderItem SET amount = '".concat(Number(i.amount), "', name = '").concat(i.name, "' WHERE id = ").concat(Number(i.id));
            db.query(q);
            orderCalc.renderReceipt();
            return;
          }
        } // если совпадения нет, то будем вписывать новый товар в чек

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var q;

      try {
        var saleMaxPrice = price * maxSale;
        q = "INSERT INTO orderItem ( idProd, idOrder, name, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum, productCategory) VALUES ('".concat(idProd, "', ").concat(idOrderGlobal, ", '").concat(name, "','").concat(bulkvalue, "','").concat(bulkuntils, "', ").concat(price, ", 1, 0,").concat(saleMaxPrice, ", 0, 0, ").concat(Number(cashback_percent) / 100, ", '").concat(Number(amount), "', 0, 0, 0, 0, ").concat(parent, ");");
        db.query(q);

        var _message = "\u0417\u0430\u043F\u0438\u0441\u044C \u0442\u043E\u0432\u0430\u0440\u0430. \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 ".concat(idOrderGlobal, " \u0412 \u043D\u0435\u0451 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043E idProd ").concat(idProd, " \u0431\u044B\u043B \u0437\u0430\u043F\u0438\u0441\u0430\u043D");

        logger(_message);
        update.productArr();
        update.saleObg();
        orderCalc.renderReceipt();
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {}

        var _message2 = "\u0417\u0430\u043F\u0438\u0441\u044C \u0442\u043E\u0432\u0430\u0440\u0430. \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 ".concat(idOrderGlobal, " \u0412 \u043D\u0435\u0451 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043E idProd ").concat(idProd, " \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043B\u0441\u044F, \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message);

        logger(_message2);
        popup(e.message);
      }
    } else {
      popup('добавить товары в оплаченный чек невозможно');
    }
  }; // фиксация данных чека


  this.ordersFixation = function (order, status) {
    var time = subfunc.getTime();
    var rs = subfunc.random();
    var hashcode = "".concat(rs).concat(time.unix, "s").concat(useAtol).concat(useTerminal).concat(troubleAtol);

    if (status == 2) {
      postman.displayOrder(order, productArr);
    }

    var q = "UPDATE orders SET status = ".concat(Number(status), ", time = '").concat(time.time, "', date = '").concat(time.date, "', unix = '").concat(time.unix, "', hashcode = '").concat(hashcode, "', fiscalPrint = ").concat(Number(order.fiscalPrint), ", orderSum = ").concat(Number(order.orderSum), ", interimSum = ").concat(Number(order.interimSum), ", clientPoints  = '").concat(Number(balanceFinal), "', amount = '").concat(Number(order.amount), "', orderSumFinal = ").concat(Number(order.orderSumFinal), ", barista = '").concat(order.barista, "', chtype = '").concat(order.chtype, "', qrtoken ='").concat(order.qrtoken, "', endPointsCert = ").concat(order.endPointsCert, ", writeoffMode = ").concat(order.writeoffMode || 0, " WHERE id = ").concat(Number(order.id));

    try {
      logger("\u0437\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044E \u0447\u0435\u043A\u0430".concat(q));
      db.query(q);
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      return true;
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {}

      logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u043E\u0448\u0438\u0431\u043A\u0430 :".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
      return false;
    }

    ;
  };

  this.productArrFixation = function (order) {
    logger("\u0424\u0438\u043A\u0441\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u0442\u043E\u0432\u0430\u0440\u044B, id \u0447\u0435\u043A\u0430 ".concat(Number(order.id), " \u043C\u0430\u0441\u0441\u0438\u0432 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 ").concat(JSON.stringify(productArr)));
    var q;
    var funcStatus = true;

    if (order.sertiicate > 0) {
      alert('test');
    }

    productArr.forEach(function (e) {
      q = "UPDATE orderItem SET debitClientBonus = ".concat(Number(e.debitClientBonus), ", sale = ").concat(Number(e.sale), ", interimPrice = ").concat(Number(e.interimPrice), ", offreckoningItem = ").concat(Number(e.offreckoningItem), ", cashbackPercent = ").concat(Number(e.cashbackPercent), ", amount = '").concat(Number(e.amount), "', priceFinal = ").concat(Number(e.priceFinal), ", cashback = ").concat(Number(e.cashback), ", cashbackSum = ").concat(Number(e.cashbackSum), ", productSum = ").concat(Number(e.productSum), " WHERE id= ").concat(Number(e.id));

      try {
        db.query(q);
        logger("\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043B\u0441\u044F \u0442\u043E\u0432\u0430\u0440, id \u0447\u0435\u043A\u0430 ".concat(Number(order.id), " \u043C\u0430\u0441\u0441\u0438\u0432 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 ").concat(JSON.stringify(e)));
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {}

        var message = "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 productArrFixation ".concat(JSON.stringify(e), "  productArr ").concat(productArr, " ");
        logger(message);
        popup(e.message + 'Сбросьте чек и набейте заного');
        funcStatus = false;
      }
    });
    return funcStatus;
  };
}();