// функция обработчик ошибок
function thr(msg) {
  this.message = msg;
  this.toString = function() {
     return this.message;
  };
};

// класс kkm (контрольно кассовая машина)
const devkkm = new function kkm() {
	this.Fptr = null; // переменная из настроек атола к которой все подвязывается
  this.fptrInit = false;
	this.vers = null; //версия
	this.param = {}; // объект параметра
  // функция иницилизации
	this.init = function(){
    popup('инициализация  атола');
    try {
      if(this.fptrInit != false) {
        popup('Пересоздание подключения к фискальнику');
        this.Fptr.destroy()
      }
    	this.Fptr = null; // переменная из настроек атола к которой все подвязывается
      this.Fptr = new ActiveXObject ("AddIn.Fptr10");
      this.fptrInit = true;
      popup('инициализация  атола прошла успешно');
      } catch (e) {
        popup('инициализация  атола не удалась' + e.message);
        logger(`инициализация  атола не удалась ${e.message}`);
      }
		this.vers = this.Fptr.Version();
    logger(`версия атола =  ${this.vers}`);
		this.Fptr.open();
		this.getAllParams(); //взять параметры
		try {
			this.Fptr.Version();
		} catch (e) {
      popup('взять параметры атола не удалось' + e.message);
      logger(`взять параметры атола не удалось ${this.vers}`);
    }
	};
  // функция которая берет все параметры для работы фискальника
	this.getAllParams = function() {
    // все что большими бунквами это параметры атола
    // Короткий запрос статуса ККТ
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_STATUS);  //тип загружаемых данных LIBFPTR_PARAM_DATA_TYPE
		this.Fptr.queryData(); //запрос который прописан в инструкции

		this.param.operatorID      = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_OPERATOR_ID); // Номер кассира
		this.param.logicalNumber   = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_LOGICAL_NUMBER); // Номер ККТ в магазине
		this.param.shiftState      = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_STATE); // Состояние смены
		this.param.model           = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_MODEL); //Номер модели ККТ
		this.param.mode            = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_MODE); // Режим ККТ
		this.param.submode         = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SUBMODE); // Подрежим ККТ
		this.param.receiptNumber   = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_NUMBER); // Номер чека (внутренний счетчик ККТ)
		this.param.documentNumber  = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_DOCUMENT_NUMBER); // Номер документа (внутренний счетчик ККТ)
		this.param.shiftNumber     = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_NUMBER); // Номер открытой смены или номер последней закрытой смены + 1
		this.param.receiptType     = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE); // Тип открытого чека
		this.param.documentType    = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_DOCUMENT_TYPE); // Тип открытого документа
		this.param.lineLength      = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_LINE_LENGTH); // Ширина чековой ленты, симв.
		this.param.lineLengthPix   = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_RECEIPT_LINE_LENGTH_PIX); // Ширина чековой ленты, пикс.

		this.param.receiptSum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_RECEIPT_SUM); // Сумма текущего чека

		this.param.isFiscalDevice          = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FISCAL); // Флаг регистрации ККТ
		this.param.isFiscalFN              = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FN_FISCAL); // Флаг фискализации ФН
		this.param.isFNPresent             = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_FN_PRESENT); // Флаг наличия ФН в ККТ
		this.param.isInvalidFN             = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_INVALID_FN); // Флаг корректности ФН
		this.param.isCashDrawerOpened      = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_CASHDRAWER_OPENED); // Денежный ящик открыт
		this.param.isPaperPresent          = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_RECEIPT_PAPER_PRESENT); // Наличие бумаги
		this.param.isPaperNearEnd          = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PAPER_NEAR_END); // Бумага скоро закончится
		this.param.isCoverOpened           = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_COVER_OPENED); // Крышка открыта
		this.param.isPrinterConnectionLost = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_CONNECTION_LOST); // Потеряно соединение с печатным механизмом
		this.param.isPrinterError          = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_ERROR); // Невосстановимая ошибка печатного механизма
		this.param.isCutError              = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_CUT_ERROR); // Ошибка отрезчика
		this.param.isPrinterOverheat       = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_PRINTER_OVERHEAT); // Перегрев печатного механизма
		this.param.isDeviceBlocked         = this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_BLOCKED); // ККТ заблокирована из-за ошибок

		this.param.dateTime = this.Fptr.getParamDateTime(this.Fptr.LIBFPTR_PARAM_DATE_TIME); // Дата и время ККТ

		this.param.serialNumber    = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_SERIAL_NUMBER); // Заводской номер ККТ
		this.param.modelName       = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_MODEL_NAME); // Название ККТ
		this.param.firmwareVersion = this.Fptr.getParamString(this.Fptr.LIBFPTR_PARAM_UNIT_VERSION); // Версия ПО ККТ
	}
  //вписать геттер который берет имя баристы
	this.cashierinn = ''; //инн кассира пока пустым остается
  // это проверка состояния смены
	this.checkState = function() {
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_SHIFT_STATE); //передается состояние смены и тип загружаемых данных-IBFPTR_PARAM_DATA_TYPE

    if(this.Fptr.queryData()!=0) { // статус ккт не 0
      // /обработчик ошибок
			var eDesc = this.Fptr.errorDescription(); //текст ошибки
      logger(`текст ошибки в проверке смены =  ${eDesc}`)

			switch(eDesc){
        // ниодна кодировка не дала посмотреть что тут
				case "Соединение не установлено":
          try {
            devkkm.init()
          } catch (error) {

          }
					throw new thr("\n Соединение с фискальным регистратором не установлено, \n проверьте питание, включен он и нормально вставлен кабель!");
				break;
				default:
          logger(` ошибка в проверке смены  ${JSON.stringify(eDesc)}`);
          popup(JSON.stringify(eDesc));
          try {
            devkkm.init()
          } catch (error) {

          }
					// throw new thr(eDesc);
				break;
			}
		}
		const state = this.Fptr.getParamInt(this.Fptr.LIBFPTR_PARAM_SHIFT_STATE); // Состояние смены
    logger(`Состояние смены =  ${state}`);
    //проверяем состояние смены
		switch(state) {
      // если истекла то мы закрываем смену на фискальнике
			case this.Fptr.LIBFPTR_SS_EXPIRED:
				this.closeWorkday();
			break;
		}
	};
  // закрытие смены
	this.closeWorkday = function(){
    //функция закрытия смены
		try {
      logger(`закрытие смены: кассир ${barista}`);
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
      logger(`Состояние смены =  ${JSON.stringify(e)}`);
      try {
        devkkm.init()
      } catch (error) {

      }
			throw new thr('Не удалось закрыть смену!');
		}
	}
  // ПЕЧАТЬ! X отчета
	this.ReportX = function(){
		try{
      // тут поидее строка которая его и вызывает
			this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_REPORT_TYPE, this.Fptr.LIBFPTR_RT_X);
			if (this.Fptr.report() < 0) {
				// this.Fptr.raise(); //ошибка вызова драйвера
			}
		} catch (e) {
      popup('Ошибка в kkm>ReportX'+e.message)
      logger(`Не удалось напечатать Х Отчет =  ${e.message}`)
			throw new thr('Не удалось напечатать Х Отчет!');
		}
	}

  // печать последнего чека
	this.lastOrder= function() {
		try {
      // тут поидее строка которая его и вызывает
			this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_REPORT_TYPE, this.Fptr.LIBFPTR_RT_LAST_DOCUMENT);
			if (this.Fptr.report() < 0) {
				// this.Fptr.raise();
			}
		}catch (e) {
      popup('Ошибка в kkm>lastOrder'+e.message)
      logger(`Печать последнего чека не удалась!' =  ${e.message}`)
			throw new thr('Печать последнего чека не удалась!');
		}
	}

  // взять время с атола
  this.atolTime = function() {
    let dateTime;
    try {
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_DATE_TIME);
      this.Fptr.queryData();
      dateTime = this.Fptr.getParamDateTime(this.Fptr.LIBFPTR_PARAM_DATE_TIME);
    } catch(e) {
      dateTime = -1;
    }
    return(dateTime);
  };
  //тут функция с открытием чека
	this.openOrder = function(order) {
    try {
      let text = '';
      if (fiscalPrint != 1) {
        if (order.nameClient == ' ') {
          text = `Здравствуйте`;
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
          this.Fptr.printText();
        } else {
          text = `Здравствуйте ${order.nameClient}`;
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
          this.Fptr.printText();
        }
        text = `\n Ваш номер заказа:\n`;
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
        this.Fptr.printText();
        text = `${subfunc.orderIfFormat(order.id)}\n`;
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_ALIGNMENT, this.Fptr.LIBFPTR_ALIGNMENT_CENTER);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, true);
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
        this.Fptr.printText();
      }
      try{
        this.checkState(); //проверка состояния смены
       }catch(e) {
        // какая то ошибка на статусе чека
        logger(`ошибка на статусе чека ${JSON.stringify(order)} ошибка ${e.message}`)
        return false;
      }
      logger(`трудоустройство =  ${employed}`);
      logger(`открытие чека: кассир ${order.barista} почта ${order.email} fiscalPrint = ${order.fiscalPrint} `)
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
      if(order.email) {
        this.Fptr.setParam(1008, order.email);
      } else {
        this.Fptr.setParam(1008, 'orders@coffeeway.ru');
      }
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL);
      // Открытие электронного чека
      let value = false;
      if (fiscalPrint == 1) {
        value = true;
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, value);
      }
      this.Fptr.openReceipt();
      logger(`удачное открытие чека: кассир ${JSON.stringify(order)} `)
      return true;

    } catch (e) {
      logger(`Ошибка в открытии чека ${JSON.stringify(order)} ошибка ${e.message} `)
      return false;
    }
	};

  //функция с возвратом чека

	this.openReturnOrder = function(order){
    logger(` возврат чека: трудоустройство ${employed} кассир ${order.barista} почта ${order.email} fiscalPrint = ${order.fiscalPrint} `)
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
    let value = false;
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL_RETURN);
    if (fiscalPrint == 0) {
      value = true;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, value); //тру вписать в переменную
    }
		this.Fptr.openReceipt();
	};

  // отмена чека
	this.CANCELCheck = function() {
		this.Fptr.cancelReceipt();
	};
  // добавление позиций
	this.addPosition = function (name, priceFinal, amount, tax, bulkvalue, bulkunits)//Название позиции, цена, количество
	{
    if (amount % 1 != 0) {
      let newAmount = Number(amount) * 1000;
      let newPrice = Math.floor(Number(priceFinal) * Number(amount))
      let newName = name + ' ' + newAmount + 'гр'
      name = newName;
      priceFinal = newPrice;
      amount = 1;
    }
    name += ' '+bulkvalue+bulkunits
    logger(`позиция в чеке: ${name}  ${priceFinal}  ${amount}`);
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, name);
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PRICE, priceFinal);
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_QUANTITY, amount);

		// номер налоговой ставки
		let tp = this.Fptr.LIBFPTR_TAX_NO;// по умолчанию не облагается
		switch(tax){
			default:break;
			case 0: tp = this.Fptr.LIBFPTR_TAX_NO; break;// не облагается
			case 1: tp = this.Fptr.LIBFPTR_TAX_VAT10; break;// НДС 10%
			case 2: tp = this.Fptr.LIBFPTR_TAX_VAT110; break;// НДС рассчитанный 10/110
			case 3: tp = this.Fptr.LIBFPTR_TAX_VAT0; break;// НДС 0%
			case 4: tp = this.Fptr.LIBFPTR_TAX_VAT20; break;// НДС 20%
			case 5: tp = this.Fptr.LIBFPTR_TAX_VAT120; break;// НДС рассчитанный 20/120
		}

    // Установка целочисленного параметра
		this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TAX_TYPE, tp);//fptr.LIBFPTR_TAX_VAT0

		this.Fptr.registration();
	};

// проверка закрытия чека
	this.chekClosedOrder = function(chtype, id = 1, order, productArr) { //chtype - наличными или картой 1-безнал 0-нал
		if(chtype == 1 ){
      popup('оплата безналичными');
			this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
		}
    if(chtype == 2 ){
      popup('оплата QR кодом');
			this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
		}
		if(chtype == 0){
      popup('оплата наличными');
			this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_CASH);
		}
		this.Fptr.closeReceipt();
    //
		if (this.Fptr.checkDocumentClosed() != 0 ) {
			 // Не удалось проверить состояние документа. Вывести пользователю текст ошибки, попросить устранить неполадку и повторить запрос
			//alert(this.Fptr.checkDocumentClosed());
      logger(` ошибка в закрытия чека  ${this.Fptr.errorDescription()}`)

			throw new thr(this.Fptr.errorDescription());
			//alert(this.Fptr.errorDescription());
		}

		if (!this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_DOCUMENT_CLOSED)){
			 // Документ не закрылся. Требуется его отменить (если это чек) и сформировать заново
			this.Fptr.cancelReceipt();
      const errorMessage = this.Fptr.errorDescription()
      if(errorMessage === 'Смена превысила 24 часа') {
        telegramNote(`Смена превысила 24 часа`, '1385389369')
        this.closeWorkday()
      }
			throw new thr("Документ не закрылся! Попробуйте закрыть еще раз! \n Если проблема возникла не первый раз, перезапустите фискальный регистратор \n (выключаем на минуту и включаем). \n Возможная ошибка: "+errorMessage);//'Не удалось напечатать документ (Ошибка "' + this.Fptr.errorDescription() + '"). Устраните неполадку и повторите.');
		}

		if (!this.Fptr.getParamBool(this.Fptr.LIBFPTR_PARAM_DOCUMENT_PRINTED)){
			 // Можно сразу вызвать метод допечатывания документа, он завершится с ошибкой, если это невозможно
			if (this.Fptr.continuePrint() != 0){
				// Если не удалось допечатать документ - показать пользователю ошибку и попробовать еще раз.
        const errorMessage = this.Fptr.errorDescription()
        logger(` ошибка в закрытия чека  ${errorMessage}`);
				throw new thr('Не удалось напечатать документ (Ошибка "' + errorMessage + '"). Устраните неполадку и повторите.');
				//alert('Не удалось напечатать документ (Ошибка "' + this.Fptr.errorDescription() + '"). Устраните неполадку и повторите.');
        // Fptr.logWrite("FiscalPrinter", Fptr.LIBFPTR_LOG_ERROR, "Не удалось напечатать документ (Ошибка \"" + Fptr.errorDescription() + "\"). Устраните неполадку и повторите.");
      }
		}
    try {
      logger(`------ Чек ${id} закрыт --------`)
      try {
        if (orderKitchen && order && productArr) {
          this.orderKitchen(order, productArr)
        }
      } catch (error) {
        logger(`------ Чек ${id} orderKitchen ошибка`)
      }
      return true;
    } catch (error) {

    }
	};
  // печать чека
  this.printOrder = function(order, productArr) {

    try {
      popup(`Отправка чека id ${order.id}`);
      logger(`Отправка чека id ${order.id} чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} на атол`);

      // напихивваем товары
      productArr.forEach((e) => {
        this.addPosition(e.name, Number(e.priceFinal), Number(e.amount), 0, e.bulkvalue, e.bulkuntils);
      });
      // все товары накинули и закрыли чек
      if (this.chekClosedOrder(order.chtype, order.id, order, productArr)) {
        //если всё удачно- меняем статус
        troubleAtolCounter = 0;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      popup(`ОШИБКА ФИСКАЛЬНОГО РЕГИСТРАТОРА в чеке с id ${order.id} ошибка ${e.message}`);
      logger(`ОШИБКА ФИСКАЛЬНОГО РЕГИСТРАТОРА в чеке с id ${order.id} сумма ${order.orderSumFinal} ошибка ${e.message} чек ${JSON.stringify(order)}товары ${JSON.stringify(productArr)}`);
      telegramNote(`ОШИБКА ФИСКАЛЬНОГО РЕГИСТРАТОРА в чеке с id ${order.id} сумма ${order.orderSumFinal} ошибка ${e.message}`)
      try {
        devkkm.init()
        troubleAtol = 1;
        document.querySelector('#trouble-atol-toggle').checked = true;
        telegramNote('Аварийный режим атола включён')
        dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
        popup('Перевод кассы в режим аварийной работы фискального регистратора');
        logger('Перевод кассы в режим аварийной работы фискального регистратора');
        setTimeout(() => {
          subfunc.greatSynchronizer(order, productArr)
          setTimeout(() => {
            postman.atolOrder();
          }, 8000)
        }, 40000)

      } catch (error) {
      }
      return false;
    }
  };
  // печать чека возврата
  this.printReturtOrder = function(order, productArr) {
    try {
      //ОТКРЫВАЕМ ВОЗВРАТ НА АТОЛЕ
      this.openReturnOrder(order);
      popup(`Возврат чека id ${order.id}`);
      logger(`Возврат на атолe чека id ${order.id} чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} `);
      // напихивваем товары
      productArr.forEach((e) => {
        this.addPosition(e.name, Number(e.priceFinal), Number(e.amount), 0, e.bulkvalue, e.bulkuntils);
      });
      this.chekClosedOrder(order.chtype, order.id);
      // переписываем возврат чека
      let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
      try {
        db.query(q);
      } catch (e) {
        logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
        popup(`чек ${Number(order.id)} не удалось записать`);
      }
      troubleAtolCounter = 0;
      return true;
      } catch(e) {
        popup(`Ошибка печати возврата чек ${Number(order.id)} ${e.message}`);
        try {
          devkkm.init()
        } catch (error) {

        }
    }
  };
  this.bankSlip = (cheque, fiscalPrinted) => {
    if (fiscalPrint != 1 && fiscalPrinted) {
      try {
        if(!cheque[0]) {
          logger(`Ошибка в devkkm.bankSlip' = пустой массив` +JSON.stringify(cheque));
          return
        }
        this.Fptr.beginNonfiscalDocument();
        cheque[0].items.forEach(i => {
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, i.text);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, false);
          this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, false);
          this.Fptr.printText();
        })
        this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PRINT_FOOTER, 0);
        this.Fptr.endNonfiscalDocument();
      }catch (e) {
        popup('Ошибка в devkkm.bankSlip'+e.message)
        logger(`Ошибка в devkkm.bankSlip' =  ${e.message}`);
        throw new thr('Ошибка в devkkm.bankSlip ' +e.message);
      }
    }
  }
  // берем выручку и кол-во чеков с атола (не тестил)
  this.getRevenue = function() {
    if(!useAtol) {
      return {
        sum: -1,
        cashSum: -1,
        nonCashSum: -1,
      }
    }
    try {
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_REVENUE);
      this.Fptr.queryData();

      let sum  = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);

      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_PAYMENT_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_CASH);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL);
      this.Fptr.queryData();

      let cashSum= this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);

      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_DATA_TYPE, this.Fptr.LIBFPTR_DT_PAYMENT_SUM);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_PAYMENT_TYPE, this.Fptr.LIBFPTR_PT_ELECTRONICALLY);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, this.Fptr.LIBFPTR_RT_SELL);
      this.Fptr.queryData();

      let nonCashSum = this.Fptr.getParamDouble(this.Fptr.LIBFPTR_PARAM_SUM);
      return {
        sum: sum,
        cashSum: cashSum,
        nonCashSum: nonCashSum,
      }
    } catch(e) {
      logger('нет связи с фискальным регистратором', +e.message);
      popup('нет связи с фискальным регистратором');
      try {
        devkkm.init()
      } catch (error) {

      }
      return {
        sum: -1,
        cashSum: -1,
        nonCashSum: -1,
      }
    }
  };
  this.printWorcdayInfo = function () {
    let stat = subfunc.getDailyStat();
    let fiscalStat = devkkm.getRevenue();
    logger(`${JSON.stringify(stat)} ${JSON.stringify(fiscalStat)}`)
    try {
      // popup('вызвалась функция printWorcdayInfo')

      this.Fptr.openReceipt();

      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, "Отчет по кассе:\n\n");
      this.Fptr.printText();
      let text = `За день по кассе:${dateStrGlobalTemp}`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
      this.Fptr.printText();
      let text1 = `Выручка по кассе всего:${stat.sum} \n (С вычетом возвратов)`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text1);
      this.Fptr.printText();
      let text2 = `Выручка по кассе нал.:${stat.cashSum}`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text2);
      this.Fptr.printText();
      let text02 = `QR code приход:${stat.qrSum}`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text02);
      this.Fptr.printText();
      let text03 = `QR code возврат:${stat.qrReturn}`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text03);
      this.Fptr.printText();
      // let text3 = `Выручка по кассе бн.:${stat.cashLessSum} \n`;
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
      if(stat.synhIncomeCash || stat.synhRefundCash || stat.synhIncomeCashLess || stat.synhRefundCashLess) {
        // let text10 = `Синхронизация(+нал) ${Number(stat.synhIncomeCash)}`;
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
      }

      // this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, "Конец отчета\n\n\n");
      // this.Fptr.printText();
      // this.Fptr.closeReceipt();
      popup('конец printWorcdayInfo')
    } catch (e) {
      popup(`ошибка printWorcdayInfo ${e.message}`)
      logger(`ошибка printWorcdayInfo ${e.message}`)
      try {
        devkkm.init()
      } catch (error) {

      }
    }
  }
  //чек кухни
  this.orderKitchen = function (order, productArr) {
    let text;
    this.Fptr.beginNonfiscalDocument();
    text = `Чек ${subfunc.orderIfFormat(order.id)}\n`;
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_WIDTH, true);
    this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT_DOUBLE_HEIGHT, true);
    this.Fptr.printText();
    productArr.forEach((e) => {
      text = `${e.name} ${e.bulkvalue} ${e.bulkuntils}  кол:${e.amount}\n`;
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_TEXT, text);
      this.Fptr.setParam(this.Fptr.LIBFPTR_PARAM_FONT, 1);
      this.Fptr.printText();
    })
    this.Fptr.endNonfiscalDocument();
  }
};