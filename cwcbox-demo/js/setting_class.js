"use strict";

var setting = new function () {
  this.setDefauilSetting = function () {
    var ans = dbMethods.getterDb('settings', {
      variable: 'tokenPoint'
    }, 'value')[0];

    if (!ans) {
      dbMethods.setterDb('settings', {
        pointCashbox: null,
        // номер точки
        addressCashbox: '',
        // адресс точки
        tokenPoint: null,
        //токен точки
        tokenWorkdayOnline: null,
        // онлайн токен смены
        tokenWorkdayOffline: null,
        //токен смены онлайн
        barista: null,
        // имя баристы
        employed: 1,
        //трудоустроен
        pincode: null,
        // пинкод под который открыли смену
        darkTheme: 0,
        // темная тема, 1-вкл *
        fiscalPrint: 1,
        // //печатать ли чек *
        useQRcode: 0,
        //  использовать QRcode *
        useTerminal: 0,
        // использовать терминал *
        useWeight: 0,
        // использовать весы
        useAtol: 0,
        //  использовать атол *
        firstSlip: 0,
        //  печать панк слипа *
        secondSlip: 1,
        //  печать второго банк слипа *
        tax: '0',
        // НДС *
        checklist: 0,
        //  использовать чеклисты
        scales: 'COM1',
        //   порт весов *
        mailPoint: 'orders@coffeeway.ru',
        //  адрес почты для отправки чека
        currency: null,
        //  валюта на точке
        roundPrice: 0,
        //  округление до целых 0 округляем 1 не округляем
        subdomain: 'ru',
        // регион
        weekDay: null,
        // день недели
        useKeyboard: 1,
        // использование клавиатуры
        useDisplay: 0,
        // использование дисплея
        tokenQR: null,
        //токен точки для оплаты QR кодом
        keyQR: null,
        // ключ точки для оплаты QR кодом
        troubleAtol: 0,
        // аварийный режим атола
        useToppingMenu: 0,
        // Экран выбора топпинга
        choiceDisplay: 1,
        // Выбор адреса для экрана кухни
        orderKitchen: 0 // чек кухни

      }, 'vertical');
      return;
    }

    if (ans === 'null') {
      dbMethods.setterDb('settings', {
        pointCashbox: null,
        // номер точки
        addressCashbox: '',
        // адресс точки
        tokenPoint: null,
        //токен точки
        tokenWorkdayOnline: null,
        // онлайн токен смены
        tokenWorkdayOffline: null,
        //токен смены онлайн
        barista: null,
        // имя баристы
        employed: 1,
        //трудоустроен
        pincode: null,
        // пинкод под который открыли смену
        darkTheme: 0,
        // темная тема, 1-вкл *
        // fiscalPrint: 0, // //печатать ли чек *
        // useAtol: 0, //  использовать атол *
        // useTerminal: 0,  // использовать терминал *
        // useWeight: 0,  // использовать весы
        // checklist: 0, //  использовать чеклисты
        // firstSlip: 0, //  печать панк слипа *
        // secondSlip: 0,  //  печать второго банк слипа *
        tax: '0',
        // НДС *
        scales: 'COM1',
        //   порт весов *
        mailPoint: 'orders@coffeeway.ru',
        //  адрес почты для отправки чека
        currency: null,
        //  валюта на точке
        roundPrice: 0,
        //  округление до целых 0 округляем 1 не округляем
        subdomain: 'ru',
        // регион
        weekDay: null,
        // день недели
        // useKeyboard: 1, // использование клавиатуры
        // useDisplay: 0,  // использование дисплея смартбар
        tokenQR: null,
        //токен точки для оплаты QR кодом
        keyQR: null,
        // ключ точки для оплаты QR кодом
        troubleAtol: 0 // аварийный режим атола
        // useToppingMenu: 1,  // Экран выбора топпинга
        // choiceDisplay: 1,  // Выбор адреса для экрана кухни
        // orderKitchen: 1,  // чек кухни

      }, 'vertical');
    }

    var troubleAtol = dbMethods.getterDb('settings', {
      variable: 'troubleAtol'
    }, 'value')[0];

    if (!troubleAtol) {
      dbMethods.setterDb('settings', {
        troubleAtol: 0
      }, 'vertical');
    }

    var useToppingMenu = dbMethods.getterDb('settings', {
      variable: 'useToppingMenu'
    }, 'value')[0];

    if (!useToppingMenu) {
      dbMethods.setterDb('settings', {
        useToppingMenu: 0
      }, 'vertical');
    }

    var address = dbMethods.getterDb('settings', {
      variable: 'address'
    }, 'value')[0];

    if (!address) {
      dbMethods.setterDb('settings', {
        addressCashbox: 0
      }, 'vertical');
    }

    var useDisplay = dbMethods.getterDb('settings', {
      variable: 'useDisplay'
    }, 'value')[0];

    if (!useDisplay) {
      dbMethods.setterDb('settings', {
        useDisplay: 0
      }, 'vertical');
    }

    var сhoiseDisplayDb = dbMethods.getterDb('settings', {
      variable: 'choiceDisplay'
    }, 'value')[0];

    if (!сhoiseDisplayDb) {
      dbMethods.setterDb('settings', {
        choiceDisplay: 1
      }, 'vertical');
    }

    var fiscalPrintDb = dbMethods.getterDb('settings', {
      variable: 'fiscalPrint'
    }, 'value')[0];

    if (!fiscalPrintDb) {
      dbMethods.setterDb('settings', {
        fiscalPrint: 0
      }, 'vertical');
    } else {
      var electronicOrderToggle = document.querySelector('#electronic-order-toggle');

      if (fiscalPrintDb == 1) {
        electronicOrderToggle.checked = true;
        fiscalPrint = 1;
      } else {
        fiscalPrint = 0;
        electronicOrderToggle.checked = false;
      }
    }

    if (ans.length > 5) {
      var _subdomain = dbMethods.getterDb('settings', {
        variable: 'subdomain'
      }, 'value')[0];
      setting.updateMenu(ans, _subdomain);
    }
  }; // скрытие и проявление настроек


  this["interface"] = function () {
    settingBtn.addEventListener('click', function () {
      settingRoot.classList.add('setting');
    });
    settingBox.addEventListener('click', function (e) {
      if (!e.target.closest('.setting__card')) {
        settingRoot.classList.remove('setting');
      }
    });
  }; // переключение в режим списания


  this.writeoffMode = function () {
    var writeoffBtn = document.querySelector('#menu-btn-writeoff');
    var style = document.getElementById('style');
    var hta = document.getElementById('hta_id');
    var writeoffMode = false;
    writeoffBtn.addEventListener('click', function (e) {
      clearOrderBtn.click();
      document.getElementById('burger').click();
      var formedOrdersBtn = document.querySelector('#formedOrdersBtn');
      var closeWorkDay = document.querySelector('#menu-btn-exit');

      if (writeoffMode) {
        // обычное
        writeoffMode = false;
        writeOffGlobal = false;
        writeOffGlobalStat = 0;
        hta.removeChild(document.getElementById('writeoff'));
        promocodeInput.classList.remove('imperfection');
        clientInput.classList.remove('imperfection');
        closeWorkDay.classList.remove('imperfection');
        btnQRcode.classList.remove('imperfection');
        formedOrdersBtn.classList.remove('imperfection');
        btnReportX.classList.remove('imperfection');
        btnCashNon.classList.remove('imperfection');
        btnWriteoff.style.display = 'none';
        btnCash.style.display = 'block';
      } else {
        writeoffMode = true;
        writeOffGlobal = true;
        writeOffGlobalStat = 1;
        var link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "css/writeoff.css";
        link.id = 'writeoff';
        hta.insertBefore(link, style.nextSibling);
        promocodeInput.classList.add('imperfection');
        clientInput.classList.add('imperfection');
        btnQRcode.classList.add('imperfection');
        formedOrdersBtn.classList.add('imperfection');
        closeWorkDay.classList.add('imperfection');
        btnReportX.classList.add('imperfection');
        btnCashNon.classList.add('imperfection');
        btnCash.style.display = 'none';
        btnWriteoff.style.display = 'block';
      }
    });
  }; // кнопка использования атола


  this.useAtol = function () {
    try {
      devkkm.init();
      logger('Фискальник инициализован');
    } catch (e) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0438\u0446\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u0438\u043A\u0430 ".concat(e.message));

      if (typeof FRconsole != 'undefined') {
        FRconsole.value += "Ошибка ФР библиотеки!" + e.message + " \n";
      }
    }

    var useAtolBtn = document.querySelector('#atol-us');
    var markerToggle = document.querySelector('#atol-us-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useAtol'
    }, 'value')[0];
    useAtol = Number(ans);

    if (useAtol === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useAtolBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Атол отключён');
        useAtol = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useAtol'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Атол включён');
        useAtol = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useAtol'
        });
      }
    });
  };

  this.troubleAtol = function () {
    // проверка на наличие не синхронизированных чеков
    if (useAtol) {
      subfunc.qualitativeSynchronizer();
      var order = false;
      var productArr = false;
      order = subfunc.getOrderObg(1);

      if (order) {
        productArr = subfunc.getProductArr(order);

        if (productArr) {
          troubleAtol = 1;
          document.querySelector('#trouble-atol-toggle').checked = true;
          telegramNote('Аварийный режим атола включён');
          dbMethods.updateDb('settings', {
            value: 1
          }, {
            variable: 'troubleAtol'
          });
          popup('отправка чека на печать');
          logger("194\u0441\u0442 \u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id));

          if (devkkm.openOrder(order, productArr)) {
            var q = "UPDATE orders SET status = 2 WHERE id = ".concat(order.id);
            postman.displayOrder(order, productArr);

            try {
              db.query(q);
              devkkm.printOrder(order, productArr);
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id)); // и пробуем новый чек отправить

              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 12777);
            } catch (e) {
              popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
              logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
            }
          } else {
            popup('печать чека не удалась, проверьте фискальный регистратор и перезапустите кассу(закрыть 2 окна)! ');
            clearTimeout(delayPostmanAtolOrder);
            delayPostmanAtolOrder = setTimeout(postman.atolOrder, 15777);
          }
        } else {
          popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443 ".concat(order.id, ". \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0442\u043E\u0440 \u0447\u0435\u043A\u043E\u0432 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"));
        }
      } else {
        order = subfunc.getOrderObg(-1);

        if (order) {
          logger("219\u0441\u0442 \u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id));
          productArr = subfunc.getProductArr(order);

          if (productArr) {
            troubleAtol = 1;
            document.querySelector('#trouble-atol-toggle').checked = true;
            telegramNote('Аварийный режим атола включён');
            dbMethods.updateDb('settings', {
              value: 1
            }, {
              variable: 'troubleAtol'
            });
            popup('отправка чека на печать возврата');

            if (devkkm.printReturtOrder(order, productArr)) {
              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 12777);
            } else {
              popup('печать возврата чека не удалась, проверьте фискальный регистратор!');
              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 15777);
            }
          } else {
            popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443 ".concat(order.id, ". \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0442\u043E\u0440 \u0447\u0435\u043A\u043E\u0432 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"));
          }
        } else {
          troubleAtol = 0;
          document.querySelector('#trouble-atol-toggle').checked = false;
          dbMethods.updateDb('settings', {
            value: 0
          }, {
            variable: 'troubleAtol'
          });
          popup('Синхронизация остановлена, касса переведена в безаварийный режим');
        }
      }
    }

    var troubleAtolBtn = document.querySelector('#trouble-atol');
    var markerToggle = document.querySelector('#trouble-atol-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'troubleAtol'
    }, 'value')[0];
    troubleAtol = Number(ans);

    if (troubleAtol === 1) {
      markerToggle.checked = true;
      postman.atolOrder();
    } else {
      markerToggle.checked = false;
    }

    troubleAtolBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Аварийный режим атола отключён');
        troubleAtol = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'troubleAtol'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Аварийный режим атола включён');
        troubleAtol = 1;
        postman.atolOrder();
        document.querySelector('#trouble-atol-toggle').checked = true;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'troubleAtol'
        });
      }
    });
  }; // кнопка использования QRcode


  this.QRcode = function () {
    var useQRcodeBtn = document.querySelector('#QRcode');
    var markerToggle = document.querySelector('#QRcode-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useQRcode'
    }, 'value')[0];
    useQRcode = Number(ans);

    if (useQRcode === 1) {
      markerToggle.checked = true;
      qrButtonGlobal.classList.remove('hidden');
    } else {
      markerToggle.checked = false;
      qrButtonGlobal.classList.add('hidden');
    }

    useQRcodeBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        qrButtonGlobal.classList.add('hidden');
        telegramNote('QR-code отключён');
        useQRcode = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useQRcode'
        });
      } else {
        markerToggle.checked = true;
        qrButtonGlobal.classList.remove('hidden');
        telegramNote('QR-code включён');
        useQRcode = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useQRcode'
        });
      }
    });
  };

  this.showQRcode = function (show) {
    if (qrSumGlobal.length > 0 && qrReturnGlobal.length > 0) {
      if (show) {
        qrSumGlobal.forEach(function (i) {
          i.closest('.info__item').classList.remove('hidden');
        });
        qrReturnGlobal.forEach(function (i) {
          i.closest('.info__item').classList.remove('hidden');
        });
      } else {
        qrSumGlobal.forEach(function (i) {
          i.closest('.info__item').classList.add('hidden');
        });
        qrReturnGlobal.forEach(function (i) {
          i.closest('.info__item').classList.add('hidden');
        });
      }
    }
  }; // кнопка использования терминала


  this.useTerminal = function () {
    var useTerminalBtn = document.querySelector('#terminal-us');
    var markerToggle = document.querySelector('#terminal-us-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useTerminal'
    }, 'value')[0];
    useTerminal = Number(ans);

    if (useTerminal === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useTerminalBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote("\u0422\u0435\u0440\u043C\u0438\u043D\u0430\u043B \u043E\u0442\u043A\u043B\u044E\u0447\u0451\u043D");
        useTerminal = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useTerminal'
        });
      } else {
        markerToggle.checked = true;
        telegramNote("\u0422\u0435\u0440\u043C\u0438\u043D\u0430\u043B \u0432\u043A\u043B\u044E\u0447\u0451\u043D");
        useTerminal = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useTerminal'
        });
      }
    });
  }; // кнопка использования терминала


  this.useWeight = function () {
    var useWeightBtn = document.querySelector('#weight-us');
    var markerToggle = document.querySelector('#weight-us-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useWeight'
    }, 'value')[0];
    useWeight = Number(ans);

    if (useWeight === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useWeightBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Весы отключёны');
        useWeight = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useWeight'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Весы включёны');
        useWeight = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useWeight'
        });
      }
    });
  }; // день недели


  this.weekDay = function () {
    var date = new Date();
    var curWeekDay = Number(date.getDay());
    curWeekDay = curWeekDay - 1 < 0 ? 0 : curWeekDay - 1;
    weekDay = curWeekDay;
    dbMethods.updateDb('settings', {
      value: weekDay
    }, {
      variable: 'weekDay'
    });
  };

  this.firstSlip = function () {
    var firstSlipBtn = document.querySelector('#first-slip');
    var markerToggle = document.querySelector('#first-slip-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'firstSlip'
    }, 'value')[0];
    firstSlip = Number(ans);

    if (firstSlip === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    firstSlipBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        firstSlip = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'firstSlip'
        });
      } else {
        markerToggle.checked = true;
        firstSlip = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'firstSlip'
        });
      }
    });
  };

  this.secondSlip = function () {
    var secondSlipBtn = document.querySelector('#second-slip');
    var markerToggle = document.querySelector('#second-slip-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'secondSlip'
    }, 'value')[0];
    secondSlip = Number(ans);

    if (secondSlip === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    secondSlipBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        secondSlip = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'secondSlip'
        });
      } else {
        markerToggle.checked = true;
        secondSlip = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'secondSlip'
        });
      }
    });
  };

  this.fiscalPrint = function () {
    var electronicOrderToggle = document.querySelector('#electronic-order-toggle');
    var electronicOrderBtn = document.querySelector('#electronic-order'); // electronicOrderToggle.checked = false;

    electronicOrderBtn.addEventListener('click', function (e) {
      if (electronicOrderToggle.checked) {
        electronicOrderToggle.checked = false;
        fiscalPrint = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'fiscalPrint'
        });
      } else {
        electronicOrderToggle.checked = true;
        fiscalPrint = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'fiscalPrint'
        });
      }
    });
  };

  this.checklist = function () {
    var checklistBtn = document.querySelector('#use-checklist');
    var markerToggle = document.querySelector('#use-checklist-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'checklist'
    }, 'value')[0];
    useChecklist = Number(ans);

    if (useChecklist == 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    checklistBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Чеклисты отключёны');
        useChecklist = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'checklist'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Чеклисты включёны');
        useChecklist = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'checklist'
        });
      }
    });
  };

  this.mailPoint = function () {
    var mailPointWrap = document.querySelector('#mail-point-wrap');
    var mailPointBtn = document.querySelector('#mail-point-btn');
    var mailPointMailBtn = document.querySelector('#mail-point-mail-btn');
    var mailPointInput = document.querySelector('#mail-point-input');
    var ans = dbMethods.getterDb('settings', {
      variable: 'mailPoint'
    }, 'value')[0];
    mailPoint = ans;
    mailPointBtn.textContent = mailPoint; // появление ввода почты

    mailPointBtn.addEventListener('click', function (e) {
      e.target.closest('.setting__card').classList.add('setting__card_transparent');
      mailPointWrap.classList.add('setting__item_active-mail');
    }); // скрытие ввода при любом клике кроме как на инпут

    window.addEventListener('click', function (e) {
      if (!e.target.closest('#mail-point-btn') && !e.target.matches('.setting__input') && !e.target.closest('.keyboard')) {
        mailPointWrap.classList.remove('setting__item_active-mail');
      }
    });
    mailPointMailBtn.addEventListener('click', function (e) {
      mailPoint = mailPointInput.value.trim();
      mailPointBtn.textContent = mailPoint;
      dbMethods.updateDb('settings', {
        value: mailPoint
      }, {
        variable: 'mailPoint'
      });
    });
  };

  this.scalesPort = function () {
    var btnScalesList = document.querySelectorAll('.dropdown__item-btn_scales');
    var btnScalesArr = Array.prototype.slice.call(btnScalesList); // делает привычный массив из нодлиста

    var textInfoBtn = document.querySelector('#scales-display-info');
    var ans = dbMethods.getterDb('settings', {
      variable: 'scales'
    }, 'value')[0];
    scales = ans;
    textInfoBtn.textContent = scales;
    btnScalesArr.forEach(function (e) {
      e.addEventListener('click', function (e) {
        scales = e.textContent;
        textInfoBtn.textContent = scales;
        dbMethods.updateDb('settings', {
          value: scales
        }, {
          variable: 'scales'
        });
      });
    });
  };

  this.globalVariables = function () {
    var ans, q;
    q = "SELECT value FROM settings WHERE variable = 'pointCashbox' or variable = 'tokenPoint' or variable = 'tokenWorkdayOnline' or variable = 'tokenWorkdayOffline' or variable = 'barista' or variable = 'employed' or variable = 'subdomain' or variable = 'currency' or variable = 'tokenQR' or variable = 'keyQR'";
    ans = db.query(q); // alert(JSON.stringify(ans)) // 9 раз

    pointCashbox = ans[0].value;
    tokenPoint = ans[1].value;
    idworkdayOnline = ans[2].value;
    idworkdayOffline = ans[3].value;
    barista = ans[4].value;
    employed = ans[5].value;
    currency = ans[6].value;
    subdomain = ans[7].value;

    try {
      tokenQR = ans[8].value; //токен точки для оплаты QR кодом
    } catch (_unused) {}

    try {
      keyQR = ans[9].value; //токен точки для оплаты QR кодом
    } catch (_unused2) {}

    try {
      orderKitchen = ans[10].value; //токен точки для оплаты QR кодом
    } catch (_unused3) {}
  }; // клавиатура


  this.useKeyboard = function () {
    var useKeyboardBtn = document.querySelector('#keyboard-use');
    var markerToggle = document.querySelector('#keyboard-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useKeyboard'
    }, 'value')[0];
    useKeyboard = Number(ans);

    if (useKeyboard === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useKeyboardBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        useKeyboard = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useKeyboard'
        });
      } else {
        markerToggle.checked = true;
        useKeyboard = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useKeyboard'
        });
      }
    });
  }; // экран кухни


  this.useDisplay = function () {
    var useDisplayBtn = document.querySelector('#btn-use-display');
    var markerToggle = document.querySelector('#use-display-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useDisplay'
    }, 'value')[0];
    useDisplayOrder = Number(ans);

    if (useDisplayOrder === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useDisplayBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Экран кухни отключён');
        useDisplayOrder = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useDisplay'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Экран кухни включён');
        useDisplayOrder = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useDisplay'
        });
      }
    });
  }; // чек кухни


  this.orderKitchen = function () {
    var orderKitchenBtn = document.querySelector('#order-kitchen');
    var markerToggle = document.querySelector('#order-kitchen-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'orderKitchen'
    }, 'value')[0];
    orderKitchen = Number(ans);

    if (orderKitchen === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    orderKitchenBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Чек кухни отключён');
        orderKitchen = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'orderKitchen'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Чек кухни включён');
        orderKitchen = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'orderKitchen'
        });
      }
    });
  }; // адресс экрана кухни


  this.choiceDisplay = function () {
    var useDisplayBtn = document.querySelector('#btn-choiсe-display');
    var markerToggle = document.querySelector('#choiсe-display-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'choiceDisplay'
    }, 'value')[0];
    choiceDisplay = Number(ans);

    if (choiceDisplay === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    try {
      var iStream = fso.OpenTextFile("smartbar_config.json", 1, false);

      if (iStream) {
        var data = iStream.ReadLine(); // Usually looped for several lines

        iStream.Close();
        data = JSON.parse(data);
        displayAddress = Number(choiceDisplay) === 1 ? data[0] : data[1];
      } else {
        s;
        displayAddress = 'http://localhost/json.php';
      }
    } catch (error) {
      displayAddress = 'http://localhost/json.php';
    }

    useDisplayBtn.addEventListener('click', function (e) {
      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Адресс экрана кухни сменили на дополнительный');
        choiceDisplay = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'choiceDisplay'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Адресс экрана кухни сменили на основной');
        choiceDisplay = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'choiceDisplay'
        });
      }

      try {
        var _iStream = fso.OpenTextFile("smartbar_config.json", 1, false);

        if (_iStream) {
          var _data = _iStream.ReadLine(); // Usually looped for several lines


          _iStream.Close();

          _data = JSON.parse(_data);
          displayAddress = Number(choiceDisplay) === 1 ? _data[0] : _data[1];
        } else {
          displayAddress = 'http://localhost/json.php';
        }
      } catch (error) {
        displayAddress = 'http://localhost/json.php';
      }
    });
  }; // экран выбора сиропа


  this.useToppingMenu = function () {
    var useToppingMenuBtn = document.querySelector('#btn-use-toppings');
    var markerToggle = document.querySelector('#use-toppings-toggle');
    var ans = dbMethods.getterDb('settings', {
      variable: 'useToppingMenu'
    }, 'value')[0];
    useToppingMenu = Number(ans);

    if (useToppingMenu === 1) {
      markerToggle.checked = true;
    } else {
      markerToggle.checked = false;
    }

    useToppingMenuBtn.addEventListener('click', function (e) {
      clearOrderBtn.click();

      if (markerToggle.checked) {
        markerToggle.checked = false;
        telegramNote('Экран кухни отключён');
        useToppingMenu = 0;
        dbMethods.updateDb('settings', {
          value: 0
        }, {
          variable: 'useToppingMenu'
        });
      } else {
        markerToggle.checked = true;
        telegramNote('Экран кухни включён');
        useToppingMenu = 1;
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'useToppingMenu'
        });
      }
    });
  }; // получить меню c Api


  this.getMenu = function (token, subdomain) {
    return new Promise(function (resolve, reject) {
      ieFetch({
        method: 'POST',
        url: api + "api/terminal/menu?" + "subdomain=".concat(subdomain, "&token=").concat(token) // https://bridge.cwsystem.ru/engine/kassa/popularproducts/popular

      }).then(function (json) {
        var res = JSON.parse(json);
        if (!res) reject('Пустой ответ в getMenu');

        if (res.type === 'error') {
          reject(res.data.msg);
          return;
        }

        if (res.type === 'success' && res.data.length > 0) {
          try {
            resolve(res);
          } catch (error) {
            reject('Ошибка при получении тех карт');
          }
        }
      })["catch"](function (e) {
        reject('Сетевая ошибка в getMenu\n' + "".concat(JSON.stringify(e)));
      });
    });
  };

  this.updateMenu = function (tokenPoint, subdomain) {
    var _this = this;

    // получение и перезапись меню
    setting.globalVariables();

    if (tokenPoint.length > 0) {
      this.getMenu(tokenPoint, subdomain).then(function (res) {
        if (res) {
          try {
            getDiscounts(tokenPoint, subdomain)["catch"](function () {
              // получение скидок и обновление дб
              popup('Ошибка при обновлении скидок');
            }); //1.2

            if (res.hasOwnProperty('data')) {
              if (res.data.length > 0) {
                var menu = JSON.stringify(res);
                menuApp.writeJson('menuDb', menu);
              }
            }

            _this.getPopularMenu(tokenPoint, pointCashbox).then(function (resp) {
              try {
                if (resp.type == 'success') {
                  popularArray = resp.data;
                } else {
                  popularArray = [];
                }

                preloader.preloaderOff();
              } catch (error) {
                popup('Не удалось получить популярное меню');
                preloader.preloaderOff();
                popularArray = [];
              }
            });
          } catch (error) {
            alert(error.message);
          }
        }
      })["catch"](function (e) {
        // если получить меню онлайн не удалось:
        var message = JSON.stringify(e);
        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 getMenu ".concat(message));
      });
    }
  };

  this.getPopularMenu = function (tokenPoint, pointCashbox) {
    return new Promise(function (resolve, reject) {
      ieFetch({
        method: 'POST',
        url: "https://bridge.cwsystem.ru/engine/kassa/popularproducts/popular?" + "token=".concat(tokenPoint, "&point=").concat(pointCashbox) // https://bridge.cwsystem.ru/engine/kassa/popularproducts/popular

      }).then(function (json) {
        var res = JSON.parse(json);
        if (!res) reject('Пустой ответ в getPopularMenu');

        if (res.type === 'error') {
          reject(res.data.msg);
          return;
        }

        if (res.type === 'success') {
          try {
            resolve(res);
          } catch (error) {
            reject('Ошибка при получении тех карт');
          }
        }
      })["catch"](function (e) {
        reject('Сетевая ошибка в getPopularMenu\n' + "".concat(JSON.stringify(e)));
      });
    });
  };
}();