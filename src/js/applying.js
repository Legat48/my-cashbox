// вызовы всех функций из классов


// класс настроек
setting.setDefauilSetting();
setting.interface(); //вызов функции интерфейса
setting.QRcode();
setting.useAtol();
setting.troubleAtol();
setting.useWeight();
setting.useTerminal();
setting.checklist();
setting.weekDay();
setting.firstSlip();
setting.secondSlip();
setting.fiscalPrint();
setting.useKeyboard(); // переключение клавиатуры
setting.useDisplay(); // переключение экрана кухни
setting.choiceDisplay(); // переключение адреса для экрана кухни
setting.useToppingMenu(); // Экран выбора сиропа
setting.mailPoint();
setting.writeoffMode();
setting.orderKitchen(); // чек кухни


interfaceApp.dropdown();
interfaceApp.burger();
interfaceApp.formedOrders();
interfaceApp.surrender();
interfaceApp.btnAllCategory();
interfaceApp.btnFptsUpdate();
interfaceApp.btnUptadeTerminalReset();
interfaceApp.declaration();

const tokenPointVers = document.querySelector('.menu__version')
if(tokenPointVers) {
  tokenPointVers.textContent = `${pointCashbox} | ${tokenPointVers.textContent}`
}

getPointInfo(tokenPoint, subdomain)
.then((result) => {
})
.catch((error) => {
  let errorStr = JSON.stringify(error)
  logger('Ошибка в applaying>getPointInfo \n'+errorStr);
})

checklist.tracking();

// навешивание скролла на страницу
// вертикальный скроллбар
const scrollerArr = document.querySelectorAll('.scrollbar');
// объявление скролла на плагине
scrollerArr.forEach((el) => {
  new SimpleBar(el, {
    scrollbarMaxSize: 100,
    autoHide : true,
    clickOnTrack: false
  });
});

// catalog__category скроллбар для каталога категорий
interfaceApp.scrollFuncHoryz('.catalog__category', 38)
// catalog__content скроллбар для товаров и подкатегорий
interfaceApp.scrollFuncVert('.catalog__content', 35)
// receipt скроллбар для чека
interfaceApp.scrollFuncVert('.receipt', 9)



// document.querySelector('.category__wrap').addEventListener('mousedown', () => {
//   alert('test')
// })

// document.querySelector('.catalog__category').addEventListener('touchstart', handleTouchStart, false);
// document.querySelector('.catalog__category').addEventListener('touchmove', handleTouchMove, false);
document.querySelector('.catalog__category').addEventListener('mousedown', QQhandleTouchStart, false);
document.querySelector('.catalog__category').addEventListener('mousemove', QQhandleTouchMove, false);
document.querySelector('.catalog__category').addEventListener('mouseup', QQhandleTouchEnd, false);
var xDown = null;
var yDown = null;
const testprevBtn = document.querySelector('.category__btn_prev')
const testnextBtn = document.querySelector('.category__btn_next')

function QQgetTouches(evt) {
  return {
    clientX: evt.clientX,
    clientY: evt.clientY
  }
};
function QQhandleTouchEnd(evt) {
  xDown = null
  yDown = null
};
function QQhandleTouchStart(evt) {
  const firstTouch = QQgetTouches(evt);
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
};
function QQhandleTouchMove(evt) {
  if ( !xDown || !yDown ) {
    return;
  }

  var xUp = evt.clientX;
  var yUp = evt.clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  if((Math.abs(xDiff) > 50) || (Math.abs(yDiff) > 50)) {
    if ( Math.abs(xDiff) > Math.abs(yDiff)) {
      xDown = null;
      yDown = null;
      // alert('test'+`${xDown} - ${xUp}/ ${yDown} - ${yUp}`)
      ( xDiff > 0 ) ? testnextBtn.click(): testprevBtn.click();
    }
    if ( Math.abs(xDiff) < Math.abs(yDiff)) {

      xDown = null;
      yDown = null;
      // alert('test'+`${xDiff} - ${xUp}/ ${yDiff} - ${yUp}`)
      ( yDiff > 0 ) ?  '': '';
    }

  }

};

function getTouches(evt) {
  return evt.touches
};
function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
};
function handleTouchMove(evt) {
  if ( !xDown || !yDown ) {
    return;
  }
  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  if((Math.abs(xDiff) > 50) || (Math.abs(yDiff) > 50)) {
    if ( Math.abs(xDiff) > Math.abs(yDiff)) {
      xDown = null;
      yDown = null;
      // alert('test'+`${xDown} - ${xUp}/ ${yDown} - ${yUp}`)
      ( xDiff > 0 ) ? alert('Left'+`${xDiff} ${yDiff}`) : alert('Right'+`${xDiff} ${yDiff}`);
    }
    if ( Math.abs(xDiff) < Math.abs(yDiff)) {

      xDown = null;
      yDown = null;
      // alert('test'+`${xDiff} - ${xUp}/ ${yDiff} - ${yUp}`)
      ( yDiff > 0 ) ? alert('Up'+`${xDiff} ${yDiff}`) : alert('Down'+`${xDiff} ${yDiff}`);
    }

  }
};
