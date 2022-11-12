"use strict";

// функция обработчик ошибок
function thr(msg) {
  this.message = msg;

  this.toString = function () {
    return this.message;
  };
}

; // класс kkm (контрольно кассовая машина)

var devkkm = new function kkm() {
  var _this3 = this;

  this.Fptr = null; // переменная из настроек атола к которой все подвязывается

  this.fptrInit = false;
  this.vers = null; //версия

  this.param = {}; // объект параметра
  // функция иницилизации

  this.init = function () {
    popup('инициализация  атола');

    try {
      if (this.fptrInit != false) {
        popup('Пересоздание подключения к фискальнику');
        this.Fptr.destroy();
      }

      this.Fptr = null; // переменная из настроек атола к которой все подвязывается

      this.Fptr = new ActiveXObject("AddIn.Fptr10");
      this.fptrInit = true;
      popup('инициализация  атола прошла успешно');
    } catch (e) {
      popup('инициализация  атола не удалась' + e.message);
      logger("\u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F  \u0430\u0442\u043E\u043B\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C ".concat(e.message));
    }

    this.vers = this.Fptr.Version();
    logger("\u0432\u0435\u0440\u0441\u0438\u044F \u0430\u0442\u043E\u043B\u0430 =  ".concat(this.vers));
    this.Fptr.open();
    this.getAllParams(); //взять параметры

    try {
      this.Fptr.Version();
    } catch (e) {
      popup('взять параметры атола не удалось' + e.message);
      logger("\u0432\u0437\u044F\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0430\u0442\u043E\u043B\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C ".concat(this.vers));
    }
  }; // функция которая берет все параметры для работы фискальника


  this.getAllParams = function () {
    // все что большими бунквами это параметры атола
    // Короткий запрос статуса ККТ
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_STATUS); //тип загружаемых данных LIBFPTR_PARAM_DATA_TYPE

    this.Fptr.queryData(); //запрос который прописан в инструкции

    this.param.operatorID = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_OPERATOR_ID); // Номер кассира

    this.param.logicalNumber = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_LOGICAL_NUMBER); // Номер ККТ в магазине

    this.param.shiftState = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_STATE); // Состояние смены

    this.param.model = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_MODEL); //Номер модели ККТ

    this.param.mode = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_MODE); // Режим ККТ

    this.param.submode = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SUBMODE); // Подрежим ККТ

    this.param.receiptNumber = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_NUMBER); // Номер чека (внутренний счетчик ККТ)

    this.param.documentNumber = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_DOCUMENT_NUMBER); // Номер документа (внутренний счетчик ККТ)

    this.param.shiftNumber = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_NUMBER); // Номер открытой смены или номер последней закрытой смены + 1

    this.param.receiptType = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE); // Тип открытого чека

    this.param.documentType = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_DOCUMENT_TYPE); // Тип открытого документа

    this.param.lineLength = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_LINE_LENGTH); // Ширина чековой ленты, симв.

    this.param.lineLengthPix = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_LINE_LENGTH_PIX); // Ширина чековой ленты, пикс.

    this.param.receiptSum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_RECEIPT_SUM); // Сумма текущего чека

    this.param.isFiscalDevice = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FISCAL); // Флаг регистрации ККТ

    this.param.isFiscalFN = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FN_FISCAL); // Флаг фискализации ФН

    this.param.isFNPresent = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FN_PRESENT); // Флаг наличия ФН в ККТ

    this.param.isInvalidFN = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_INVALID_FN); // Флаг корректности ФН

    this.param.isCashDrawerOpened = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_CASHDRAWER_OPENED); // Денежный ящик открыт

    this.param.isPaperPresent = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_RECEIPT_PAPER_PRESENT); // Наличие бумаги

    this.param.isPaperNearEnd = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PAPER_NEAR_END); // Бумага скоро закончится

    this.param.isCoverOpened = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_COVER_OPENED); // Крышка открыта

    this.param.isPrinterConnectionLost = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_CONNECTION_LOST); // Потеряно соединение с печатным механизмом

    this.param.isPrinterError = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_ERROR); // Невосстановимая ошибка печатного механизма

    this.param.isCutError = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_CUT_ERROR); // Ошибка отрезчика

    this.param.isPrinterOverheat = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_OVERHEAT); // Перегрев печатного механизма

    this.param.isDeviceBlocked = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_BLOCKED); // ККТ заблокирована из-за ошибок

    this.param.dateTime = this.Fptr.getParamDateTime(this.Fptr.LIBFPTR_PARAM_DATE_TIME); // Дата и время ККТ

    this.param.serialNumber = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_SERIAL_NUMBER); // Заводской номер ККТ

    this.param.modelName = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_MODEL_NAME); // Название ККТ

    this.param.firmwareVersion = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_UNIT_VERSION); // Версия ПО ККТ
  }; //вписать геттер который берет имя баристы


  this.cashierinn = ''; //инн кассира пока пустым остается
  // это проверка состояния смены

  this.checkState = function () {
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_SHIFT_STATE); //передается состояние смены и тип загружаемых данных-IBFPTR_PARAM_DATA_TYPE

    if (this.Fptr.queryData() != 0) {
      // статус ккт не 0
      // /обработчик ошибок
      var eDesc = this.Fptr.errorDescription(); //текст ошибки

      logger("\u0442\u0435\u043A\u0441\u0442 \u043E\u0448\u0438\u0431\u043A\u0438 \u0432 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0441\u043C\u0435\u043D\u044B =  ".concat(eDesc));

      switch (eDesc) {
        // ниодна кодировка не дала посмотреть что тут
        case "Соединение не установлено":
          try {
            devkkm.init();
          } catch (error) {}

          throw new thr("\n Соединение с фискальным регистратором не установлено, \n проверьте питание, включен он и нормально вставлен кабель!");
          break;

        default:
          logger(" \u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0441\u043C\u0435\u043D\u044B  ".concat(JSON.stringify(eDesc)));
          popup(JSON.stringify(eDesc));

          try {
            devkkm.init();
          } catch (error) {} // throw new thr(eDesc);


          break;
      }
    }

    var state = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_STATE); // Состояние смены

    logger("\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u043C\u0435\u043D\u044B =  ".concat(state)); //проверяем состояние смены

    switch (state) {
      // если истекла то мы закрываем смену на фискальнике
      case this.Fptr.LIBFPTR_SS_EXPIRED:
        this.closeWorkday();
        break;
    }
  }; // закрытие смены


  this.closeWorkday = function () {
    //функция закрытия смены
    try {
      logger("\u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u043C\u0435\u043D\u044B: \u043A\u0430\u0441\u0441\u0438\u0440 ".concat(barista));

      if (employed > 0) {
        this.Fptr.setParam(1021, barista);
        this.Fptr.setParam(1203, this.cashierinn);
      } else {
        this.Fptr.setParam(1021, '');
        this.Fptr.setParam(1203, '');
      }

      this.Fptr.operatorLogin();
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_REPORT_TYPE, this.Fptr.LIBFPTR_RT_CLOSE_SHIFT); // Состояние смены

      this.Fptr.report();
      this.Fptr.checkDocumentClosed();
    } catch (e) {
      logger("\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u043C\u0435\u043D\u044B =  ".concat(JSON.stringify(e)));

      try {
        devkkm.init();
      } catch (error) {}

      throw new thr('Не удалось закрыть смену!');
    }
  }; // ПЕЧАТЬ! X отчета


  this.ReportX = function () {
    try {
      // тут поидее строка которая его и вызывает
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_REPORT_TYPE, this.Fptr.LIBFPTR_RT_X);

      if (this.Fptr.report() < 0) {// this.Fptr.raise(); //ошибка вызова драйвера
      }
    } catch (e) {
      popup('Ошибка в kkm>ReportX' + e.message);
      logger("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u043F\u0435\u0447\u0430\u0442\u0430\u0442\u044C \u0425 \u041E\u0442\u0447\u0435\u0442 =  ".concat(e.message));
      throw new thr('Не удалось напечатать Х Отчет!');
    }
  }; // печать последнего чека


  this.lastOrder = function () {
    try {
      // тут поидее строка которая его и вызывает
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_REPORT_TYPE, this.Fptr.LIBFPTR_RT_LAST_DOCUMENT);

      if (this.Fptr.report() < 0) {// this.Fptr.raise();
      }
    } catch (e) {
      popup('Ошибка в kkm>lastOrder' + e.message);
      logger("\u041F\u0435\u0447\u0430\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0447\u0435\u043A\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C!' =  ".concat(e.message));
      throw new thr('Печать последнего чека не удалась!');
    }
  }; // взять время с атола


  this.atolTime = function () {
    var dateTime;

    try {
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_DATE_TIME);
      this.Fptr.queryData();
      dateTime = this.Fptr.getParamDateTime(this.Fptr.LIBFPTR_PARAM_DATE_TIME);
    } catch (e) {
      dateTime = -1;
    }

    return dateTime;
  }; //тут функция с открытием чека


  this.openOrder = function (order) {
    try {
      var text = '';

      if (fiscalPrint != 1) {
        if (order.nameClient == ' ') {
          text = "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435";
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
          this.Fptr.printText();
        } else {
          text = "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 ".concat(order.nameClient);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
          this.Fptr.printText();
        }

        text = "\n \u0412\u0430\u0448 \u043D\u043E\u043C\u0435\u0440 \u0437\u0430\u043A\u0430\u0437\u0430:\n";
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
        this.Fptr.printText();
        text = "".concat(subfunc.orderIfFormat(order.id), "\n");
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, true);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
        this.Fptr.printText();
      }

      try {
        this.checkState(); //проверка состояния смены
      } catch (e) {
        // какая то ошибка на статусе чека
        logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u043D\u0430 \u0441\u0442\u0430\u0442\u0443\u0441\u0435 \u0447\u0435\u043A\u0430 ".concat(JSON.stringify(order), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
        return false;
      }

      logger("\u0442\u0440\u0443\u0434\u043E\u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E =  ".concat(employed));
      logger("\u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0447\u0435\u043A\u0430: \u043A\u0430\u0441\u0441\u0438\u0440 ".concat(order.barista, " \u043F\u043E\u0447\u0442\u0430 ").concat(order.email, " fiscalPrint = ").concat(order.fiscalPrint, " "));

      if (employed > 0) {
        if (order.barista) {
          this.Fptr.setParam(1021, order.barista);
        }

        this.Fptr.setParam(1203, this.cashierinn);
      } else {
        this.Fptr.setParam(1021, '');
        this.Fptr.setParam(1203, '');
      }

      this.Fptr.operatorLogin();

      if (order.email) {
        this.Fptr.setParam(1008, order.email);
      } else {
        this.Fptr.setParam(1008, 'orders@coffeeway.ru');
      }

      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL); // Открытие электронного чека

      var value = false;

      if (fiscalPrint == 1) {
        value = true;
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, value);
      }

      this.Fptr.openReceipt();
      logger("\u0443\u0434\u0430\u0447\u043D\u043E\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0447\u0435\u043A\u0430: \u043A\u0430\u0441\u0441\u0438\u0440 ".concat(JSON.stringify(order), " "));
      return true;
    } catch (e) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(JSON.stringify(order), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message, " "));
      return false;
    }
  }; //функция с возвратом чека


  this.openReturnOrder = function (order) {
    logger(" \u0432\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430: \u0442\u0440\u0443\u0434\u043E\u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E ".concat(employed, " \u043A\u0430\u0441\u0441\u0438\u0440 ").concat(order.barista, " \u043F\u043E\u0447\u0442\u0430 ").concat(order.email, " fiscalPrint = ").concat(order.fiscalPrint, " "));

    if (employed > 0) {
      if (barista) {
        this.Fptr.setParam(1021, order.barista);
      }

      this.Fptr.setParam(1203, this.cashierinn);
    } else {
      this.Fptr.setParam(1021, '');
      this.Fptr.setParam(1203, '');
    }

    this.Fptr.setParam(1008, order.email);
    this.Fptr.operatorLogin();
    var value = false;
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL_RETURN);

    if (fiscalPrint == 0) {
      value = true;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, value); //тру вписать в переменную
    }

    this.Fptr.openReceipt();
  }; // отмена чека


  this.CANCELCheck = function () {
    this.Fptr.cancelReceipt();
  }; // добавление позиций


  this.addPosition = function (name, priceFinal, amount, tax, bulkvalue, bulkunits) //Название позиции, цена, количество
  {
    if (amount % 1 != 0) {
      var newAmount = Number(amount) * 1000;
      var newPrice = Math.floor(Number(priceFinal) * Number(amount));
      var newName = name + ' ' + newAmount + 'гр';
      name = newName;
      priceFinal = newPrice;
      amount = 1;
    }

    name += ' ' + bulkvalue + bulkunits;
    logger("\u043F\u043E\u0437\u0438\u0446\u0438\u044F \u0432 \u0447\u0435\u043A\u0435: ".concat(name, "  ").concat(priceFinal, "  ").concat(amount));
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, name);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PRICE, priceFinal);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_QUANTITY, amount); // номер налоговой ставки

    var tp = this.Fptr.LIBFPTR_TAX_NO; // по умолчанию не облагается

    switch (tax) {
      default:
        break;

      case 0:
        tp = this.Fptr.LIBFPTR_TAX_NO;
        break;
      // не облагается

      case 1:
        tp = this.Fptr.LIBFPTR_TAX_VAT10;
        break;
      // НДС 10%

      case 2:
        tp = this.Fptr.LIBFPTR_TAX_VAT110;
        break;
      // НДС рассчитанный 10/110

      case 3:
        tp = this.Fptr.LIBFPTR_TAX_VAT0;
        break;
      // НДС 0%

      case 4:
        tp = this.Fptr.LIBFPTR_TAX_VAT20;
        break;
      // НДС 20%

      case 5:
        tp = this.Fptr.LIBFPTR_TAX_VAT120;
        break;
      // НДС рассчитанный 20/120
    } // Установка целочисленного параметра


    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TAX_TYPE, tp); //fptr.LIBFPTR_TAX_VAT0

    this.Fptr.registration();
  }; // проверка закрытия чека


  this.chekClosedOrder = function (chtype) {
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var order = arguments.length > 2 ? arguments[2] : undefined;
    var productArr = arguments.length > 3 ? arguments[3] : undefined;

    //chtype - наличными или картой 1-безнал 0-нал
    if (chtype == 1) {
      popup('оплата безналичными');
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
    }

    if (chtype == 2) {
      popup('оплата QR кодом');
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
    }

    if (chtype == 0) {
      popup('оплата наличными');
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_CASH);
    }

    this.Fptr.closeReceipt(); //

    if (this.Fptr.checkDocumentClosed() != 0) {
      // Не удалось проверить состояние документа. Вывести пользователю текст ошибки, попросить устранить неполадку и повторить запрос
      //alert(this.Fptr.checkDocumentClosed());
      logger(" \u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0447\u0435\u043A\u0430  ".concat(this.Fptr.errorDescription()));
      throw new thr(this.Fptr.errorDescription()); //alert(this.Fptr.errorDescription());
    }

    if (!this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_DOCUMENT_CLOSED)) {
      // Документ не закрылся. Требуется его отменить (если это чек) и сформировать заново
      this.Fptr.cancelReceipt();
      var errorMessage = this.Fptr.errorDescription();

      if (errorMessage === 'Смена превысила 24 часа') {
        telegramNote("\u0421\u043C\u0435\u043D\u0430 \u043F\u0440\u0435\u0432\u044B\u0441\u0438\u043B\u0430 24 \u0447\u0430\u0441\u0430", '1385389369');
        this.closeWorkday();
      }

      throw new thr("Документ не закрылся! Попробуйте закрыть еще раз! \n Если проблема возникла не первый раз, перезапустите фискальный регистратор \n (выключаем на минуту и включаем). \n Возможная ошибка: " + errorMessage); //'Не удалось напечатать документ (Ошибка "' + this.Fptr.errorDescription() + '"). Устраните неполадку и повторите.');
    }

    if (!this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_DOCUMENT_PRINTED)) {
      // Можно сразу вызвать метод допечатывания документа, он завершится с ошибкой, если это невозможно
      if (this.Fptr.continuePrint() != 0) {
        // Если не удалось допечатать документ - показать пользователю ошибку и попробовать еще раз.
        var _errorMessage = this.Fptr.errorDescription();

        logger(" \u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0447\u0435\u043A\u0430  ".concat(_errorMessage));
        throw new thr('Не удалось напечатать документ (Ошибка "' + _errorMessage + '"). Устраните неполадку и повторите.'); //alert('Не удалось напечатать документ (Ошибка "' + this.Fptr.errorDescription() + '"). Устраните неполадку и повторите.');
        // Fptr.logWrite("FiscalPrinter", Fptr.LIBFPTR_LOG_ERROR, "Не удалось напечатать документ (Ошибка \"" + Fptr.errorDescription() + "\"). Устраните неполадку и повторите.");
      }
    }

    try {
      logger("------ \u0427\u0435\u043A ".concat(id, " \u0437\u0430\u043A\u0440\u044B\u0442 --------"));

      try {
        if (orderKitchen && order && productArr) {
          this.orderKitchen(order, productArr);
        }
      } catch (error) {
        logger("------ \u0427\u0435\u043A ".concat(id, " orderKitchen \u043E\u0448\u0438\u0431\u043A\u0430"));
      }

      return true;
    } catch (error) {}
  }; // печать чека


  this.printOrder = function (order, productArr) {
    var _this = this;

    try {
      popup("\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0447\u0435\u043A\u0430 id ".concat(order.id));
      logger("\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0447\u0435\u043A\u0430 id ".concat(order.id, " \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043D\u0430 \u0430\u0442\u043E\u043B")); // напихивваем товары

      productArr.forEach(function (e) {
        _this.addPosition(e.name, Number(e.priceFinal), Number(e.amount), 0, e.bulkvalue, e.bulkuntils);
      }); // все товары накинули и закрыли чек

      if (this.chekClosedOrder(order.chtype, order.id, order, productArr)) {
        //если всё удачно- меняем статус
        troubleAtolCounter = 0;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      popup("\u041E\u0428\u0418\u0411\u041A\u0410 \u0424\u0418\u0421\u041A\u0410\u041B\u042C\u041D\u041E\u0413\u041E \u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0410\u0422\u041E\u0420\u0410 \u0432 \u0447\u0435\u043A\u0435 \u0441 id ".concat(order.id, " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
      logger("\u041E\u0428\u0418\u0411\u041A\u0410 \u0424\u0418\u0421\u041A\u0410\u041B\u042C\u041D\u041E\u0413\u041E \u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0410\u0422\u041E\u0420\u0410 \u0432 \u0447\u0435\u043A\u0435 \u0441 id ".concat(order.id, " \u0441\u0443\u043C\u043C\u0430 ").concat(order.orderSumFinal, " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order), "\u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr)));
      telegramNote("\u041E\u0428\u0418\u0411\u041A\u0410 \u0424\u0418\u0421\u041A\u0410\u041B\u042C\u041D\u041E\u0413\u041E \u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0410\u0422\u041E\u0420\u0410 \u0432 \u0447\u0435\u043A\u0435 \u0441 id ".concat(order.id, " \u0441\u0443\u043C\u043C\u0430 ").concat(order.orderSumFinal, " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));

      try {
        devkkm.init();
        troubleAtol = 1;
        document.querySelector('#trouble-atol-toggle').checked = true;
        telegramNote('Аварийный режим атола включён');
        dbMethods.updateDb('settings', {
          value: 1
        }, {
          variable: 'troubleAtol'
        });
        popup('Перевод кассы в режим аварийной работы фискального регистратора');
        logger('Перевод кассы в режим аварийной работы фискального регистратора');
        setTimeout(function () {
          subfunc.greatSynchronizer(order, productArr);
          setTimeout(function () {
            postman.atolOrder();
          }, 8000);
        }, 40000);
      } catch (error) {}

      return false;
    }
  }; // печать чека возврата


  this.printReturtOrder = function (order, productArr) {
    var _this2 = this;

    try {
      //ОТКРЫВАЕМ ВОЗВРАТ НА АТОЛЕ
      this.openReturnOrder(order);
      popup("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430 id ".concat(order.id));
      logger("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u043D\u0430 \u0430\u0442\u043E\u043Be \u0447\u0435\u043A\u0430 id ".concat(order.id, " \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " ")); // напихивваем товары

      productArr.forEach(function (e) {
        _this2.addPosition(e.name, Number(e.priceFinal), Number(e.amount), 0, e.bulkvalue, e.bulkuntils);
      });
      this.chekClosedOrder(order.chtype, order.id); // переписываем возврат чека

      var q = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(order.id));

      try {
        db.query(q);
      } catch (e) {
        logger("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
        popup("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
      }

      troubleAtolCounter = 0;
      return true;
    } catch (e) {
      popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0435\u0447\u0430\u0442\u0438 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A ".concat(Number(order.id), " ").concat(e.message));

      try {
        devkkm.init();
      } catch (error) {}
    }
  };

  this.bankSlip = function (cheque, fiscalPrinted) {
    if (fiscalPrint != 1 && fiscalPrinted) {
      try {
        if (!cheque[0]) {
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 devkkm.bankSlip' = \u043F\u0443\u0441\u0442\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432" + JSON.stringify(cheque));
          return;
        }

        _this3.Fptr.beginNonfiscalDocument();

        cheque[0].items.forEach(function (i) {
          _this3.Fptr.setParam(_this3.Fptr.LIBFPTR_PARAM_TEXT, i.text);

          _this3.Fptr.setParam(_this3.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, false);

          _this3.Fptr.setParam(_this3.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, false);

          _this3.Fptr.printText();
        });

        _this3.Fptr.setParam(_this3.Fptr.LIBFPTR_PARAM_PRINT_FOOTER, 0);

        _this3.Fptr.endNonfiscalDocument();
      } catch (e) {
        popup('Ошибка в devkkm.bankSlip' + e.message);
        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 devkkm.bankSlip' =  ".concat(e.message));
        throw new thr('Ошибка в devkkm.bankSlip ' + e.message);
      }
    }
  }; // берем выручку и кол-во чеков с атола (не тестил)


  this.getRevenue = function () {
    if (!useAtol) {
      return {
        sum: -1,
        cashSum: -1,
        nonCashSum: -1
      };
    }

    try {
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_REVENUE);
      this.Fptr.queryData();
      var sum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_PAYMENT_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_CASH);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL);
      this.Fptr.queryData();
      var cashSum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_PAYMENT_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL);
      this.Fptr.queryData();
      var nonCashSum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);
      return {
        sum: sum,
        cashSum: cashSum,
        nonCashSum: nonCashSum
      };
    } catch (e) {
      logger('нет связи с фискальным регистратором', +e.message);
      popup('нет связи с фискальным регистратором');

      try {
        devkkm.init();
      } catch (error) {}

      return {
        sum: -1,
        cashSum: -1,
        nonCashSum: -1
      };
    }
  };

  this.printWorcdayInfo = function () {
    var stat = subfunc.getDailyStat();
    var fiscalStat = devkkm.getRevenue();
    logger("".concat(JSON.stringify(stat), " ").concat(JSON.stringify(fiscalStat)));

    try {
      // popup('вызвалась функция printWorcdayInfo')
      this.Fptr.openReceipt();
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, "Отчет по кассе:\n\n");
      this.Fptr.printText();
      var text = "\u0417\u0430 \u0434\u0435\u043D\u044C \u043F\u043E \u043A\u0430\u0441\u0441\u0435:".concat(dateStrGlobalTemp);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
      this.Fptr.printText();
      var text1 = "\u0412\u044B\u0440\u0443\u0447\u043A\u0430 \u043F\u043E \u043A\u0430\u0441\u0441\u0435 \u0432\u0441\u0435\u0433\u043E:".concat(stat.sum, " \n (\u0421 \u0432\u044B\u0447\u0435\u0442\u043E\u043C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043E\u0432)");
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text1);
      this.Fptr.printText();
      var text2 = "\u0412\u044B\u0440\u0443\u0447\u043A\u0430 \u043F\u043E \u043A\u0430\u0441\u0441\u0435 \u043D\u0430\u043B.:".concat(stat.cashSum);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text2);
      this.Fptr.printText();
      var text02 = "QR code \u043F\u0440\u0438\u0445\u043E\u0434:".concat(stat.qrSum);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text02);
      this.Fptr.printText();
      var text03 = "QR code \u0432\u043E\u0437\u0432\u0440\u0430\u0442:".concat(stat.qrReturn);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text03);
      this.Fptr.printText(); // let text3 = `Выручка по кассе бн.:${stat.cashLessSum} \n`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text3);
      // this.Fptr.printText();
      // let text43 = `Возврат по кассе всего:${stat.returnSum}`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text43);
      // this.Fptr.printText();
      // let text4 = `Возврат по кассе нал:${stat.cashSumReturn}`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text4);
      // this.Fptr.printText();
      // let text5 = `Возврат по кассе бн:${stat.cashLessSumReturn}\n`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text5);
      // this.Fptr.printText();
      // let text6 = `Выручка по фискальнику всего:${fiscalStat.sum}\n (С вычетом возвратов)`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text6);
      // this.Fptr.printText();
      // let text7 = `Приход по фискальнику нал.:${fiscalStat.cashSum}\n (С возвратами)`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text7);
      // this.Fptr.printText();
      // let text8 = `Приход по фискальнику безнал.:${fiscalStat.nonCashSum} \n (С возвратами)`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text8);
      // this.Fptr.printText();
      // let text9 = `Возврат по фискальнику всего .:${Number(fiscalStat.nonCashSum) + Number(fiscalStat.cashSum) - Number(fiscalStat.sum)} \n`;
      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text9);
      // this.Fptr.printText();

      if (stat.synhIncomeCash || stat.synhRefundCash || stat.synhIncomeCashLess || stat.synhRefundCashLess) {// let text10 = `Синхронизация(+нал) ${Number(stat.synhIncomeCash)}`;
        // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text10);
        // this.Fptr.printText();
        // let text11 = `Синхронизация(-нал) ${Number(stat.synhRefundCash)}`;
        // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text11);
        // this.Fptr.printText();
        // let text12 = `Синхронизация(+безнал) ${Number(stat.synhIncomeCashLess)}`;
        // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text12);
        // this.Fptr.printText();
        // let text13 = `Синхронизация(-безнал) ${Number(stat.synhRefundCashLess)}`;
        // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text13);
        // this.Fptr.printText();
      } // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, "Конец отчета\n\n\n");
      // this.Fptr.printText();
      // this.Fptr.closeReceipt();


      popup('конец printWorcdayInfo');
    } catch (e) {
      popup("\u043E\u0448\u0438\u0431\u043A\u0430 printWorcdayInfo ".concat(e.message));
      logger("\u043E\u0448\u0438\u0431\u043A\u0430 printWorcdayInfo ".concat(e.message));

      try {
        devkkm.init();
      } catch (error) {}
    }
  }; //чек кухни


  this.orderKitchen = function (order, productArr) {
    var _this4 = this;

    var text;
    this.Fptr.beginNonfiscalDocument();
    text = "\u0427\u0435\u043A ".concat(subfunc.orderIfFormat(order.id), "\n");
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, true);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
    this.Fptr.printText();
    productArr.forEach(function (e) {
      text = "".concat(e.name, " ").concat(e.bulkvalue, " ").concat(e.bulkuntils, "  \u043A\u043E\u043B:").concat(e.amount, "\n");

      _this4.Fptr.setParam(_this4.Fptr.LIBFPTR_PARAM_TEXT, text);

      _this4.Fptr.setParam(_this4.Fptr.LIBFPTR_PARAM_FONT, 1);

      _this4.Fptr.printText();
    });
    this.Fptr.endNonfiscalDocument();
  };
}();