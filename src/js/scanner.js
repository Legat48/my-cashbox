
document.addEventListener("keyup", function(event) {
  if(useKeyboard) {
    if (event.key === "Enter") {
      // Do work
      alert(codesearch);
      if (codesearch.length < 6) {
        if (scannerObg[`${codesearch}`]) {
          let amount = 1;
          entry.product(Number(scannerObg[`${codesearch}`].id), scannerObg[`${codesearch}`].name, scannerObg[`${codesearch}`].bulk_value, scannerObg[`${codesearch}`].bulk_untils, Number(scannerObg[`${codesearch}`].price), Number(amount), Number(scannerObg[`${codesearch}`].cashback_percent), Number(scannerObg[`${codesearch}`].parent))
        }
        codesearch = "";
      } else {
        if (onlineSystem) {
          if(ordersArr[0]) {
            if (ordersArr[0].idClient.length < 2 ) {
              if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
                const inputClient = document.querySelector('#client-card-input');
                inputClient.value = codesearch;
                const btnClient = document.querySelector('#client-btn');
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
      if(codesearch.length < 9){
       codesearch += event.key;
      } else {
        codesearch = event.key;
      }
    }
  } else if (document.activeElement === clientInput) {
    if (event.key === "Enter") {
      // Do work
      if (codesearch.length < 6) {
        if (scannerObg[`${codesearch}`]) {
          let amount = 1;
          entry.product(Number(scannerObg[`${codesearch}`].id), scannerObg[`${codesearch}`].name, scannerObg[`${codesearch}`].bulk_value, scannerObg[`${codesearch}`].bulk_untils, Number(scannerObg[`${codesearch}`].price), Number(amount), Number(scannerObg[`${codesearch}`].cashback_percent), Number(scannerObg[`${codesearch}`].parent))
        }
        codesearch = "";
      } else {
        if (onlineSystem) {
          if(ordersArr[0]) {
            if (ordersArr[0].idClient.length < 2) {
              const inputClient = document.querySelector('#client-card-input')
              inputClient.value = codesearch;
              const btnClient = document.querySelector('#client-btn')
              btnClient.click();
              codesearch = "";
            }
          }
        } else {
          popup('Отсутствует соединение с сервером')
        }
      }
    } else {
      if(codesearch.length < 9){
       codesearch += event.key;
      } else {
        codesearch = event.key;
      }
    }
  }
});