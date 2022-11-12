"use strict";

document.addEventListener("keyup", function (event) {
  if (useKeyboard) {
    if (event.key === "Enter") {
      // Do work
      alert(codesearch);

      if (codesearch.length < 6) {
        if (scannerObg["".concat(codesearch)]) {
          var amount = 1;
          entry.product(Number(scannerObg["".concat(codesearch)].id), scannerObg["".concat(codesearch)].name, scannerObg["".concat(codesearch)].bulk_value, scannerObg["".concat(codesearch)].bulk_untils, Number(scannerObg["".concat(codesearch)].price), Number(amount), Number(scannerObg["".concat(codesearch)].cashback_percent), Number(scannerObg["".concat(codesearch)].parent));
        }

        codesearch = "";
      } else {
        if (onlineSystem) {
          if (ordersArr[0]) {
            if (ordersArr[0].idClient.length < 2) {
              if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
                var inputClient = document.querySelector('#client-card-input');
                inputClient.value = codesearch;
                var btnClient = document.querySelector('#client-btn');
                btnClient.click();
                codesearch = "";
              } else {
                popup('В облаченном чеке нельзя ввести клиента');
                codesearch = "";
              }
            }
          }
        } else {
          popup('Отсутствует соединение с сервером');
        }
      }
    } else {
      if (codesearch.length < 9) {
        codesearch += event.key;
      } else {
        codesearch = event.key;
      }
    }
  } else if (document.activeElement === clientInput) {
    if (event.key === "Enter") {
      // Do work
      if (codesearch.length < 6) {
        if (scannerObg["".concat(codesearch)]) {
          var _amount = 1;
          entry.product(Number(scannerObg["".concat(codesearch)].id), scannerObg["".concat(codesearch)].name, scannerObg["".concat(codesearch)].bulk_value, scannerObg["".concat(codesearch)].bulk_untils, Number(scannerObg["".concat(codesearch)].price), Number(_amount), Number(scannerObg["".concat(codesearch)].cashback_percent), Number(scannerObg["".concat(codesearch)].parent));
        }

        codesearch = "";
      } else {
        if (onlineSystem) {
          if (ordersArr[0]) {
            if (ordersArr[0].idClient.length < 2) {
              var _inputClient = document.querySelector('#client-card-input');

              _inputClient.value = codesearch;

              var _btnClient = document.querySelector('#client-btn');

              _btnClient.click();

              codesearch = "";
            }
          }
        } else {
          popup('Отсутствует соединение с сервером');
        }
      }
    } else {
      if (codesearch.length < 9) {
        codesearch += event.key;
      } else {
        codesearch = event.key;
      }
    }
  }
});