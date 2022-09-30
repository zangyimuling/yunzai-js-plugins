//搜索并分享歌曲，使用方法发送#点歌 歌曲名 歌手
import fetch from "node-fetch";
import { segment } from "oicq";

export const rule = {
  shareMusic: {
    reg: "^[非VIP]*点歌(.*)$",
    priority: 5000, //优先级，越小优先度越高
    describe: "点歌",
  },
};
const urlList = {
  qq: "http://150.158.140.48:3200/getSmartbox?key=paramsSearch",
  kugou: "http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=paramsSearch&page=1&pagesize=20&showtype=1",
  wangyiyun: "http://150.158.140.48:3000/cloudsearch?keywords=paramsSearch",
};

export async function shareMusic(e) {
  //e.msg 用户的命令消息
  let msg = e.msg.replace(/\s*/g,"")
  let isQQReg = new RegExp("^[非VIP]*点歌*(qq|QQ)(.*)$");
  let isKugouReg = new RegExp("^[非VIP]*点歌*(kg|kugou|酷狗)(.*)$");
  let isWangYiyunReg = new RegExp("^[非VIP]*点歌*(网易云|网抑云|网易|163)(.*)$");
  let isQQ = isQQReg.test(msg);
  let isKugou = isKugouReg.test(msg);
  let isWangYiyun = isWangYiyunReg.test(msg);
  if (!isQQ && !isKugou && !isWangYiyun) isQQ = true;//如果三个都没有匹配到就默认酷狗音乐
  let isPay = msg.includes("非VIP");
  if (isPay) console.log('什么！这个穷鬼点非VIP？？？')
  msg = msg.replace(/[非VIP|点歌|qq|QQ|kugou|kg|酷狗|网易云|网易|网抑云|163]/g, "");
  console.log("这个崽种在搜", msg);
  try {
    msg = encodeURI(msg);
    const params = { search: msg };
    let apiName = isWangYiyun ? "wangyiyun" : isKugou ? "kugou" : "qq";
    let url = urlList[apiName].replace("paramsSearch", msg);
    let response = await fetch(url);//调用接口获取数据
    console.log(`${url}`);
    let res = await response.json();//结果json字符串转对象
    let songList = [];
    if (isKugou)
    	 songList = isPay ? res.data.info.filter((item) => !item.pay_type_sq) : res.data.info;
    else if(isQQ)
    	 songList = res.response.data.song.itemlist;
    else 
    	 songList = res.result.songs;
    if (!songList[0]){
    	 await e.reply(`没有找到该歌曲哦`);
    }else if (e.isPrivate) {
    		console.log(`好友私聊搜索`);
    		await e.friend.shareMusic(
			isQQ ? "qq" : isKugou ? "kugou" : "163",
			isQQ ? songList[0].id : isKugou ? songList[0].hash : songList[0].id
			);
   	}else if (e.isGroup) {
    		console.log(`群聊搜索`);
    	 	await e.group.shareMusic(
        		isQQ ? "qq" : isKugou ? "kugou" : "163",
			isQQ ? songList[0].id : isKugou ? songList[0].hash : songList[0].id
			);
		if (isWangYiyun) {
       		 let response0 = await fetch(`http://music.163.com/song/media/outer/url?id=${songList[0].id}`);
       		  console.log(`${songList[0].id}`);
       		 const data = await response0;
      		  if (!data?.url) return true
      		  const music = await segment.record(data?.url)
       		 await e.reply(music)
     	}	
     }
	
  } catch (error) {
    console.log(error);
  }
  return true;
}
