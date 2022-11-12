"use strict";

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
    // dbUse += 1;
    // popup(dbUse)
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
    popup("Ошибка: " + message);
  };
}(); // новый способ работы с базой(нельзя заменять на старый, все запросы на переделку)
// function mydatabase() {
//   this.conn = new ActiveXObject("ADODB.Connection");
// 	this.fsobj = new ActiveXObject('Scripting.FileSystemObject');
//   this.objRs = new ActiveXObject("ADODB.Recordset");
// 	this.curDir = this.fsobj.GetAbsolutePathName(".");
//   this.conn.ConnectionString = "DRIVER=SQLite3 ODBC Driver;Database="+this.curDir+"\\mydb.db;LongNames=0;Timeout=1000;NoTXN=0;SyncPragma=NORMAL;StepAPI=0;";
//   this.query = function(q) {
//     var wrd = q.split(' ');
//     //alert(" OBJRS: "+JSON.stringify(wrd));
//     wrd = wrd[0];
//     var result = 0;
//     try{
//       switch(wrd) {
//         case "SELECT":
//           esult = this.selectwop(q);
//           reak;
//           default:
//             result = this.exec(q);
//             break;
//           }
//         } catch (e) {
//           this.conn.close();
//         }
//         return result;}
//         this.selectwop = function(q) {
//           this.conn.open();
//           this.objRs.open(q, this.conn, 3, 2, 1);
//           this.objRs.MoveFirst();
//           var data = [];
//           var objcnt = 0;
//           //alert(" OBJRS: " + JSON.stringify(this.objRs));
//           while (this.objRs.EOF != true){
//             //alert(" OBJRS: " + JSON.stringify(this.objRs));
//             objcnt = this.objRs.Fields.Count;
//             var line = {};
//             for(var i=0; i<objcnt; i++) {
//               var nm = this.objRs.Fields.Item(i).Name;
//               var val = String(this.objRs(i));
//               line[nm] = val;
//             }
//             //alert(JSON.stringify(line));
//             data.push(line);
//             this.objRs.MoveNext();
//           }
//           this.objRs.close();
//           //alert(JSON.stringify(data));
//           this.conn.close();
//           return data;
//         }
//           this.exec = function(q)
//           {this.conn.open();
//           //alert(JSON.stringify(q));
//           var answer = this.conn.Execute(q);
//           this.conn.close();
//           return answer;
//         }}
// создание таблицы
// конструктор аякс запроса

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