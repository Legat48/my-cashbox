"use strict";

function contentModal() {
  document.querySelectorAll('.content-modal-anchor').forEach(function (modalLink) {
    modalLink.addEventListener('click', function (event) {
      var path = event.currentTarget.dataset.path;
      var modalObg = document.querySelector("[data-target=\"".concat(path, "\"]"));
      var btn = modalObg.querySelector('.content-modal__btn'); // активируем форму отправки

      if (!modalLink.classList.contains('content-modal-off')) {
        document.querySelectorAll('.content-modal').forEach(function (tabContent) {
          tabContent.classList.add('deactivate');
        });
        modalObg.classList.remove('deactivate'); // закрытие на нажатие фона

        modalObg.addEventListener('click', function (e) {
          var modalOverlay = modalObg.querySelector('.content-modal__overlay');

          if (e.target === modalOverlay) {
            modalObg.classList.add('deactivate');
          }
        });
      } // // закрытие на нажатие кнопки


      btn.addEventListener('click', function () {
        modalObg.classList.add('deactivate');
      }); // анимация появления окна

      if (!modalObg.classList.contains('deactivate')) {
        gsap.fromTo('.content-modal', {
          opacity: 0,
          scaleX: 0.4,
          scaleY: 0.4
        }, {
          duration: 0.6,
          scaleX: 1,
          scaleY: 1,
          opacity: 1
        });
      }
    });
  });
}

var modalObjs = document.querySelectorAll('.modalR-obj');
var body = document.querySelector('body');
var lockPadding = document.querySelectorAll('.lock-padding');
var modalCloseIcon = document.querySelectorAll('.modalR__close');
var timeout = 800;
var unlock = true;

function bodyUnlock() {
  setTimeout(function () {
    if (lockPadding.length > 0) {
      for (var index = 0; index < lockPadding.length; index++) {
        var el = lockPadding[index];
        el.style.paddingRight = '0px';
      }
    }

    body.style.paddingRight = '0px';
    body.classList.remove('lock');
  }, timeout);
  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeout);
}

function modalClose(modalActive) {
  var doUnlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (unlock) {
    setTimeout(function () {
      modalActive.classList.remove('modalR_display');
    }, 800);
    modalActive.classList.remove('modalR_open');

    if (doUnlock) {
      bodyUnlock();
    }
  }
}

function bodyLock() {
  var lockPaddingValue = "".concat(window.innerWidth - document.querySelector('.wrapper').offsetWidth, "px");

  for (var index = 0; index < lockPadding.length; index++) {
    var el = lockPadding[index];
    el.style.paddingRight = lockPaddingValue;
  }

  body.style.paddingRight = lockPaddingValue;
  body.classList.add('lock');
  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeout);
}

function modalOpen(curentModal) {
  if (curentModal && unlock) {
    var modalActive = document.querySelector('.modalR_open');

    if (modalActive) {
      modalClose(modalActive, false);
    } else {
      bodyLock();
    }

    setTimeout(function () {
      curentModal.classList.add('modalR_open');
    }, 100);
    curentModal.classList.add('modalR_display');
    curentModal.addEventListener('click', function (e) {
      if (!e.target.closest('.modalR__content')) {
        modalClose(e.target.closest('.modalR'));
      }
    });
  }
}

function modalInit() {
  if (modalObjs.length > 0) {
    var _loop = function _loop(index) {
      var modalObj = modalObjs[index];
      modalObj.addEventListener('click', function (e) {
        var modalName = modalObj.getAttribute('id').replace('btn', '');
        var curentModal = document.getElementById(modalName);
        modalOpen(curentModal);
        e.preventDefault();
      });
    };

    for (var index = 0; index < modalObjs.length; index++) {
      _loop(index);
    }
  }

  if (modalCloseIcon.length > 0) {
    var _loop2 = function _loop2(_index) {
      var el = modalCloseIcon[_index];
      el.addEventListener('click', function (e) {
        modalClose(el.closest('.modalR'));
        e.preventDefault();
      });
    };

    for (var _index = 0; _index < modalCloseIcon.length; _index++) {
      _loop2(_index);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var modalActive = document.querySelector('.modalR.modalR_open');

      if (modalActive) {
        modalClose(modalActive);
      }
    }
  }); // eslint-disable-next-line func-names

  (function () {
    // проверяем поддержку
    if (!Element.prototype.closest) {
      // реализуем
      Element.prototype.closest = function (css) {
        var node = this;

        while (node) {
          if (node.matches(css)) return node;
          node = node.parentElement;
        }

        return null;
      };
    }
  })(); // eslint-disable-next-line func-names


  (function () {
    // проверяем поддержку
    if (!Element.prototype.matches) {
      // определяем свойство
      Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector;
    }
  })();
}