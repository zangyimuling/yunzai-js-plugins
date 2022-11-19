import { segment } from "oicq";
import fetch from "node-fetch";

const _path = process.cwd();
let timeout = 110000; //这里是撤回时间，单位毫秒，1000=1秒,0则为不撤回
var num= 0 ; 

export const rule = {
  coss: {
    reg: "^#*(COS|来套cos|来一套cos|来份cos|来张cos|随机cos)$",
    priority: 100,
    describe: "获取随机cos图壁纸",
  },
  chehui: {
    reg: "^(设定|设置)+cos撤回(.*)$",
    priority: 10,
    describe: "设置撤回时间，单位为秒",
  },
  tongji: {
    reg: "^(cos统计|COS统计)$",
    priority: 100,
    describe: "COS次数统计",
  },
};
export async function coss(e) {
	let images=[20];
	let msg=[];
	let url = `http://ovooa.com/API/cosplay/api.php`;
	//let url = `https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=1`;
    const response = await fetch(url); //调用接口获取数据
    let res = await response.json(); //结果json字符串转对象
    images=res.data.data;
    console.log(images.length);
//    let msgRes00 = await e.reply(`${images}`);
//    let msgRes0 = await e.reply(`图组长度为${res.data.data.length}`);
    msg = [res.data.Title,];
//    for(var i=0;i<res.data.data.length;i++){
	for(var i=0;i<7;i++){
    		msg[i+1]=segment.image(images[i]);
    }
//    let msgRes = await e.reply(`测试中`);//发送测试消息
    let msgRes = await e.reply(msg);//发送消息
	num++;
    if (timeout!=0 && msgRes && msgRes.message_id){//超时撤回
      let target = e.group;
      setTimeout(() => {
          target.recallMsg(msgRes.message_id);
       }, timeout);
    }
    return true; //返回true 阻挡消息不再往下
}
export async function chehui(e) {
  let onoff;
  if(e.msg.indexOf("设定")>-1){
    onoff = e.msg.replace("设置cos撤回","");
  }
  else if(e.msg.indexOf("设置")>-1){
    onoff = e.msg.replace("设置cos撤回","");
  }
  if(onoff == '关闭' && e.isMaster){
    e.reply(`cos自动撤回已关闭`);
    timeout = 0;
  } else if(onoff == '开启' && e.isMaster){
    e.reply(`cos自动撤回已开启，\n默认cos撤回时长为15秒`);
    timeout = 15000;
  } else if(e.isMaster){
    onoff = parseInt(Math.abs(onoff))
    onoff = Math.trunc(onoff)
    if(typeof onoff === 'number'){
      timeout = onoff*1000;
      e.reply(`cos自动撤回已设定为`+onoff+`秒`);
    } else {
      e.reply(`输入的指令有误`);
    }
  } else if(!e.isMaster){
    e.reply(`只有主人可以命令本机器人哦~`);
  }
}
export async function tongji(e) {
    let msg = `自脚本更新以来共发送过 ${num} 次COS图片`;
    e.reply(msg);
}