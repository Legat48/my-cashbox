"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// обнуление всех полей и значений
var orderCalc = new function () {
  this.resetCounter = function () {
    valueStock = 0;
    valueSurrender = 0;
    outputValueStockArr.forEach(function (j) {
      j.textContent = 'Получено: ';
    });
    outputValueSurrenderArr.forEach(function (j) {
      j.textContent = 'Сдача: ';
    });
    btnCash.textContent = 'Наличные';
    btnCash.classList.remove('.ready-payment');
    outputValueSurrenderArr.forEach(function (e) {
      e.style.opacity = 0;
    });
    outputValueStockArr.forEach(function (e) {
      e.style.opacity = 0;
    });
  }; // счетчик чека


  this.counter = function () {
    var balance = 0; //локальный баланс для счета

    balanceFinal = ordersArr[0].clientPoints;
    balanceFinalCert = ordersArr[0].offreckoning;
    ordersArr[0].orderSum = 0; // сумма чека без скидок

    ordersArr[0].amount = 0; // кол-во товаров в чеке всего

    ordersArr[0].interimSum = 0; // промежуточная сумма чека без применения сертификата

    ordersArr[0].orderSumFinal = 0; // сумма к оплате
    // счетчик всех товаров

    productArr.forEach(function (e) {
      ordersArr[0].orderSum = Number(e.price) * Number(e.amount) + Number(ordersArr[0].orderSum); //сумма чека без скидок

      var debitProduct = Math.floor(Number(balanceFinal) / Number(e.amount)); //вычет баллов с 1 единицы товара

      var debitProductCert = Math.floor(Number(balanceFinalCert) / Number(e.amount)); //вычет баллов сертификата с 1 единицы товара

      var debitClientBonus; // переменная изменения бонусов клиента относительно товара по всей цене

      if (statusСashback == 2) {
        //если мы списываем баллы то считаем с вычетом баллов финальную сумму
        if (roundPrice == 1) {
          // округляем или нет
          e.interimPrice = Math.floor(Number(e.price) * Number(e.sale) - Number(debitProduct)); // считаем промежуточный прайс
        } else {
          e.interimPrice = Math.floor((Number(e.price) * Number(e.sale) - Number(debitProduct)) * 100) / 100; // считаем промежуточный прайс с округлением до сотых
        }

        if (e.interimPrice < 0) {
          // если вычитается в минус, считаем сколько можно списать из стоимости с примененной скидкой
          debitProduct = Number(e.price) * Number(e.sale) / Number(e.amount);
          e.interimPrice = 0;
        }
      } else {
        // если не списываем то просто считаем промежуточный прайс(применяем только скидку)
        if (roundPrice == 1) {
          // округляем или нет
          e.interimPrice = Math.floor(Number(e.price) * Number(e.sale));
        } else {
          e.interimPrice = Math.floor(Number(e.price) * Number(e.sale) * 100) / 100;
        }
      } // если получившаяся сумма меньше чем допустимая сумма скидки то приравниваем к значению скидки максимальной


      if (e.interimPrice < e.saleMaxPrice) {
        e.interimPrice = e.saleMaxPrice;

        if (statusСashback == 2) {
          //если баллы списываем
          debitProduct = (Number(e.price) * Number(e.sale) - Number(e.saleMaxPrice)) / Number(e.amount); // сколько баллов можно вычесть с 1 единицы
        }
      } // обработка баллов клиента


      if (statusСashback == 1) {
        // если мы копим то считаем сколько баллов даст товар и записываем
        //тут можно перенастроить счет кэшбека, на чем то увеличивать)
        e.cashback = Math.floor(Number(e.interimPrice) * (globalCashback + Number(e.cashbackPercent)));
        e.cashbackSum = Math.floor(Number(e.cashback) * Number(e.amount));
        balanceFinal = Math.floor(Number(balanceFinal) + Number(e.cashbackSum));
        var value = document.querySelector('.client__value');

        if (balanceFinal > balance) {
          // красим в зеленый
          value.classList.remove('client__value_write-off');
          value.classList.add('client__value_accumulate');
        }

        value.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432:  ".concat(balanceFinal);
      } else if (statusСashback == 2) {
        // если мы списываем, то считаем сколько у нас получилось списать баллов
        e.debitClientBonus = Math.floor(Math.ceil(Math.floor(Number(e.price) * Number(e.sale)) - Number(e.interimPrice)) * Number(e.amount)); // переписываем в объекте

        debitClientBonus = e.debitClientBonus; // 9176401407

        var _beforeChange = balanceFinal;
        balance = _beforeChange - debitClientBonus; // высчитываем из текущего баланса
        //для дебага

        if (balance < 0) {
          try {
            telegramNote("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0441\u0447\u0435\u0442\u0435 \u0431\u0430\u043B\u043B\u043E\u0432 \u0431\u044B\u043B\u043E ".concat(_beforeChange, " \u0432\u044B\u0447\u043B\u0438 ").concat(debitClientBonus), '1385389369');
            e.debitClientBonus = debitClientBonus + balance;
            balance = 0;
          } catch (error) {
            logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0441\u0447\u0435\u0442\u0435 \u0431\u0430\u043B\u043B\u043E\u0432 \u0431\u044B\u043B\u043E ".concat(_beforeChange, " \u0432\u044B\u0447\u043B\u0438 ").concat(debitClientBonus));
          }
        }

        balanceFinal = balance;

        var _value = document.querySelector('.client__value');

        if (debitClientBonus) {
          _value.classList.remove('client__value_accumulate');

          _value.classList.add('client__value_write-off');
        }

        _value.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432: ".concat(balanceFinal);
        e.cashback = 0;
        e.cashbackSum = 0;
      } else {
        // сбрасываем наверняка
        e.debitClientBonus = 0;
        balanceFinal = 0;
        e.cashback = 0;
        e.cashbackSum = 0;
      } // Тут мы будем пересчитывать сертификат


      var offreckoningPrice; // промежуточная для счета цена с вычтенными барами сертификатов

      if (roundPrice == 1) {
        // округляем или нет
        offreckoningPrice = Math.ceil(Number(e.interimPrice) - Number(debitProductCert)); // считаем промежуточный прайс
      } else {
        offreckoningPrice = Math.floor(Number(e.interimPrice) - Number(debitProductCert) * 100) / 100; // считаем промежуточный прайс с округлением до сотых
      } // если получилось списать в минус


      if (offreckoningPrice < 0) {
        offreckoningPrice = 0;
        debitProductCert = Number(e.interimPrice);
      }

      var beforeChange = balanceFinalCert;
      balanceFinalCert = beforeChange - Math.floor(Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount); //для дебага

      if (balanceFinalCert < 0) {
        try {
          telegramNote("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0441\u0447\u0435\u0442\u0435 \u0431\u0430\u043B\u043B\u043E\u0432 \u0431\u044B\u043B\u043E ".concat(beforeChange, " \u0432\u044B\u0447\u043B\u0438 ").concat(Math.floor(Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount)), '1385389369');
          balanceFinalCert = 0;
        } catch (error) {
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0441\u0447\u0435\u0442\u0435 \u0431\u0430\u043B\u043B\u043E\u0432 \u0431\u044B\u043B\u043E ".concat(beforeChange, " \u0432\u044B\u0447\u043B\u0438 ").concat(Math.floor(Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount)));
        }
      } // считаем финальную цену


      e.priceFinal = Number(offreckoningPrice); // обнулить цену под списание

      if (writeOffGlobal) {
        e.priceFinal = 0;
        e.interimPrice = 0;
        e.productSum = 0;
        ordersArr[0].writeoffMode = 1;
        ordersArr[0].chtype = 0;
      }

      e.productSum = Math.floor(Number(e.priceFinal) * Number(e.amount)); // перезаписываем в текущем чеке значения

      ordersArr[0].amount += e.amount;
      ordersArr[0].interimSum = ordersArr[0].interimSum + Number(e.interimPrice) * Number(e.amount);
      ordersArr[0].orderSumFinal += e.productSum;
      ordersArr[0].endPointsCert = balanceFinalCert;
    }); // вывод значения суммы оплаты

    orderSumFinal = ordersArr[0].orderSumFinal;
    var outputValuePaymentArr = document.querySelectorAll('.payment-value');
    outputValuePaymentArr.forEach(function (e) {
      e.textContent = orderSumFinal;
    });
    certValue.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432: ".concat(balanceFinalCert);
  }; // функция отрисовки итемов в чеке


  this.renderReceipt = function () {
    orderCalc.counter(); //вызываем счетчик
    // визуальная очистка чека

    while (wrapReceipt.firstChild) {
      wrapReceipt.removeChild(wrapReceipt.firstChild);
    }

    function renderItem(idProd, name, amount, productCategory, price, priceFinal, productSum) {
      var plusBtn = el('button', 'counter__btn counter__btn_up btn btn_hover-alternate', '+', {
        id: "btnPlus".concat(idProd)
      });
      var minusBtn = el('button', 'counter__btn counter__btn_down btn btn_hover-alternate', '-', {
        id: "btnMinus".concat(idProd)
      }); // кнопка плюс увеличивает в объекте количество

      plusBtn.addEventListener('click', function (e) {
        if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
          // // находим по id кнопки айди итема в массиве
          var idBtn = "".concat(plusBtn.id);

          var _idProd = idBtn.slice(7);

          var _iterator = _createForOfIteratorHelper(productArr),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var i = _step.value;

              //   // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
              if (i.idProd == _idProd && i.productCategory == productCategory) {
                i.amount = Number(i.amount) + 1;
                var q = "UPDATE orderItem SET amount = ".concat(Number(i.amount), " WHERE id = ").concat(Number(i.id));
                db.query(q);
                orderCalc.renderReceipt();
                break;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        } else {
          popup('Изменение товаров в оплаченном чеке невозможно');
        }
      });
      minusBtn.addEventListener('click', function () {
        if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
          // находим по id кнопки айди итема в массиве
          var idBtn = "".concat(minusBtn.id);

          var _idProd2 = idBtn.slice(8);

          var _iterator2 = _createForOfIteratorHelper(productArr),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var i = _step2.value;

              // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
              if (i.idProd == _idProd2 && i.productCategory == productCategory) {
                if (i.amount > 1) {
                  var oldLength = String(i.amount).length;
                  i.amount = Number(i.amount) - 1;
                  if (String(i.amount).length > oldLength) i.amount = String(i.amount).substring(0, oldLength);
                  var q = "UPDATE orderItem SET amount = ".concat(Number(i.amount), " WHERE id = ").concat(Number(i.id));
                  db.query(q);
                  orderCalc.renderReceipt();
                  break;
                } else {
                  var _q = "DELETE FROM orderItem WHERE id = ".concat(Number(i.id), ";");

                  db.query(_q);
                  update.productArr();
                  update.saleObg();
                  orderCalc.renderReceipt();
                  break;
                }
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } else {
          popup('Изменение товаров в оплаченном чеке невозможно');
        }
      });
      var priceClass = 'product__text';

      if (price != priceFinal || priceFinal == 0) {
        priceClass = 'product__text product__text_sale';
      }

      var input = el('input', 'counter__input keyboard-input keyboard-input_num', '', {
        type: 'number'
      });
      input.setAttribute('keyboard', 'product_input');
      input.value = amount;
      input.id = "idProd".concat(idProd);
      input.addEventListener('focus', function (e) {
        e.preventDefault();
        keyboardInit(e.target, false);
      });
      input.addEventListener('input', function (e) {
        clearTimeout(delay);
        delay = setTimeout(function () {
          if (isNaN(input.value)) {
            input.value = 0;
          }

          if (input.value.length > 10) {
            input.value = 999999999;
          }

          if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
            var idProdInput = "".concat(input.id);

            var _idProd3 = idProdInput.slice(6);

            var _iterator3 = _createForOfIteratorHelper(productArr),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var i = _step3.value;

                // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
                if (i.idProd == _idProd3 && productCategory == i.productCategory) {
                  i.amount = Number(input.value);
                  var q = "UPDATE orderItem SET amount = ".concat(Number(i.amount), " WHERE id = ").concat(Number(i.id));

                  try {
                    db.query(q);
                  } catch (error) {
                    try {
                      db.conn.close();
                    } catch (error) {}
                  }

                  orderCalc.renderReceipt();
                  break;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          } else {
            var _iterator4 = _createForOfIteratorHelper(productArr),
                _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var _i = _step4.value;

                // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
                if (_i.idProd == idProd && productCategory == _i.productCategory) {
                  input.value = _i.amount;
                  break;
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            popup('Изменение товаров в оплаченном чеке невозможно');
            return;
          }

          if (input.value < 0) {
            input.value = '';
          }
        }, 300);
      }); // alert(priceFinal+productSum)
      // возвращает отрисованный товар

      return el('li', 'product receipt__item', [el('button', 'product__btn-name', el('span', null, name)), el('div', 'product__counter counter', [minusBtn, input, plusBtn]), el('div', priceClass, "".concat(Number(priceFinal))), el('div', 'product__text product-summ', "".concat(Number(productSum)))], {
        id: "receipt-".concat(idProd)
      });
    } // если есть товары в массиве отрисовываем весь чек


    if (productArr.length > 0) {
      productArr.forEach(function (e) {
        var nameStr = e.bulkvalue !== 'undefined' || e.bulkuntils !== 'undefined' ? e.name + ': ' + e.bulkvalue + e.bulkuntils : e.name;
        wrapReceipt.appendChild(renderItem(e.idProd, nameStr, e.amount, e.productCategory, e.price, e.priceFinal, e.productSum));
      });
    }
  };
}();