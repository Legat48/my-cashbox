const checklist = new function() {
  this.send = function() {
    if(useChecklist) {
      let url = `http://checklist/checklist/get?token=${tokenPoint}&key=nokey`
      if(onlineSystem) {
        return new Promise(function(resolve, reject){
          ieFetch({
            method : 'POST',
            url: url,
            headerType: "Content-Type",
            type: "application/json",
            send: tokenPoint,
          })
          .then((json) => {
            let ans = JSON.parse(json)
            let data = ans.data;//массив пунктов
            logger(`Пункты чеклиста${json}`)
            if (ans.type === 'success') {
              let queryArr = '';
              checklistParttime = 0;
              data.forEach((item) => {
                if (queryArr) {
                  queryArr = `${queryArr},(${item.id}, '${item.text}','${item.parttime}',${item.status})`
                } else {
                  queryArr = `(${item.id}, '${item.text}','${item.parttime}',${item.status})`
                }
              })
              let q = `delete from checklist where id > 0`;
              db.query(q);
              q = `INSERT into checklist (id,text,parttime,status) values ${queryArr}`;
              logger(`Попытка это записать ${q}`)
              db.query(q);
              checklist.render(0);
              popup('Чек лист получен')
            }
            return;
          }).catch((e) => {
            popup('Чек лист не получен')
            return
          })
        })
      }
    }
  }
  this.updateObg = function() {
    let ans, q;
    q = `SELECT id,text,parttime,status from checklist where 1`
    try {
      ans = db.query(q);
    } catch (e) {

      db.conn.close()
    }
    let checklistObgArr = [];
    // преобразование ответа в массив
    if (ans) {
      for( let i = 0; ans[i] != undefined; i++) {
        let checklistItem = new ChecklistItem(ans[i].id, ans[i].text,ans[i].parttime, ans[i].status)
        checklistObgArr.push(checklistItem);
      }
      // обновление глобольного объекта
      checklistObg = {};
      checklistObgArr.forEach((e) => {
        checklistObg[e.id] = {
          id: e.id,
          parttime: e.parttime,
          text: e.text,
          status: e.status
        }
      })
    }
  }
  this.render = function(parttime, notFirst = false) {
    if(useChecklist) {
      checklist.updateObg();
      checklistWrap.classList.add('checklist_active')
      let checklistObgArr = [];
      for (const [key, value] of Object.entries(checklistObg)) {
        checklistObgArr.push(value)
      }
      if (checklistObgArr.length === 0) {
        checklist.send();
      }
      while (checklistList.firstChild) {
        checklistList.removeChild(checklistList.firstChild);
      }
      checklistObgArr.forEach((e) => {
        if (parttime == e.parttime) {
          const item = el('button', `checklist__item btn`, `${e.text}`, {'data-idchlst': `${e.id}`});
          checklistList.appendChild(item)
        }
      })
      const itemArr = document.querySelectorAll('.checklist__item');
      itemArr.forEach((item) => {
        item.addEventListener('click', ((e)=> {
          let passed = true;
          item.classList.add('checklist__item_active')
          // кнопка возврата и алгоритм возврата чека
          let q = `UPDATE checklist SET status = 1 WHERE id = ${Number(e.target.dataset.idchlst)}`;
          try {
            db.query(q);
          } catch (message) {
            logger(`ошибка перезаписи статуса чеклиста ${message.message}`)
          }
          itemArr.forEach((e) => {
            if(!e.classList.contains('checklist__item_active')) {
              passed = false
            }
          })
          if (passed) {
            checklistWrap.classList.remove('checklist_active')
            if (notFirst) {
              checklist.reportServer();
            } else {
              checklist.reportServer(true);
            }
          }
        }))
      })
    }
  }
  this.tracking = function() {
    if(useChecklist) {
      checklistBtnCollapse.addEventListener('click', (()=> {
        checklistWrap.classList.remove('checklist_active')
      }));
      checklistBtnExpand.addEventListener('click', (()=> {
        checklistWrap.classList.add('checklist_active')
      }))
    }
  }
  this.reportServer = function (parttimeMid) {
    if(useChecklist) {
      checklist.updateObg()
      let url = `http://checklist/checklist/set?token=${tokenPoint}&key=nokey`
      let sendArr = [];
      for (const [key, value] of Object.entries(checklistObg)) {
        const item = {
          id: value.id,
          status: value.status,
        }
        sendArr.push(item)
      }
      send = {checklist:sendArr};
      if(onlineSystem) {
        return new Promise(function(resolve, reject){
          ieFetch({
            method : 'POST',
            url: url,
            headerType: "Content-Type",
            type: "application/json",
            send: JSON.stringify(send),
          })
          .then((json) => {
            const ans = JSON.parse(json);
            if (ans.type === 'success') {
              popup('Отчет по чеклистам отправлен')
              if(parttimeMid) {
                // setTimeout(checklist.render(1), 14400000)\
                let reportFunc = checklist.render(1, true)
                setTimeout(reportFunc, 1)

              }
            } else {
              let reportFunc = checklist.reportServer();
              if(parttimeMid) {
                reportFunc = checklist.reportServer(1);
              }
              // setTimeout(reportFunc, 360000)
              setTimeout(reportFunc, 1)
            }
            return;
          }).catch((e) => {
            alert('Ошибка отправки отчета по чеклистам' + JSON.stringify(e))

            popup('Ошибка отправки отчета по чеклистам')
            return
          })
        })
      }
    }
  }
}