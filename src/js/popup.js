function popup(message, meme, staticSelector) { // selector если указан добавить попап и не уберет его
  const popup = 'popup';
  let timer = meme ? 5000 : 3000;
  let selector = staticSelector;

  // let memes = [
  //   // жабы
  //   'https://i.pinimg.com/564x/3c/ca/65/3cca6508d218f35f658b8306d99d986b.jpg',
  //   'https://i.pinimg.com/564x/61/15/d5/6115d5588989bad99a0b311568fefa84.jpg',
  //   'https://i.pinimg.com/564x/3d/ac/91/3dac91db3205d457e60ee353b29d04ee.jpg',
  //   'https://i.pinimg.com/564x/9d/c9/ec/9dc9ecf53238ff7bc30e999b4f30e54c.jpg',
  //   'https://i.pinimg.com/564x/ac/3e/d4/ac3ed47077cee628df1a520790e68673.jpg',
  //   'https://i.pinimg.com/564x/30/60/e2/3060e23900b7773d53fe45c8e070282f.jpg',
  //   'https://i.pinimg.com/564x/83/92/4f/83924f7a5fbc589551ffede0efd510d8.jpg',
  //   'https://i.pinimg.com/564x/9b/b2/52/9bb2525a6f5df49bab3c58b8b1a2c6eb.jpg',
  //   'https://i.pinimg.com/564x/6f/94/02/6f9402f6d89d5708ae67972bb08b99a2.jpg',
  //   'https://i.pinimg.com/564x/4c/4b/51/4c4b512a6ee82cf4d453ce96949a74f6.jpg',
  //   'https://i.pinimg.com/564x/00/07/7a/00077a10cb0c4e4269ffe2cf96211f68.jpg',
  //   'https://i.pinimg.com/564x/33/04/6d/33046daf10c3cbac4f28a03cf158ebbf.jpg',
  //   'https://i.pinimg.com/564x/26/da/e8/26dae85e2597591185099ac77493928b.jpg',
  //   'https://i.pinimg.com/564x/60/d6/2b/60d62bb18a38f89bed868a80934a1f48.jpg',
  //   'https://i.pinimg.com/564x/29/c3/46/29c346e52621c03a99e4c249b0a1a283.jpg',
  //   'https://i.pinimg.com/564x/46/92/6e/46926ee495e285a5103682cd6f8ff7cb.jpg',
  //   'https://i.pinimg.com/564x/08/ca/b4/08cab493b83abaa00bfd2ec6a6a0334a.jpg',
  //   'https://i.pinimg.com/564x/b0/58/1d/b0581dc0578264d0ebd562fa3008d2bf.jpg',
  //   'https://i.pinimg.com/564x/b3/87/a7/b387a755a053a9d53e8aed722c3ffe88.jpg',
  //   'https://i.pinimg.com/564x/8b/bc/01/8bbc012ddb77cf5f730cf13c12b67f6b.jpg',
  //   'https://i.pinimg.com/564x/91/82/cc/9182cc38e2c59124314080418e88984e.jpg',
  //   'https://i.pinimg.com/564x/82/8a/cd/828acd022fbf35d92b5c3c2c1fb680e6.jpg',
  //   'https://i.pinimg.com/564x/9a/bf/02/9abf027738a98f51e26e21b958e76f3a.jpg',
  //   'https://i.pinimg.com/564x/f6/47/52/f647524fc1d3fba32885cd703b608e39.jpg',
  //   'https://i.pinimg.com/564x/69/9a/3c/699a3c72e8d52da915c1427d526c469e.jpg',
  //   'https://i.pinimg.com/564x/6c/35/96/6c359655d3c2ca7f6a3629a9845bf938.jpg',
  //   'https://i.pinimg.com/564x/e8/19/d0/e819d0ac5ca8cfd1f3e0f9aad2f8719f.jpg',
  //   'https://i.pinimg.com/564x/e7/a3/de/e7a3dee60ca35abb1d7f8cac5eaf9697.jpg',
  //   'https://i.pinimg.com/564x/50/a7/98/50a79876b47129744cd59f53cf90ec16.jpg',
  //   'https://i.pinimg.com/564x/22/79/49/227949db8cfcc6fb38173357a3c6571f.jpg',
  //   'https://i.pinimg.com/564x/da/2f/24/da2f24bebd5dcf12dcfdeb2c68aa7a4f.jpg',
  //   //тыквы
  //   'https://i.pinimg.com/564x/9f/cb/14/9fcb14521deb2cf3a893d58a1820552f.jpg',
  //   'https://i.pinimg.com/564x/fe/84/0d/fe840df204555839b97f01173e934989.jpg',
  //   'https://i.pinimg.com/564x/e9/f4/24/e9f424a3825cdf4a8647303b16e0f38e.jpg',
  //   'https://i.pinimg.com/564x/7d/17/0c/7d170c3bb26e3b36d5a10441f9a33b35.jpg',
  //   'https://i.pinimg.com/564x/d1/7a/b9/d17ab9e5d96544db3028835416591d0d.jpg',
  //   'https://i.pinimg.com/564x/66/5a/11/665a11839858728d5cde8f04b5a91e07.jpg',
  //   'https://i.pinimg.com/564x/b5/0e/28/b50e281b8bb9f30f90fafe0c640b3835.jpg',
  //   'https://i.pinimg.com/564x/74/aa/3c/74aa3cadcda4a9c5c304ded4e1c867d4.jpg',
  //   'https://i.pinimg.com/564x/e9/c3/43/e9c34349e20e69edc0c95cc6e34e7f42.jpg',
  //   'https://i.pinimg.com/originals/b8/ac/9f/b8ac9fe6b70389fe6ac1e02ba4450520.jpg',
  //   'https://i.pinimg.com/564x/d1/da/50/d1da504813cfdeba7c281abefc66e0bd.jpg',
  //   'https://i.pinimg.com/564x/13/40/79/13407918362e801badaf82fe9b0dec41.jpg',
  //   'https://i.pinimg.com/564x/89/3a/fc/893afc345d2a8cf101788451b0a1cf6f.jpg',
  //   'https://i.pinimg.com/564x/47/d1/4d/47d14de92d256fe68d66eb6fb273d6b8.jpg',
  //   'https://i.pinimg.com/564x/e8/78/0b/e8780b6df5716e8c8db5a0ea2ca9d9f9.jpg',
  //   'https://i.pinimg.com/564x/98/aa/bc/98aabc4560c0c78ab96987751dac2356.jpg',
  //   'https://i.pinimg.com/564x/1d/52/43/1d52431d6f5afa78aaa6004bac0bfe26.jpg',
  //   'https://i.pinimg.com/564x/36/c4/89/36c4899cf4822ff7f4e8eb1fe4caebee.jpg',
  //   'https://i.pinimg.com/564x/be/aa/59/beaa594c4c828f7413deaf02e7508a9c.jpg',
  //   'https://i.pinimg.com/564x/ad/ce/5e/adce5eab16fe7448207d803f30207916.jpg',
  //   'https://i.pinimg.com/564x/a8/36/35/a83635bfb1d8c6aadf5635c661662f3e.jpg',
  //   'https://i.pinimg.com/736x/aa/84/c1/aa84c17fe96b6438c513499e61fee6ac.jpg',
  //   'https://i.pinimg.com/564x/83/10/18/83101897376367d2fa3c4f73c65f32eb.jpg',
  //   'https://i.pinimg.com/564x/11/20/c3/1120c3397ae1a6b62a45b226d5a3f13f.jpg',
  //   'https://i.pinimg.com/564x/30/3d/e4/303de493f23db6b7abfbc5ae6433ad01.jpg',
  //   'https://i.pinimg.com/564x/e7/b2/79/e7b2792c4fc15c7723b6a393cdd6debe.jpg',
  //   'https://i.pinimg.com/564x/89/2d/7a/892d7a8fc44d61996db7fd351bfc14d8.jpg',
  //   'https://i.pinimg.com/564x/28/13/bc/2813bcf0f429ae77499e7e4383a7cfdb.jpg',
  //   'https://i.pinimg.com/564x/6e/ce/1a/6ece1a66602f89c07183c213257bbd23.jpg',
  //   'https://i.pinimg.com/564x/0d/fa/f4/0dfaf4475830b7fcb32b53d76c8398d5.jpg',
  //   'https://i.pinimg.com/564x/89/5f/a0/895fa076d3df101aff8494feafe2ad55.jpg',
  //   'https://i.pinimg.com/564x/e0/42/8e/e0428e100d451d014456c68d6e4376e7.jpg',
  //   'https://i.pinimg.com/564x/b9/33/fc/b933fce55462c4684934f7ff87625559.jpg',
  //   'https://i.pinimg.com/564x/1b/f2/98/1bf29840319d2e718006a7d6a4e40674.jpg',
  //   'https://i.pinimg.com/564x/f3/7e/b0/f37eb0866496135edd8d78c5368f220a.jpg',
  //   'https://i.pinimg.com/564x/b5/5d/15/b55d1563603b4d4621dfe0fabe368e0d.jpg',



  // ]
  function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  const newItem = el('div', `${popup}`, [
    el('div', `${popup}__content`, JSON.stringify(message).replace(/['"]+/g, '')),
  ])
  let root = document.querySelector('.alerts')
  if(selector) {
    root = document.querySelector(`.${selector}`); newItem.classList.add('popup_absolute')
  }
  root.appendChild(newItem);
  // if(meme && onlineSystem){
  //   let newRnd = randomInteger(0,memes.length - 1);
  //   const memeContainer = el('div', `${popup}__meme`, '')
  //   const iframe = document.createElement("img");
  //   iframe.classList.add('iframeTest')
  //   iframe.src = memes[newRnd];
  //   newItem.appendChild(memeContainer);
  //   memeContainer.appendChild(iframe);
  // }
  root.style.opacity = '1';
  setTimeout(() => {
    newItem.style.opacity = '1';
    newItem.style.transform = "translateY(0)"
  }, 30)
  setTimeout(() => {
    if(selector) return;
    newItem.style.opacity = '0';
    newItem.style.transform = "translateY(+100%)"
    setTimeout(() => {
      newItem.style.display = 'none';
    }, 300)
  }, timer)
  clearTimeout(alertsTimeOut);
  if(selector) return;
   alertsTimeOut = setTimeout(() => {
    root.style.opacity = '0';
  },timer + 300);
}