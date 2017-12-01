define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Luckynum = exports.Luckynum = function () {
        function Luckynum(config) {
            var _this = this;

            _classCallCheck(this, Luckynum);

            this._img = config.img;
            this._myDom = config.dom;
            this._width = config.width;
            this._height = config.height;
            this._backgroundImg = config.backgroudImg;
            this._btn = config.btn;
            this._imgWidth = config.img.width.split('px')[0];

            this._topArr = []; // img对应的top值
            this._luckNum = []; //抽奖结果
            this._speed = []; //各个图片转动的速度
            this._flag = []; // 每个图片是否已停止
            this._timer = null; //超时计时器

            // 为实现慢慢停下来的效果 两次到达后才停下来
            this._check = [];
            this._checkAgain = [];

            this._run = false; // 数字转动后，让开始按钮不可触发
            this._top = []; // 当前图片所处位置
            this.addHtml();
            this.getTopArr();
            this.radomStart();

            this._startHook = config.startHook || this.startHook;
            this._endHook = config.endHook || this.endHook;

            //console.log(this._topArr)
            //为按钮添加点击事件
            var start = document.getElementById('luckynum-start');
            start.addEventListener('click', function () {
                _this.startRun();
            });
        }
        /*
        * 获得一个随机的初始值
        *
        * */


        _createClass(Luckynum, [{
            key: 'radomStart',
            value: function radomStart() {
                for (var i = 0; i < 3; i++) {
                    document.getElementById('luckynum-img' + (i + 1)).style.top = this._topArr[Math.floor(Math.random() * this._img.url.length)] + 'px';
                    //console.log(document.getElementById('img'+(i+1)).style.top);
                }
            }

            /*
            * 设置获奖数字，可从服务端获取
            *
            **/

        }, {
            key: 'setNum',
            value: function setNum(num) {
                var _this2 = this;

                this._luckNum = (num + '').split('');
                this._luckNum = this._luckNum.map(function (x) {
                    return x - 1;
                });
                var isRightNum = true;
                this._luckNum.map(function (x) {
                    if (x >= _this2._img.url.length) isRightNum = false;
                });
                if (!isRightNum) {
                    alert('错误的抽奖结果');
                    this._checkAgain = [true, true, true];
                    this._run = false;
                    clearTimeout(this._timer);
                    this._endHook('错误的抽奖结果');
                }
                //console.log(this._luckNum);
            }

            /*
            * 初始化dom
            *
            * */

        }, {
            key: 'addHtml',
            value: function addHtml() {

                var div = document.createElement('div');
                div.setAttribute('id', 'luckynum');
                div.style.width = this._width;
                div.style.height = this._height;
                div.innerHTML = '<div class="luckynum-content">\n                            <div class="luckynum-mask " id="luckynum-mask1"><div class=\'luckynum-imgs\' id=\'luckynum-img1\'></div></div>\n                            <div class="luckynum-mask " id="luckynum-mask2"><div class=\'luckynum-imgs\' id=\'luckynum-img2\'></div></div>\n                            <div class="luckynum-mask " id="luckynum-mask3"><div class=\'luckynum-imgs\' id=\'luckynum-img3\'></div></div>\n                            <div class="luckynum-btn" id="luckynum-start"></div>\n                         </div>';
                this._myDom.appendChild(div);

                var content = document.getElementsByClassName('luckynum-content')[0];
                content.style.backgroundImage = "url(" + this._backgroundImg + ")";
                //console.log(content.style.backgroundImage)
                var imgString = '';
                for (var i = 0; i < this._img.url.length; i++) {
                    imgString += '<img class="luckynum-myimg" src="' + this._img.url[i] + '" />';
                }
                for (var _i = 1; _i <= 3; _i++) {
                    var img = document.getElementById('luckynum-img' + _i);
                    var mask = document.getElementById('luckynum-mask' + _i);
                    //img.style.height=mask.clientWidth.toString().split('px')[0]+'px';
                    //mask.style.left=10+25*(i-1)+'%';
                    mask.style.left = this._img.left[_i - 1];
                    mask.style.top = this._img.top;
                    mask.style.height = this._imgWidth * 1.5 + 'px';
                    mask.style.width = this._imgWidth + 'px';
                    // console.log( mask.style.height)
                    img.innerHTML = imgString + imgString;
                }
                var myimg = document.getElementsByClassName('luckynum-myimg');
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = myimg[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var m = _step.value;

                        m.style.height = this._imgWidth + 'px';
                        // console.log(m.style.height)
                    }

                    //生成btn
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var btn = document.getElementById('luckynum-start');
                btn.style.backgroundImage = 'url(' + this._btn.url + ')';
                btn.style.width = this._btn.width;
                btn.style.height = this._btn.height;
                btn.style.top = this._btn.top;
                btn.style.left = this._btn.left;
                this.radomStart();
            }

            /**
             *  计算结束的位置
             *
             **/

        }, {
            key: 'getTopArr',
            value: function getTopArr() {

                for (var i = 1; i < this._img.url.length; i++) {
                    // this._topArr[i]=-86+(-126*(i-1));
                    // 120 280
                    this._topArr[i] = -this._imgWidth * (i - 0.25);
                }
                this._topArr[0] = this._topArr[this._img.url.length - 1] - this._imgWidth;
                this._topArr[this._img.url.length] = this._topArr[this._img.url.length - 1] - this._imgWidth * 2;
            }
            /**
            * 开始转动
            *
            **/

        }, {
            key: 'startRun',
            value: function startRun() {
                var _this3 = this;

                if (!this._run) {
                    this.reSet();
                    console.log('start run');
                    this._startHook();
                    this._run = true;
                    this.runUp(0);
                    this.runUp(1);
                    this.runUp(2);
                    this._timer = setTimeout(function () {
                        if (_this3._luckNum.length === 0) {
                            _this3._checkAgain = [true, true, true];
                            alert('抽奖超时');
                            _this3._run = false;
                            clearTimeout(_this3._timer);
                            _this3._endHook('抽奖超时');
                            // this.radomStart();
                            // this.reSet();
                        }
                    }, 10000);
                }
            }

            /*
            * 根据传入的index转动对应的img
            *
            * */

        }, {
            key: 'runUp',
            value: function runUp(index) {
                var img = document.getElementById('luckynum-img' + (index + 1));
                this._top[index] = img.style.top.split('px')[0];
                this._speed[index] = 10;
                this.runfun(img, index);
            }

            /*
            * 控制循环的函数，当3个img都停下来就重置
            * 用setimeout代替setInterval
            *
            * */

        }, {
            key: 'runfun',
            value: function runfun(img, index) {
                var _this4 = this;

                this.run(img, index);
                if (!this._checkAgain[index]) {
                    setTimeout(function () {
                        _this4.runfun(img, index);
                    }, 10);
                } else {
                    if (this._flag.filter(function (b) {
                        return b;
                    }).length === 3) {
                        //console.log(this._luckNum);
                        console.log('reSet');
                        clearTimeout(this._timer);
                        this._endHook(this._luckNum.map(function (x) {
                            return ++x;
                        }));
                        this.reSet();
                    }
                }
            }

            /*
            * 循环函数，每次转动的速度为speed[index]
            *
            * */

        }, {
            key: 'run',
            value: function run(img, index) {
                /*if(this._speed[index]===undefined)
                {
                    console.log(this);
                    return;
                }*/
                // console.log(index);
                if (this._luckNum[index] !== undefined && this.isNow(index)) {
                    this._flag[index] = true;
                    this._checkAgain[index] = true;
                }

                if (this._top[index] <= this._topArr[this._img.url.length]) {
                    // debugger
                    this._top[index] = -this._imgWidth * 0.75;
                }
                img.style.top = this._top[index] + 'px';
                this._top[index] -= this._speed[index];
                //console.log(this._luckNum[index],img.style.top)
            }

            /*
            * 判断当前是否应该停下
            * return true/false
            * */

        }, {
            key: 'isNow',
            value: function isNow(index) {
                var num = this._luckNum[index];

                //前一个停下后速度才变为4，到达一次后速度变为2
                switch (index) {
                    case 2:
                        if (this._flag[1]) {
                            this._speed[index] = 4;
                            if (this._check[index]) this._speed[index] = 2;
                        }
                        break;
                    case 1:
                        if (this._flag[0]) {
                            this._speed[index] = 4;
                            if (this._check[index]) this._speed[index] = 2;
                        }
                        break;
                    case 0:
                        this._speed[index] = 4;
                        if (this._check[index]) this._speed[index] = 2;
                }

                //到达对应的位置
                if (Math.abs(this._top[index] - this._topArr[num]) < 5) {
                    //如果第二次到达就停下来，否则就标记一次到达
                    if (this._check[index]) {
                        // console.log(this._speed[index])
                        return true;
                    } else {
                        if (this._speed[index] === 4) {
                            this._check[index] = true;
                            this._speed[index] = 2;
                        }
                    }
                }
                return false;
            }

            /*
            * 重置所有参数
            *
             * */

        }, {
            key: 'reSet',
            value: function reSet() {
                this._luckNum = [];
                this._speed = [];
                this._flag = [];
                this._check = [];
                this._run = false;
                this._checkAgain = [];
            }
        }, {
            key: 'startHook',
            value: function startHook() {
                console.log('默认startHook');
                return 0;
            }
        }, {
            key: 'endHook',
            value: function endHook() {
                console.log('默认endHook');
                return 0;
            }
        }]);

        return Luckynum;
    }();
});
//# sourceMappingURL=Luckynum.js.map