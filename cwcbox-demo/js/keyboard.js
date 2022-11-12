"use strict";

// Функция клавиатуры
var keyboardContainer = document.querySelector('.keyboard');
var textArea = null;
var shift = false,
    capslock = false;

function keyboardClose() {
  setTimeout(function () {
    keyboardContainer.classList.remove('keyboard_display');
  }, 300);
  keyboardContainer.classList.remove('keyboard_open');
}

function keyboardOpen(param) {
  setTimeout(function () {
    keyboardContainer.classList.remove('keyboard_num');

    if (param === 'num') {
      keyboardContainer.classList.add('keyboard_num');
    }

    keyboardContainer.classList.add('keyboard_open');
  }, 30);
  keyboardContainer.classList.add('keyboard_display');
}

var keyboardClick = function keyboardClick(e) {
  var lettersNodeList = document.querySelectorAll(".letter");
  var lettersList = Array.prototype.slice.call(lettersNodeList);
  var symbolNodeList = document.querySelectorAll(".symbol");
  var symbolList = Array.prototype.slice.call(symbolNodeList);
  var symbolLetterNodeList = document.querySelectorAll(".symbol-letter");
  var symbolLetterList = Array.prototype.slice.call(symbolLetterNodeList);
  var character = e.target.firstChild.textContent;

  if (e.target.matches('.keyboard__key_left-shift')) {
    lettersList.forEach(function (e) {
      e.classList.toggle('uppercase');
    });
    symbolLetterList.forEach(function (e) {
      var translateLetter = e.querySelector('.translate');

      if (!translateLetter) {
        e.insertBefore(e.childNodes[1], e.firstChild);
      }

      e.classList.toggle('uppercase');
    });
    symbolList.forEach(function (e) {
      if (e.childNodes[1] && e.firstChild) {
        e.insertBefore(e.childNodes[1], e.firstChild);
      }
    });
    shift = shift === true ? false : true;
    capslock = false;
    return false;
  }

  if (e.target.matches('.keyboard__key_capslock')) {
    lettersList.forEach(function (e) {
      e.classList.toggle('uppercase');
    });
    symbolLetterList.forEach(function (e) {
      e.classList.toggle('uppercase');
    });
    capslock = true;
    return false;
  }

  if (e.target.matches('.keyboard__key_delete')) {
    var textAreaStr = textArea.value;
    textArea.value = textAreaStr.substr(0, textAreaStr.length - 1);
    textArea.dispatchEvent(inputEvent);
    return false;
  }

  if (e.target.matches('.keyboard__key_space')) character = ' ';

  if (e.target.matches('.keyboard__key_enter')) {
    var btn = document.querySelector("[data-kbtn=\"".concat(textArea.dataset.keyboard, "\"]"));

    if (btn) {
      btn.click();
    }

    return;
  }

  ;

  if (e.target.matches('.keyboard__key_num')) {
    keyboardContainer.classList.toggle('keyboard_num');
    return false;
  }

  if (e.target.matches('.keyboard__key_translate')) {
    lettersList.forEach(function (e) {
      e.insertBefore(e.lastChild, e.firstChild);
    });
    symbolLetterList.forEach(function (e) {
      var translateLetter = e.querySelector('.translate');

      if (translateLetter) {
        e.insertBefore(translateLetter, e.childNodes[2].nextSibling);
        translateLetter.classList.remove('translate');
        return;
      }

      e.lastChild.classList.add('translate');
      e.insertBefore(e.lastChild, e.firstChild);
    });
    return false;
  }

  ;

  if (e.target.matches('.keyboard__key_clear')) {
    textArea.value = '';
    textArea.dispatchEvent(inputEvent);
    return false;
  }

  if (e.target.closest('.uppercase')) {
    character = e.target.firstChild.textContent.toUpperCase();
  }

  if (shift) {
    if (capslock === false) {
      lettersList.forEach(function (e) {
        e.classList.toggle('uppercase');
      });
      symbolLetterList.forEach(function (e) {
        e.classList.toggle('uppercase');
      });
      symbolList.forEach(function (e) {
        e.insertBefore(e.lastChild, e.firstChild);
      });
    }

    shift = false;
  }

  textArea.value += character;
  textArea.dispatchEvent(inputEvent);
};

function keyboardInit(selector, param) {
  textArea = selector;
  var keysNodeList = document.querySelectorAll(".keyboard__key");
  var keysList = Array.prototype.slice.call(keysNodeList);

  if (param) {
    keyboardClose();
    return;
  }

  if (selector.matches('.keyboard-input_num')) {
    if (Number(useKeyboard) === 1) {
      keyboardOpen('num');
    }
  } else {
    if (Number(useKeyboard) === 1) {
      keyboardOpen();
    }
  }

  keysList.forEach(function (e) {
    e.removeEventListener("click", keyboardClick);
    e.addEventListener('click', keyboardClick);
  });
}

;

(function () {
  document.querySelectorAll('.keyboard-input').forEach(function (item) {
    item.addEventListener('focus', function (e) {
      e.preventDefault();
      keyboardInit(e.target, false);
    });
  });
})();

window.addEventListener('click', function (e) {
  if (!e.target.closest('.keyboard__wrapper') && !e.target.closest('.keyboard-input') && !e.target.closest('.counter') && !e.target.closest('.login__input')) {
    keyboardClose();
  }
});