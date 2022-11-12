function contentModal() {
  document.querySelectorAll('.content-modal-anchor').forEach((modalLink) => {
    modalLink.addEventListener('click', (event) => {
      const { path } = event.currentTarget.dataset;
      const modalObg = document.querySelector(`[data-target="${path}"]`);
      const btn = modalObg.querySelector('.content-modal__btn');
      // активируем форму отправки
      if (!modalLink.classList.contains('content-modal-off')) {
        document.querySelectorAll('.content-modal').forEach((tabContent) => {
          tabContent.classList.add('deactivate');
        });
        modalObg.classList.remove('deactivate');
        // закрытие на нажатие фона
        modalObg.addEventListener('click', (e) => {
          const modalOverlay = modalObg.querySelector('.content-modal__overlay');
          if (e.target === modalOverlay) {
            modalObg.classList.add('deactivate');
          }
        });
      }

      // // закрытие на нажатие кнопки
      btn.addEventListener('click', () => {
        modalObg.classList.add('deactivate');
      });
      // анимация появления окна
      if (!modalObg.classList.contains('deactivate')) {
        gsap.fromTo('.content-modal', { opacity: 0, scaleX: 0.4, scaleY: 0.4 }, {
          duration: 0.6, scaleX: 1, scaleY: 1, opacity: 1,
        });
      }
    });
  });
}

const modalObjs = document.querySelectorAll('.modalR-obj');
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll('.lock-padding');
const modalCloseIcon = document.querySelectorAll('.modalR__close');
const timeout = 800;
let unlock = true;

function bodyUnlock() {
  setTimeout(() => {
    if (lockPadding.length > 0) {
      for (let index = 0; index < lockPadding.length; index++) {
        const el = lockPadding[index];
        el.style.paddingRight = '0px';
      }
    }
    body.style.paddingRight = '0px';
    body.classList.remove('lock');
  }, timeout);

  unlock = false;
  setTimeout(() => {
    unlock = true;
  }, timeout);
}
function modalClose(modalActive, doUnlock = true) {
  if (unlock) {
    setTimeout(() => {
      modalActive.classList.remove('modalR_display');
    }, 800);
    modalActive.classList.remove('modalR_open');
    if (doUnlock) {
      bodyUnlock();
    }
  }
}
function bodyLock() {
  const lockPaddingValue = `${window.innerWidth - document.querySelector('.wrapper').offsetWidth}px`;

  for (let index = 0; index < lockPadding.length; index++) {
    const el = lockPadding[index];
    el.style.paddingRight = lockPaddingValue;
  }
  body.style.paddingRight = lockPaddingValue;
  body.classList.add('lock');

  unlock = false;
  setTimeout(() => {
    unlock = true;
  }, timeout);
}
function modalOpen(curentModal) {
  if (curentModal && unlock) {
    const modalActive = document.querySelector('.modalR_open');
    if (modalActive) {
      modalClose(modalActive, false);
    } else {
      bodyLock();
    }
    setTimeout(() => {
      curentModal.classList.add('modalR_open');
    }, 100);
    curentModal.classList.add('modalR_display');
    curentModal.addEventListener('click', (e) => {
      if (!e.target.closest('.modalR__content')) {
        modalClose(e.target.closest('.modalR'));
      }
    });
  }
}
function modalInit() {
  if (modalObjs.length > 0) {
    for (let index = 0; index < modalObjs.length; index++) {
      const modalObj = modalObjs[index];
      modalObj.addEventListener('click', (e) => {
        const modalName = modalObj.getAttribute('id').replace('btn', '');
        const curentModal = document.getElementById(modalName);
        modalOpen(curentModal);
        e.preventDefault();
      });
    }
  }
  if (modalCloseIcon.length > 0) {
    for (let index = 0; index < modalCloseIcon.length; index++) {
      const el = modalCloseIcon[index];
      el.addEventListener('click', (e) => {
        modalClose(el.closest('.modalR'));
        e.preventDefault();
      });
    }
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modalActive = document.querySelector('.modalR.modalR_open');
      if (modalActive) {
        modalClose(modalActive);
      }
    }
  });

  // eslint-disable-next-line func-names
  (function () {
  // проверяем поддержку
    if (!Element.prototype.closest) {
    // реализуем
      Element.prototype.closest = function (css) {
        let node = this;

        while (node) {
          if (node.matches(css)) return node;
          node = node.parentElement;
        }
        return null;
      };
    }
  }());

  // eslint-disable-next-line func-names
  (function () {
  // проверяем поддержку
    if (!Element.prototype.matches) {
    // определяем свойство
      Element.prototype.matches = Element.prototype.matchesSelector
      || Element.prototype.webkitMatchesSelector
      || Element.prototype.mozMatchesSelector
      || Element.prototype.msMatchesSelector;
    }
  }());
}