// работа с терминалом банка
const sbbank = new function Bank() {
	this.sum = '';
	this.statusWaiting = 0;
	this.result = -1;
	this.res = -1;
	this.query = false;
	this.connecting = "";
  // оплата сбербанк
	this.paymentBank = function(){// Оплата
    if(!this.query){
			this.query = true;
			this.statusWaiting = 1; // встатус срабатывания отмены
			this.connecting = sbrf.NFun(7003);
			if(this.connecting === 0){
				const productSum = parseInt(this.sum+""+'00');
				sbrf.Sparam('Amount',productSum);
				this.result = sbrf.NFun(4000);
        this.cheque = this.sendSberSlip(sbrf.GParamString('Cheque'))
			} else {
				alert("Пинпад отключился!");
				this.query = false;
				this.res = this.result;
				this.result = -1;
				this.statusWaiting = 0;
			}
			sbrf.clear();
      // 0 - оплата прошла
      logger(`Код который отдает терминал банка ${this.result}`)
      if(this.result == 0 || `${this.result}`.length > 0) {
        this.query = false;
        this.res = this.result;
        this.result = -1;
        this.statusWaiting = 0;
      }
		} else {
			popup("Запрос отправлен!");
		}
	}
  // Возврат. В этой функции обязательно использовать банковскую карту гостя
	this.refund = function(idOrder, btn){ //передали айди чека и кнопку, на которую нажимали
    let order = subfunc.getOrderObg(7, idOrder);
    let productArr = subfunc.getProductArr(order);
    if(!this.query){
			this.query = true;
			this.statusWaiting = 1;// статус срабатывания отмены (2 минуты обычно)
			this.connecting = sbrf.NFun(7003);
			if(this.connecting==0){
				const productSum = Number(order.orderSumFinal);
				sbrf.Sparam('Amount',parseInt(productSum+""+'00'));
				this.result = sbrf.NFun(4002);
			} else {
				popup("Пинпад отключился!");
				this.query = false;
				this.res = this.result;
				this.result = -1;
				this.statusWaiting = 0;
			}
			sbrf.clear();
			if(sbbank.res == 0){ //если возврат успешный
        btn.classList.add('ready-payment');
        btn.textContent = 'Ден. возв.';
        order.status = -1;
        popup(`Возврат чека ${order.id} проведен успешно`);
        logger(`Возврат чека ${order.id} проведен успешно`);
        let q = `UPDATE orders SET status = -1 WHERE id = ${Number(order.id)}`;
        try {
          db.query(q);
          if (useAtol && !troubleAtol) { // если используется атол
            if(devkkm.printReturtOrder(order, productArr)) {
              popup(`Чек ${order.id} успешно отменен`);
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } else {
              popup(`Печать возврата чека ${order.id} не удалась`);
              logger(`Печать возврата чека ${order.id} не удалась`);
              troubleAtolCounter += 1;
              if (troubleAtolCounter > 2) {
                devkkm.init()
              }
              if (troubleAtolCounter > 3) {
                troubleAtol = 1;
                document.querySelector('#trouble-atol-toggle').checked = true;
                telegramNote('Аварийный режим атола включён')
                dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                popup('Перевод кассы в режим аварийной работы фискального регистратора');
                postman.atolOrder();
                troubleAtolCounter = 0;
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              };
            }
          } else if (useAtol === 1 && troubleAtol) {
            popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
            btn.textContent = 'Отменен';
            btn.setAttribute("disabled", "disabled");

          } else {
            let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
            try {
              db.query(q);
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } catch (e) {
              logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
              popup(`чек ${Number(order.id)} не удалось записать`);
            }
          };
        } catch (e) {
          popup(`фиксация чека после отмены ${order.id} не удалась`);
          logger(`фиксация чека после отмены ${order.id} не удалась чек ${JSON.stringify(order)} товары в нем ${JSON.stringify(productArr)}`);
        }
      } else {
        popup('Возврат остановлен!', true);
      }
		}else{
			popup("Запрос отправлен!");
		}
	};
  // Сверка итогов
	this.reconciliation = function() {
		if(!this.query){
			this.query = true;
			this.connecting = sbrf.NFun(7003);
			if(this.connecting==0){
				sbrf.NFun(6000);
        this.query = false;
				this.res = this.result;
				this.result=-1;
				this.statusWaiting = 0;
			} else {
				popup("Пинпад отключился!");
				this.query = false;
				this.res = this.result;
				this.result=-1;
				this.statusWaiting = 0;
			}
			sbrf.clear();
			this.query = false;
		}else{
			popup("Запрос отправлен!");
		}
	}
  this.sendSberSlip = (cheque) => {
    let splitter = '~S'
    if (!/~S/.test(cheque))
      if (/={12,}/.test(cheque))
        cheque = cheque.replace(/={12,}/, '~S')
    let lines = [cheque.split(splitter)[0]];
    if (cheque.split(splitter)[1])
      if (cheque.split(splitter)[1].length > 0) {
        lines.push(cheque.split(splitter)[1])
      }
    let slips = []
    lines.forEach(element => {
      let line_element = element
      line_element = line_element.split('\r\n').filter((e) => e);
      if (!line_element || line_element.length < 2 ) return;

      let json_slip = {
        "type": "nonFiscal",
        "items": [

        ]
      };

      if (line_element.length > 1) {

        line_element.forEach((line) => {
          json_slip.items.push({
            "type": "text",
            "text": line,
            "alignment": "left",
            "doubleWidth": false,
            "doubleHeight": false
          })
        })
      }
      slips.push((json_slip))
    })

    return slips;

  }

}