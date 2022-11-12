"use strict";

function AddLeft(str, add, len) {
  // Потому что в JScript нет функций форматированного вывода
  str = String(str);

  while (str.length < len) {
    str = add + str;
  }

  return str;
}

function logger(Text) {
  try {
    var dumpFolder = "LOGs\\";
    var today = new Date();
    var dumpFile = today.getFullYear() + '_' + AddLeft(today.getMonth() + 1, '0', 2) + '_' + AddLeft(today.getDate(), '0', 2) + ".txt";
    fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FolderExists(dumpFolder)) fso.CreateFolder(dumpFolder);
    var ts = fso.OpenTextFile(dumpFolder + dumpFile, 8, true);
    var txt = AddLeft(today.getHours(), '0', 2) + ':' + AddLeft(today.getMinutes(), '0', 2) + ':' + AddLeft(today.getSeconds(), '0', 2) + " " + Text;
    ts.WriteLine(txt);
    ts.Close();
  } catch (e) {
    try {
      popup('Ошибка в логгере', e.messege);
    } catch (e) {}
  }
}

function telegramNote(text, chat) {
  try {
    var today = new Date();
    var data = today.getFullYear() + '_' + AddLeft(today.getMonth() + 1, '0', 2) + '_' + AddLeft(today.getDate(), '0', 2) + ': ' + AddLeft(today.getHours(), '0', 2) + ':' + AddLeft(today.getMinutes(), '0', 2) + ':' + AddLeft(today.getSeconds(), '0', 2);
    var message = "\n    \u0414\u0430\u0442\u0430: ".concat(data, "\n\u0422\u043E\u0447\u043A\u0430: ").concat(pointCashbox, " || ").concat(addressCashbox, "\n\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: ").concat(text);
    var chatid = chat ? chat : "-737878033"; //'1385389369'

    var token = "5458730025:AAECnuJFx8N5T8OzAnaMMMXB6I6_tyimKWQ";
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', "https://api.telegram.org/bot" + token + "/sendMessage?chat_id=" + chatid + '&parse_mode=HTML&text=' + encodeURIComponent(message), true);
      xhr.send();
      xhr.addEventListener('readystatechange', function (e) {
        if (xhr.readyState !== 4) return;

        if (xhr.status !== 0) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      });
    });
  } catch (error) {}
}