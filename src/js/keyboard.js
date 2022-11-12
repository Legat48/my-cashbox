
// Функция клавиатуры

const keyboardContainer = document.querySelector('.keyboard');

let textArea = null;
let shift = false,
capslock = false;
function keyboardClose() {
  setTimeout(() => {
    keyboardContainer.classList.remove('keyboard_display');
  }, 300);
  keyboardContainer.classList.remove('keyboard_open');
}

function keyboardOpen(param) {
  setTimeout(() => {
    keyboardContainer.classList.remove('keyboard_num');
    if(param === 'num') { keyboardContainer.classList.add('keyboard_num'); }
    keyboardContainer.classList.add('keyboard_open');
  }, 30);
  keyboardContainer.classList.add('keyboard_display')
}


const keyboardClick = function(e) {
  const lettersNodeList = document.querySelectorAll(`.letter`)
  const lettersList = Array.prototype.slice.call(lettersNodeList)
  const symbolNodeList = document.querySelectorAll(`.symbol`)
  const symbolList = Array.prototype.slice.call(symbolNodeList)
  const symbolLetterNodeList = document.querySelectorAll(`.symbol-letter`)
  const symbolLetterList = Array.prototype.slice.call(symbolLetterNodeList)

  let character = e.target.firstChild.textContent;

  if (e.target.matches('.keyboard__key_left-shift')) {
    lettersList.forEach((e) => {
      e.classList.toggle('uppercase')
    })
    symbolLetterList.forEach((e) => {
      const translateLetter = e.querySelector('.translate')
      if(!translateLetter) {
        e.insertBefore(e.childNodes[1],e.firstChild)
      }
      e.classList.toggle('uppercase')
    })
    symbolList.forEach((e) => {
      if(e.childNodes[1] && e.firstChild) {
        e.insertBefore(e.childNodes[1], e.firstChild);
      }
    })
    shift = (shift === true) ? false : true;
    capslock = false;
    return false;
  }
  if (e.target.matches('.keyboard__key_capslock')) {
    lettersList.forEach((e) => {
      e.classList.toggle('uppercase')
    })
    symbolLetterList.forEach((e) => {
      e.classList.toggle('uppercase')
    })
    capslock = true;
    return false;
  }
  if (e.target.matches('.keyboard__key_delete')) {
    let textAreaStr = textArea.value
    textArea.value = textAreaStr.substr(0, textAreaStr.length - 1)
    textArea.dispatchEvent(inputEvent);
    return false;
  }
  if (e.target.matches('.keyboard__key_space')) character = ' ';
  if (e.target.matches('.keyboard__key_enter')) {
    const btn = document.querySelector(`[data-kbtn="${textArea.dataset.keyboard}"]`);
    if(btn) {
      btn.click();
    }
    return;
  };

  if (e.target.matches('.keyboard__key_num')) {
    keyboardContainer.classList.toggle('keyboard_num')
    return false;
  }

  if (e.target.matches('.keyboard__key_translate')) {
    lettersList.forEach((e) => {
      e.insertBefore(e.lastChild,e.firstChild)
    })
    symbolLetterList.forEach((e) => {
      const translateLetter = e.querySelector('.translate')
      if(translateLetter) {
        e.insertBefore(translateLetter,e.childNodes[2].nextSibling)
        translateLetter.classList.remove('translate');
        return
      }
      e.lastChild.classList.add('translate')
      e.insertBefore(e.lastChild,e.firstChild)
    })
    return false;
  };
  if (e.target.matches('.keyboard__key_clear')) {
    textArea.value = '';
    textArea.dispatchEvent(inputEvent);
    return false;
  }
  if(e.target.closest('.uppercase')) {
    character = e.target.firstChild.textContent.toUpperCase();
  }
  if (shift) {

    if (capslock === false) {
      lettersList.forEach((e) => {
        e.classList.toggle('uppercase')
      })
      symbolLetterList.forEach((e) => {
        e.classList.toggle('uppercase')
      })
      symbolList.forEach((e) => {
      e.insertBefore(e.lastChild,e.firstChild)
    })
    }
    shift = false;
  }
  textArea.value += character;
  textArea.dispatchEvent(inputEvent);
};

function keyboardInit(selector, param){
	textArea = selector;
  const keysNodeList = document.querySelectorAll(`.keyboard__key`)
  const keysList = Array.prototype.slice.call(keysNodeList)
  if (param) {
    keyboardClose()
    return;
  }
  if(selector.matches('.keyboard-input_num')) {
    if(Number(useKeyboard) === 1) {
      keyboardOpen('num');
    }
  } else {
    if(Number(useKeyboard) === 1) {
      keyboardOpen();
    }
  }
	keysList.forEach((e) => {
    e.removeEventListener("click", keyboardClick);
    e.addEventListener('click', keyboardClick)
  })
};

(function () {
  document.querySelectorAll('.keyboard-input').forEach((item) => {
    item.addEventListener('focus', (e) => {
      e.preventDefault()
      keyboardInit(e.target, false)
    });
  })
})();
window.addEventListener('click', (e) => {
  if (!e.target.closest('.keyboard__wrapper') && !e.target.closest('.keyboard-input') && !e.target.closest('.counter') && !e.target.closest('.login__input')) {
    keyboardClose()
  }
});
