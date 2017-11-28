define(['../js/Luckynum'], function (_Luckynum) {
    'use strict';

    var obj = {}; /**
                   * @file import
                   * @author admin
                   * @date 2017/11/21
                   */

    obj.dom = document.getElementById('app');
    obj.img = {
        width: '160px',
        left: ['80px', '280px', '480px'],
        top: '8%',
        url: ['imgs/1.png', 'imgs/2.png', 'imgs/3.png', 'imgs/4.png', 'imgs/5.png', 'imgs/6.png']
    };
    obj.btn = {
        url: 'imgs/btn.png',
        width: '400px',
        height: '100px',
        top: '48%',
        left: '20%'
    };
    obj.startHook = function () {
        console.log('startHook');
    };
    obj.endHook = function (res) {
        console.log(res);
    };
    obj.width = '800px';
    obj.height = '800px';
    obj.backgroudImg = 'imgs/mac.png';
    var luckynum = new _Luckynum.Luckynum(obj);
    //console.log(luckynum)
    window.luckynum = luckynum;
});
//# sourceMappingURL=import.js.map