"use strict";

// работа с терминалом банка
var sbbank = new function Bank() {
  this.sum = '';
  this.statusWaiting = 0;
  this.result = -1;
  this.res = -1;
  this.query = false;
  this.connecting = ""; // оплата сбербанк

  this.paymentBank = function () {
    // Оплата
    if (!this.query) {
      this.query = true;
      this.statusWaiting = 1; // встатус срабатывания отмены

      this.connecting = sbrf.NFun(7003);

      if (this.connecting === 0) {
        var productSum = parseInt(this.sum + "" + '00');
        sbrf.Sparam('Amount', productSum);
        this.result = sbrf.NFun(4000);
        this.cheque = this.sendSberSlip(sbrf.GParamString('Cheque'));
      } else {
        alert("Пинпад отключился!");
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      }

      sbrf.clear(); // 0 - оплата прошла

      logger("\u041A\u043E\u0434 \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043E\u0442\u0434\u0430\u0435\u0442 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B \u0431\u0430\u043D\u043A\u0430 ".concat(this.result));

      if (this.result == 0 || "".concat(this.result).length > 0) {
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      }
    } else {
      popup("Запрос отправлен!");
    }
  }; // Возврат. В этой функции обязательно использовать банковскую карту гостя


  this.refund = function (idOrder, btn) {
    //передали айди чека и кнопку, на которую нажимали
    var order = subfunc.getOrderObg(7, idOrder);
    var productArr = subfunc.getProductArr(order);

    if (!this.query) {
      this.query = true;
      this.statusWaiting = 1; // статус срабатывания отмены (2 минуты обычно)

      this.connecting = sbrf.NFun(7003);

      if (this.connecting == 0) {
        var productSum = Number(order.orderSumFinal);
        sbrf.Sparam('Amount', parseInt(productSum + "" + '00'));
        this.result = sbrf.NFun(4002);
      } else {
        popup("Пинпад отключился!");
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      }

      sbrf.clear();

      if (sbbank.res == 0) {
        //если возврат успешный
        btn.classList.add('ready-payment');
        btn.textContent = 'Ден. возв.';
        order.status = -1;
        popup("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
        logger("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
        var q = "UPDATE orders SET status = -1 WHERE id = ".concat(Number(order.id));

        try {
          db.query(q);

          if (useAtol && !troubleAtol) {
            // если используется атол
            if (devkkm.printReturtOrder(order, productArr)) {
              popup("\u0427\u0435\u043A ".concat(order.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } else {
              popup("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              troubleAtolCounter += 1;

              if (troubleAtolCounter > 2) {
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
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              }

              ;
            }
          } else if (useAtol === 1 && troubleAtol) {
            popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
            btn.textContent = 'Отменен';
            btn.setAttribute("disabled", "disabled");
          } else {
            var _q = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(order.id));

            try {
              db.query(_q);
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } catch (e) {
              logger("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
              popup("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
            }
          }

          ;
        } catch (e) {
          popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
        }
      } else {
        popup('Возврат остановлен!', true);
      }
    } else {
      popup("Запрос отправлен!");
    }
  }; // Сверка итогов


  this.reconciliation = function () {
    if (!this.query) {
      this.query = true;
      this.connecting = sbrf.NFun(7003);

      if (this.connecting == 0) {
        sbrf.NFun(6000);
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      } else {
        popup("Пинпад отключился!");
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      }

      sbrf.clear();
      this.query = false;
    } else {
      popup("Запрос отправлен!");
    }
  };

  this.sendSberSlip = function (cheque) {
    var splitter = '~S';
    if (!/~S/.test(cheque)) if (/={12,}/.test(cheque)) cheque = cheque.replace(/={12,}/, '~S');
    var lines = [cheque.split(splitter)[0]];
    if (cheque.split(splitter)[1]) if (cheque.split(splitter)[1].length > 0) {
      lines.push(cheque.split(splitter)[1]);
    }
    var slips = [];
    lines.forEach(function (element) {
      var line_element = element;
      line_element = line_element.split('\r\n').filter(function (e) {
        return e;
      });
      if (!line_element || line_element.length < 2) return;
      var json_slip = {
        "type": "nonFiscal",
        "items": []
      };

      if (line_element.length > 1) {
        line_element.forEach(function (line) {
          json_slip.items.push({
            "type": "text",
            "text": line,
            "alignment": "left",
            "doubleWidth": false,
            "doubleHeight": false
          });
        });
      }

      slips.push(json_slip);
    });
    return slips;
  };
}();