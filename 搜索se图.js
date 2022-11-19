import { segment } from "oicq";
import fetch from "node-fetch";
import plugin from '../../lib/plugins/plugin.js'

const _path = process.cwd();
let timeout = 110000; //这里是撤回时间，单位毫秒，1000=1秒,0则为不撤回
let CD = {};
let isR18 = false;
let isR18s = true;
let flash = false;
let flashs = true;
export class example extends plugin {
  constructor () {
    super({
      name: 'acgs',
      dsc: 'acgs',
      event: 'message',
      priority: 500,
      rule: [//1.定义命令规则
        {
          reg: '^#*acg$',//这样是可以不用带#，把*删掉就变成必须带#才能触发.
          fnc: 'acg'//随机壁纸（无色图）
        },
        {
          reg: '^#*搜索(.*)$',
          fnc: 'acgs'//搜索P站涩图，群聊不色私聊色，例如：搜索刻晴
        },
        {
          reg: '^#*(涩图|瑟图|色图|色色|瑟瑟|涩涩|acg18|r18|R18|好看的|来点好看的|发点好看的|再来点)$',
          fnc: 'acg18'//获取随机二次元瑟瑟图片（群聊不色，私聊色）
        },
        {
          reg: '^#*(二次元图片|动漫图片|随机壁纸|壁纸)$',
          fnc: 'randomsetu'//随机壁纸（全部图）
        },
        {
          reg: '^#*(银发|白发|白毛|白头发)$',
          fnc: 'sliverhair'//获取随机银发图片
        },
        {
          reg: '^#*(兽耳|兽耳娘|魔物娘)$',
          fnc: 'kemomimi'//获取随机兽耳图片
        },
        {
          reg: '^#*星空$',
          fnc: 'xingkong'//获取随机星空图片
        },
        {
          reg: '^#*(少女|萝莉)$',
          fnc: 'wallpaper'//获取随机非色图壁纸（基本都是萝莉）
        },
        {
          reg: '^#*横屏壁纸$',
          fnc: 'wallpaperLandscape'//获取随机非色图横屏壁纸
        },
        {
          reg: '^#*竖屏壁纸$',
          fnc: 'wallpaperVerticalScreen'//获取随机非色图竖屏壁纸
        },
        {
          reg: '^#*(开启|关闭)+(R18|r18)$',
          fnc: 'R18Switch'//R18开关，群聊和私聊单独分开（注意群聊开启R18之后几乎搜不出图）
        },
        {
          reg: '^#*(开启|关闭)+(闪照|搜索闪照)$',
          fnc: 'isFlash'//闪照开关，群聊和私聊单独分开（注意群聊开启R18之后几乎搜不出图）
        },
        {
          reg: '^#*(设定|设置)+撤回(.*)$',
          fnc: 'chehui'//设置撤回时间，单位为秒
        },
        {
          reg: '^#*acg帮助$',
          fnc: 'help'//设置撤回时间，单位为秒
        },
      ]
    })
  }
async acg(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=iw233`;
  let url = `https://iw233.cn/api.php?sort=iw233`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);
  return true; //返回true 阻挡消息不再往下	
}
async acgs(e) {
if (e.isGroup) { //群聊
  if(CD[e.user_id] && !e.isMaster){
      e.reply("每5秒只能冲一次哦！");//更改完冷却时间记得更改这里的时间.
      return true;
  }
  CD[e.user_id] = true;
  CD[e.user_id] = setTimeout(() => {
      if (CD[e.user_id]) {
          delete CD[e.user_id];
      }
  }, 5000);//这里是冷却时间，单位毫秒.
  //e.reply(`正在搜图...`);
  let keyword = e.msg.replace("#","");
  keyword = keyword.replace("搜索","");
  let url = '';
  if(!isR18){
   url = `https://api.lolicon.app/setu/v2?tag=${keyword}&proxy=i.pixiv.re&r18=0`;//setu接口地址，把这里的18=0改成18=1可以发送r18图片，18=2则为混合图片.
  } else{
   url = `https://api.lolicon.app/setu/v2?tag=${keyword}&proxy=i.pixiv.re&r18=1`;
  }	  
  const response = await fetch(url); //调用接口获取数据
  let res = await response.json(); //结果json字符串转对象
  //let imgurl = res.data[0].urls.original;
  if(res.data.length == 0){
    e.reply("暂时没有搜到哦！换个关键词试试吧！");
    return true;
  }
  let TagNumber = res.data[0].tags.length;
  let Atags;
  let Btags;
  let qwq = 0;
  while (TagNumber--) {
    Atags = res.data[0].tags[TagNumber];
    if(qwq == 0){
      Btags = "";
    }
    Btags = Btags + " " + Atags;
    qwq++;
  }
  let msg;
  let pid = res.data[0].pid;
  //最后回复消息
  msg = [
    "标题：",
    res.data[0].title,
    "\n作者：",
    res.data[0].author,
   // "\n关键词：",
   // Btags,
    segment.image(res.data[0].urls.original),
  ];
  //发送消息
  let msgRes;
    if(!flash){//闪照
    	msgRes = await e.reply(msg);
  }else {
  	//let msgRes = await e.reply(segment.flash(res.urls[0]));
  	msgRes = await e.reply(segment.flash(res.data[0].urls.original));
  }
    if (timeout!=0 && msgRes && msgRes.message_id){
      let target = e.group;
      setTimeout(() => {
          target.recallMsg(msgRes.message_id);
       }, timeout);
    }
  return true; //返回true 阻挡消息不再往下
 } else{  //私聊
 if(CD[e.user_id] && !e.isMaster){
      e.reply("每5s只能冲一次哦！");//更改完冷却时间记得更改这里的时间.
      return true;
  }
  CD[e.user_id] = true;
  CD[e.user_id] = setTimeout(() => {
      if (CD[e.user_id]) {
          delete CD[e.user_id];
      }
  }, 5000);//这里是冷却时间，单位毫秒.
  //e.reply(`正在搜图...`);
  let keyword = e.msg.replace("#","");
  keyword = keyword.replace("搜索","");
  let url = '';
  if(!isR18s){
   url = `https://api.lolicon.app/setu/v2?tag=${keyword}&proxy=i.pixiv.re&r18=0`;//setu接口地址，把这里的18=0改成18=1可以发送r18图片，18=2则为混合图片.
  } else{
   url = `https://api.lolicon.app/setu/v2?tag=${keyword}&proxy=i.pixiv.re&r18=1`;
  }	
  const response = await fetch(url); //调用接口获取数据
  let res = await response.json(); //结果json字符串转对象
  //let imgurl = res.data[0].urls.original;
  if(res.data.length == 0){
    e.reply("暂时没有搜到哦！换个关键词试试吧！");
    return true;
  }
  let TagNumber = res.data[0].tags.length;
  let Atags;
  let Btags;
  let qwq = 0;
  while (TagNumber--) {
    Atags = res.data[0].tags[TagNumber];
    if(qwq == 0){
      Btags = "";
    }
    Btags = Btags + " " + Atags;
    qwq++;
  }
  let msg;
  let pid = res.data[0].pid;
  //最后回复消息
  msg = [
    "标题：",
    res.data[0].title,
    "\n作者：",
    res.data[0].author,
   // "\n关键词：",
   // Btags,
    segment.image(res.data[0].urls.original),
  ];
  //发送消息
  if(!flashs){
  	let msgRes = await e.reply(msg);
  	//let msgRes = await e.reply(segment.flash(res.urls[0]));
  }else {
  	let msgRes = await e.reply(segment.flash(res.data[0].urls.original));
  	
  }
  return true; //返回true 阻挡消息不再往下
 }
}
async acg18(e) {
  if (e.isGroup) { //群聊
  if(CD[e.user_id] && !e.isMaster){
      e.reply("每5秒只能冲一次哦！");//更改完冷却时间记得更改这里的时间.
      return true;
  }
  CD[e.user_id] = true;
  CD[e.user_id] = setTimeout(() => {
      if (CD[e.user_id]) {
          delete CD[e.user_id];
      }
  }, 5000);//这里是冷却时间，单位毫秒.
  //执行的逻辑功能
	let url='';
	let msg;
	if(!isR18){
		url = `https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=0`;
		//url = `http://iw233.fgimax2.fgnwctvip.com/API/Ghs.php`;
		//https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=0
	} else{
		//e.reply(`正在搜图...`);
		url = `https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=1`;
	}
	const response = await fetch(url); //调用接口获取数据
     let res = await response.json(); //结果json字符串转对象
	msg = [
		segment.image(res.data[0].urls.original),
	];
    //发送消息
    //let msgRes = await e.reply(msg);
    let msgRes;
    if(!flash){//闪照
  	//let msgRes = await e.reply(segment.flash(res.urls[0]));
  	msgRes = await e.reply(msg);
  }else {
  	msgRes = await e.reply(segment.flash(res.data[0].urls.original));
  }
    if (timeout!=0 && msgRes && msgRes.message_id){
      let target = e.group;
      setTimeout(() => {
          target.recallMsg(msgRes.message_id);
       }, timeout);
    }
    return true; //返回true 阻挡消息不再往下
  } 
else{  //私聊
    if(CD[e.user_id] && !e.isMaster){
      e.reply("每5s只能冲一次哦！");//更改完冷却时间记得更改这里的时间.
      return true;
	}
	CD[e.user_id] = true;
	CD[e.user_id] = setTimeout(() => {
      if (CD[e.user_id]) {
          delete CD[e.user_id];
      }
	}, 5000);//这里是冷却时间，单位毫秒.
    //e.reply(`正在搜图...`);
    let url = '';
    if(!isR18s){
     url = `https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=0`;//setu接口地址，把这里的18=0改成18=1可以发送r18图片，18=2则为混合图片.
    } else{
     url = `https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=1`;
    }	
    const response = await fetch(url); //调用接口获取数据
    let res = await response.json(); //结果json字符串转对象
    let TagNumber = res.data[0].tags.length;
    let Atags;
    let Btags;
    let qwq = 0;
    while (TagNumber--) {
      Atags = res.data[0].tags[TagNumber];
      if(qwq == 0){
        Btags = "";
      }
      Btags = Btags + " " + Atags;
      qwq++;
    }
    let msg;
    let pid = res.data[0].pid;
    //最后回复消息
    msg = [
      "标题：",
      res.data[0].title,
      "\n作者：",
        res.data[0].author,
     // "\n关键词：",
     // Btags,
      segment.image(res.data[0].urls.original),
    ];
    //发送消息
   //  e.reply(msg)
    let msgRes;
    if(!flashs){//闪照
  	//let msgRes = await e.reply(segment.flash(res.urls[0]));
	msgRes = await e.reply(msg);
  }else {
  	msgRes = await e.reply(segment.flash(res.data[0].urls.original));
  }
    return true; //返回true 阻挡消息不再往下
  }
}
async randomsetu(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=random`;
  let url = `https://iw233.cn/api.php?sort=random`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);
  return true; //返回true 阻挡消息不再往下
}
async sliverhair(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=yin`;
  let url = `https://iw233.cn/api.php?sort=yin`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async kemomimi(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=cat`;
  let url = `https://iw233.cn/api.php?sort=cat`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async xingkong(e) {
 //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=xing`;
  let url = `https://iw233.cn/api.php?sort=xing`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async wallpaper(e) {
  //执行的逻辑功能
  let url = `https://iw233.cn/api.php?sort=top`;
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=top`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async wallpaperLandscape(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=pc`;
  let url = `https://iw233.cn/api.php?sort=pc`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async wallpaperVerticalScreen(e) {
  //执行的逻辑功能
  //let url = `https://mirlkoi.ifast3.vipnps.vip/api.php?sort=mp`;
  let url = `https://iw233.cn/api.php?sort=mp`;
  let msg = [
      segment.image(url),
  ];
  //发送消息
  e.reply(msg);

  return true; //返回true 阻挡消息不再往下
}
async R18Switch(e) {
  let onoff;
  if(e.msg.indexOf("R18")>-1){
    onoff = e.msg.replace("R18","");
  }
  else if(e.msg.indexOf("r18")>-1){
    onoff = e.msg.replace("r18","");
  }
  if (e.isGroup) {
    if(onoff == '开启' && e.isMaster){
	    e.reply(`群聊R18已开启`);
	    isR18 = true
    } else if(onoff == '关闭' && e.isMaster){
  	  e.reply(`群聊R18已关闭`);
	    isR18 = false
    } else if(!e.isMaster){
      e.reply(`只有主人可以命令本机器人哦~`);
    }
  } else {
    if(onoff == '开启' && e.isMaster){
	    e.reply(`私聊R18已开启`);
	    isR18s = true
    } else if(onoff == '关闭' && e.isMaster){
  	  e.reply(`私聊R18已关闭`);
	    isR18s = false
    } else if(!e.isMaster){
      e.reply(`只有主人可以命令本机器人哦~`);
    }
  }
}
async isFlash(e) {
  let onoff;
  if(e.msg.indexOf("搜索闪照")>-1){
    onoff = e.msg.replace("搜索闪照","");
  }
  else if(e.msg.indexOf("闪照")>-1){
    onoff = e.msg.replace("闪照","");
  }
  if (e.isGroup) {
    if(onoff == '开启' && e.isMaster){
		flash = true;
		e.reply(`群聊搜索闪照已开启`);
    } else if(onoff == '关闭' && e.isMaster){
		flash = false;
		e.reply(`群聊搜索闪照已关闭`);
    } else if(!e.isMaster){
		e.reply(`只有主人可以命令本机器人哦~`);
    }
  } else {
    if(onoff == '开启' && e.isMaster){
		flashs = true;
		e.reply(`私聊搜索闪照已开启`);
    } else if(onoff == '关闭' && e.isMaster){
		flashs = false;
		e.reply(`私聊搜索闪照已关闭`);
    } else if(!e.isMaster){
		e.reply(`只有主人可以命令本机器人哦~`);
    }
  }
}
async chehui(e) {
  let onoff;
  if(e.msg.indexOf("设定")>-1){
    onoff = e.msg.replace("设定撤回","");
  }
  else if(e.msg.indexOf("设置")>-1){
    onoff = e.msg.replace("设置撤回","");
  }
  if(onoff == '关闭' && e.isMaster){
    e.reply(`自动撤回已关闭`);
    timeout = 0;
  } else if(onoff == '开启' && e.isMaster){
    e.reply(`自动撤回已开启，\n默认撤回时长为15秒`);
    timeout = 15000;
  } else if(e.isMaster){
    onoff = parseInt(Math.abs(onoff))
    onoff = Math.trunc(onoff)
    if(typeof onoff === 'number'){
      timeout = onoff*1000;
      e.reply(`自动撤回已设定为`+onoff+`秒`);
    } else {
      e.reply(`输入的指令有误`);
    }
  } else if(!e.isMaster){
    e.reply(`只有主人可以命令本机器人哦~`);
  }
}
async help(e) {
    e.reply(`#acg
#搜索+关键词
#(涩图|瑟图|色图|色色|瑟瑟|涩涩|acg18|r18|R18|好看的|来点好看的|发点好看的|再来点)
#(二次元图片|动漫图片|随机壁纸|壁纸)
#(银发|白发|白毛|白头发)
#(兽耳|兽耳娘|魔物娘)
#星空
#(少女|萝莉)
#横屏壁纸
#竖屏壁纸
#(开启|关闭)+(R18|r18)
#(开启|关闭)+(闪照|搜索闪照)
#(设定|设置)+撤回+数字`);
}
}

