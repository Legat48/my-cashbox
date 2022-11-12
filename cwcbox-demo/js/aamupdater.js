"use strict";

//"use strict";
// конструктор для работы с базой данных
// глобальная переменная для работы с базой данной
// Передаем на функцию query строку, которая аналогична запросу в SQLite
var db = new function MyDatabase() {
  this.conn = new ActiveXObject("ADODB.Connection");
  this.objRs = new ActiveXObject("ADODB.Recordset");
  this.fsobj = new ActiveXObject('Scripting.FileSystemObject');
  this.curDir = this.fsobj.GetAbsolutePathName(".");
  this.conn.ConnectionString = "DRIVER=SQLite3 ODBC Driver;Database=" + this.curDir + "\\mydb.db;LongNames=0;Timeout=1000;NoTXN=0;SyncPragma=NORMAL;StepAPI=0;"; // отправка запроса(если есть ошибка на селект, надо закрыть)

  this.query = function (q) {
    this.conn.open();
    var answer = "";
    var wrd = q.split(" ");
    wrd = wrd[0];

    switch (wrd) {
      case "SELECT":
        answer = this.selectwop(q);
        break;

      default:
        answer = this.conn.Execute(q);
        break;
    } //закрыть запрос


    this.conn.Close();
    return answer;
  }; //нужна для парсинга ответа запроса


  this.selectwop = function (q) {
    this.objRs.open(q, this.conn, 3, 2, 1);
    this.objRs.MoveFirst();
    var json = "{"; //

    var lne = "";
    var cnt = 0;
    var objcnt = 0;

    while (this.objRs.EOF != true) {
      objcnt = this.objRs.Fields.Count;
      lne = "";
      json += json == "{" ? '"' + cnt + '" :{' : ',"' + cnt + '" :{';

      for (var i = 0; i < objcnt; i++) {
        var nm = this.objRs.Fields.Item(i).Name;
        lne += lne == "" ? '"' + nm + '":"' + this.objRs(nm) + '"' : ',"' + nm + '":"' + this.objRs(nm) + '"';
      }

      cnt++;
      json += lne;
      json += "}";
      this.objRs.MoveNext();
    }

    json += "}";
    this.objRs.close();
    return JSON.parse(json);
  }; // ошибка для аякс запроса


  this.handleError = function (message) {
    // обработчик ошибки
    alert("Ошибка: " + message);
  };
}();

function getXmlHttp() {
  var xmlhttp;

  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }

  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }

  return xmlhttp;
}

function point() {
  var q, ans;
  q = "SELECT value FROM settings WHERE variable = 'pointCashbox'";

  try {
    ans = db.query(q); // alert(JSON.stringify(ans))

    return ans[0].value;
  } catch (e) {
    try {
      db.conn.close();
    } catch (error) {}

    logger('Ошибка в aamupdater' + q + '\n' + e.message); // alert(e.message)

    return null;
  }
}

var pointCashbox = point();
var upd = null;
var progress = 0;
var toLoad = 0;

Object.size = function (obj) {
  var size = 0,
      key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  return size;
};

function updater() {
  this.fiver = [];
  this.localfiver = [];

  this.init = function () {
    this.initdirs(); //this.initdb();

    this.getfilesandversions();
    this.localfiver = JSON.parse(this.loadjsonfile()); //this.getupdatefromdb();

    this.check();
  };

  this.getfilesandversions = function () {
    pointCashbox = point();

    if ("".concat(pointCashbox) !== 'null') {
      this.fiver = reqxmlA("check", "?point=" + pointCashbox + "&key=nokey");
      this.fiver = JSON.parse(this.fiver);
      this.fiver = this.fiver.data.files;
    } else {
      this.fiver = [];
    }
  };

  this.check = function () {
    pointCashbox = point();
    var iFiv = this.fiver; //iFiv = iFiv[0];

    for (var i in iFiv) {
      if (typeof i != 'undefined') {
        //this.addlineinlog('Проверка файла: '+i);
        var ver = iFiv[i];
        var fName = i; //item.path+"\\"+item.file;

        var itshave = this.haveindb(fName, ver); //this.addlineinlog('Есть файл: '+itshave);

        if (itshave != 1 && progress == 0) {
          toLoad += 1;
        }
      }
    }

    for (var i in iFiv) {
      if (typeof i != 'undefined') {
        //this.addlineinlog('Проверка файла: '+i);
        var ver = iFiv[i];
        var fName = i; //item.path+"\\"+item.file;

        var itshave = this.haveindb(fName, ver); //this.addlineinlog('Есть файл: '+itshave);

        if (itshave != 1) {
          //this.addlineinlog('Версия не найдена: '+ver);
          try {
            this.backupfile(fName);
          } catch (e) {
            logger(e.message);
          }

          var fdurl = "https://bridge.cwsystem.ru/updatekassa/backend/download?point=" + pointCashbox + "&file=" + fName + "&key=nokey"; //this.addlineinlog(fdata);
          //reqxmlA("download", "?point="+pointCashbox+"&file="+fName+"&key=LBcBBN")
          //loaylreq('getfilescriptbyvers','&fid='+item.id,'return');

          if (this.filesave(fName, fdurl, ver) == 1) {
            this.addindb(fName, ver);
            this.updatefile(fName);
            return 0;
          }
        }
      }
    }
  };

  this.backupfile = function (fromfile) {
    var fileExt = fromfile.split('.')[1];
    fileExt = fileExt == 'js' || fileExt == 'css' ? fileExt : ''; // кидает все js и css в папки

    fso.CopyFile(".\\" + fileExt + "\\" + fromfile, ".\\backup\\" + fileExt + "\\" + fromfile);
  };

  this.updatefile = function (tofile) {
    var fileExt = tofile.split('.')[1];
    fileExt = fileExt == 'js' || fileExt == 'css' ? fileExt : ''; // кидает все js и css в папки

    fso.CopyFile(".\\update\\" + fileExt + "\\" + tofile, ".\\" + fileExt + "\\" + tofile);
  };

  this.filesave = function (fName, fData, ver) {
    try {
      var pathFrom = fData;
      var fileExt = fName.split('.')[1];
      fileExt = fileExt == 'js' || fileExt == 'css' ? fileExt : ''; // кидает все js и css в папки

      var pathTo = ".\\update\\" + fileExt + '\\' + fName;
      var http = new ActiveXObject("MSXML2.XMLHTTP");
      http.open("POST", pathFrom, false);
      http.send();
      var ado = new ActiveXObject("ADODB.Stream");
      ado.mode = 3;
      ado.type = 1;
      ado.open();

      try {
        var resp = JSON.parse(http.responseText).type;

        if (resp == 'error') {
          this.addindb(fName, ver);
          this.addlineinlog('Ошибка: ' + fName + ' не найден');
          return;
        }
      } catch (error) {
        progress += 1;
        var procent = Math.ceil(progress / toLoad * 100);
        this.addlineinlog('filesave: ' + fName + ': ' + procent + '%');
      }

      ado.Write(http.responseBody);
      ado.SaveToFile(pathTo, 2); //ado.close();

      return 1;
    } catch (e) {
      //alert(e.message+" "+fName+" filesave pos: "+i);
      this.makerev();
      this.addlineinlog('glob_filesave: ' + e.message + " " + fName);
      return 0;
    }
  };

  var strDirectory = '';
  var strFile = '';

  this.initdirs = function () {
    strDirectory = "./update";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./update/js";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./update/css";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./backup";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./backup/js";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./backup/css";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strDirectory = "./rev";

    if (!fso.FolderExists(strDirectory)) {
      fso.CreateFolder(strDirectory);
    }

    strFile = "./rev/rev-manifest.json";

    if (!fso.FileExists(strFile)) {
      this.makerev();
    }
  };

  this.addindb = function (filename, vers) {
    try {
      var jsonF = this.loadjsonfile();
      jsonF = JSON.parse(jsonF);

      for (var i in jsonF) {
        var _obj = jsonF[i];

        for (var a in _obj) {
          if (a == filename) {
            if (_obj[a] != vers) {
              jsonF[i][a] = vers;
              this.savejsonfile(JSON.stringify(jsonF));
            }

            return true;
          }
        }
      } //this.addlineinlog('4');


      var obj = {}; //{name:filename,version:vers};

      obj[filename] = vers; //{name:filename,version:vers};

      jsonF.push(obj); //this.addlineinlog(JSON.stringify(jsonF));

      this.savejsonfile(JSON.stringify(jsonF));
      return true;
    } catch (e) {
      this.addlineinlog("addinDB: " + e.message);
      return false;
    }
  };

  this.haveindb = function (filename, vers) {
    var jsonF = this.loadjsonfile(); //this.addlineinlog(jsonF);

    jsonF = JSON.parse(jsonF);

    for (var i in jsonF) {
      var obj = jsonF[i];

      for (var a in obj) {
        if (a == filename) {
          if (obj[a] == vers) {
            // logger(`${obj[a]} == ${vers}/ ${a} == ${filename}`)
            return 1;
          }

          return 0;
        }
      }
    }

    return -1;
  };

  this.loadjsonfile = function () {
    //this.addlineinlog('Загрузка массива');
    var iStream = fso.OpenTextFile(".\\rev\\rev-manifest.json", 1, false);

    if (!iStream) {
      alert("Can't open file" + ".\\rev\\rev-manifest.json");
      this.makerev();
      return "[]";
    }

    var data = iStream.ReadLine(); // Usually looped for several lines

    iStream.Close();
    return data;
  };

  this.savejsonfile = function (json) {
    //this.addlineinlog('Сохранение массива');
    var iStream = fso.OpenTextFile(".\\rev\\rev-manifest.json", 2, false);

    if (!iStream) {
      alert("Can't open file" + ".\\rev\\rev-manifest.json");
      this.makerev();
      return "[]";
    }

    iStream.WriteLine(json); // Usually looped for several lines

    iStream.Close();
  };

  this.makerev = function () {
    var iStream = fso.OpenTextFile(".\\rev\\rev-manifest.json", 2, true);
    iStream.WriteLine("[]"); // Usually looped for several lines

    iStream.Close();
  };

  this.addlineinlog = function (msg) {
    if (typeof myLog != 'undefined') {
      myLog.innerHTML += msg + "<br>";
    }
  };
}

var upd = null;

function checkupdate() {
  try {
    if (typeof upd == 'undefined') {
      upd = new updater();
    }

    if (upd == null) {
      upd = new updater();
    }

    upd.init();
  } catch (e) {// logger(e.message+" "+e.line+" "+JSON.stringify(e));
  }

  setTimeout(checkupdate, 2500);
}

setTimeout(checkupdate, 2500);

function getXmlHttpA() {
  var xmlhttp;

  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }

  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }

  return xmlhttp;
}

function reqxmlA(dir, param) {
  pointCashbox = point();
  var httpObject = getXmlHttpA();
  var reslt = "";
  URL = escapeHtml(escapeHtml("http://bridge.cwsystem.ru/updatekassa/backend/" + dir + param)); //"http://updatekassa/backend/check?point="+pointCashbox+"&key=LBcBBN"
  //"http://updatekassa/backend/download?point="+pointCashbox+"&file="+fileName+"&key=LBcBBN"

  httpObject.open('POST', URL, false);
  httpObject.send(null);

  if (httpObject.status == 200) {
    return httpObject.responseText;
  }

  return 0;
}

function escapeHtml(text) {
  return text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&#039;", "'");
}