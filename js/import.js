/**
 * @file import
 * @author admin
 * @date 2017/11/21
 */
import{ Luckynum } from '../js/Luckynum'
let obj={};
obj.dom=document.getElementById('app');
obj.img={
    width:'160px',
    left:['80px','280px','480px'],
    top:'8%',
    url:['imgs/1.png','imgs/2.png','imgs/3.png','imgs/4.png','imgs/5.png','imgs/6.png'],
};
obj.btn={
    url:'imgs/btn.png',
    width:'400px',
    height:'100px',
    top:'48%',
    left:'20%'
}
obj.startHook=()=>{
    console.log('startHook')
}
obj.endHook=(res)=>{
    console.log(res);
}
obj.width='800px';
obj.height='800px';
obj.backgroudImg='imgs/mac.png';
let luckynum=new Luckynum(obj);
//console.log(luckynum)
window.luckynum=luckynum;


