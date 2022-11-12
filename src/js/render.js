// универсальная функция отрисовки DOM элемента. Возвращает элемент.
// tag - тэг DOM элемента
// className -все классы,в одну строку передаются
// content - дочерние элементы,  если строка или число, будет текст контент(не value), если объект или массив объектов , то будут дочерние элементы добавлены через appendChild, добавляются по порядку. Если передается массив не только объектов, то строки и числа вписываются как текст контент а объекты добавляются детьми.
// attr - для присваивания data-, value и других атрибутов и свойств (плейсхолдер, чектайп и тд)
function el(tag, className, content, attr) {
  const renderingItem = document.createElement(tag);
  if(className && typeof className === 'string') {
    const classNameArray = className.trim().split(' ');
    classNameArray.forEach((e) => {
      renderingItem.classList.add(e);
    })
  }
  if(content) {
    if(typeof content === 'string' || typeof content === 'number') {
      renderingItem.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach((e) => {
      if(isElement(e)) {
        renderingItem.appendChild(e);
      }
      if(typeof e === 'string' || typeof e === 'number') {
        renderingItem.textContent += e;
      }
      })
    } else {
      renderingItem.appendChild(content);
    }
  }
  if(attr) {
    for (const [key, value] of Object.entries(attr)) {
      renderingItem.setAttribute(`${key}`, `${value}`)
    }
  }
  return renderingItem;
}