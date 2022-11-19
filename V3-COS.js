import { segment } from "oicq";
import fetch from "node-fetch";
import plugin from '../../lib/plugins/plugin.js'

const _path = process.cwd();
let timeout = 110000; //这里是撤回时间，单位毫秒，1000=1秒,0则为不撤回
var num= 0 ; 

export class example extends plugin {
  constructor () {
    super({
      name: 'COS',
      dsc: 'COS',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#*(COS|来套cos|来一套cos|来份cos|来张cos|随机cos)$',
          fnc: 'coss'
        },
         {
          reg: '^(设定|设置)+cos撤回(.*)$',
          fnc: 'chehui'
        },
        {
          reg: '^(cos统计|COS统计)$',
          fnc: 'tongji'
        },
      ]
    })
  }
async coss (e) {
	let images=[20];
	let msg=[];
	let url = `http://ovooa.com/API/cosplay/api.php`;
	console.log(url);
    const response = await fetch(url); //调用接口获取数据
    let res = await response.json(); //结果json字符串转对象
    images=res.data.data;
    console.log(images.length);
//    for(var i=0;i<20;i++){
//    		console.log(images[i]);
//    }
    msg = [res.data.Title,];
//    for(var i=0;i<images.length;i++){
	const randomIndex = Math.floor(Math.random() * 100) + 1;
	let num1 = Math.ceil(randomIndex / 10)+6;
	console.log(`发送${num1}张cos图片`);
	for(var i=0;i<num1;i++){
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
async chehui (e) {
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
async tongji () {
	let msg = `自脚本更新以来共发送过 ${num} 次COS图片`;
	e.reply(msg);
}
}
