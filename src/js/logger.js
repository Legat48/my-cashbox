function AddLeft(str, add, len)
{
  // Потому что в JScript нет функций форматированного вывода
  str = String(str);
  while (str.length < len)
    str = add + str;
  return str;
}

function logger(Text) {
 try {
    const dumpFolder = "LOGs\\";
    const today = new Date();
    const dumpFile = today.getFullYear() + '_' + AddLeft(today.getMonth() + 1, '0', 2) + '_' + AddLeft(today.getDate(), '0', 2)+".txt";
    fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FolderExists(dumpFolder))
      fso.CreateFolder(dumpFolder);
    let ts = fso.OpenTextFile(dumpFolder + dumpFile, 8, true);
    const txt = AddLeft(today.getHours(), '0', 2) + ':' + AddLeft(today.getMinutes(), '0', 2) + ':' + AddLeft(today.getSeconds(), '0', 2)+" "+Text;
    ts.WriteLine(txt);
    ts.Close();
  } catch (e) {
    try {
      popup('Ошибка в логгере', e.messege);
    } catch (e) {}
  }
}


function telegramNote (text, chat) {
  try {
    const today = new Date();
    const data = today.getFullYear() + '_' + AddLeft(today.getMonth() + 1, '0', 2) + '_' + AddLeft(today.getDate(), '0', 2)+': '+ AddLeft(today.getHours(), '0', 2) + ':' + AddLeft(today.getMinutes(), '0', 2) + ':' + AddLeft(today.getSeconds(), '0', 2)
    var message = `
    Дата: ${data}\nТочка: ${pointCashbox} || ${addressCashbox}\nСообщение: ${text}`
    var chatid = chat ? chat :"-737878033"; //'1385389369'
    var token = "5458730025:AAECnuJFx8N5T8OzAnaMMMXB6I6_tyimKWQ";
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', "https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatid+'&parse_mode=HTML&text='+encodeURIComponent(message), true);
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
  } catch (error) {
  }
}