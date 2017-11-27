/**
 * @file import
 * @author admin
 * @date 2017/11/21
 */
import{ Luckynum } from '../js/Luckynum'
let obj={};
obj.dom=document.getElementById('app');
let luckynum=new Luckynum(obj);
console.log(luckynum)
window.luckynum=luckynum;


