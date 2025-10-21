/**
// * @file Luckynum
 * @author admin
 * @date 2017/11/21
 */

/**
 * 老虎机抽奖组件（安全优化版）
 * - 不改变对外 API 行为
 * - 采用 requestAnimationFrame + delta time 驱动动画
 * - 降低强制同步布局，使用 transform 动画
 */
export class Luckynum {
  /**
   * @param {Object} config
   * @param {HTMLElement} config.dom 容器节点
   * @param {{width:string,left:string[],top:string,url:string[]}} config.img 图片配置
   * @param {{url:string,width:string,height:string,top:string,left:string}} config.btn 按钮配置
   * @param {string} config.width 组件宽度
   * @param {string} config.height 组件高度
   * @param {string} config.backgroudImg 背景图
   * @param {Function} [config.startHook]
   * @param {Function} [config.endHook]
   */
  constructor(config) {
    // 基本配置
    this._img = config && config.img ? config.img : { url: [], width: '0px', left: [], top: '0' };
    this._myDom = config && config.dom ? config.dom : document.body;
    this._width = config && config.width ? config.width : '100%';
    this._height = config && config.height ? config.height : '100%';
    this._backgroundImg = config && config.backgroudImg ? config.backgroudImg : '';
    this._btn = config && config.btn ? config.btn : {};
    this._imgWidth = parseFloat(this._img.width) || 0;

    // 状态与缓存
    this._topArr = []; // img 对应的 top 目标值集合
    this._luckNum = []; // 抽奖结果（内部从 0 开始）
    this._speed = [0, 0, 0]; // 转动速度（px/s）
    this._flag = [false, false, false]; // 每个图片是否已停止
    this._timer = null; // 超时计时器

    // 为实现慢慢停下来的效果 两次到达后才停下来
    this._check = [false, false, false];
    this._checkAgain = [false, false, false];

    this._run = false; // 数字转动后，让开始按钮不可触发
    this._top = [0, 0, 0]; // 兼容旧逻辑的当前位置（px）
    this._posY = [0, 0, 0]; // 使用 transform 的 Y 位置（px）

    // 动画配置
    this._animFrameId = 0;
    this._lastFrameTime = 0;
    this._minFrameMs = 1000 / 60; // 最小帧时长保护（避免过高帧率回调）
    this._maxDeltaMs = 100; // 最大 delta 限制，避免卡顿后一帧跳太多
    this._initialSpeed = 1000; // 初始速度 px/s（原逻辑中 ~10px/10ms）
    this._slowSpeed = 400; // 减速阶段 px/s（原逻辑中 ~4px/10ms）
    this._finalSpeed = 200; // 最终阶段 px/s（原逻辑中 ~2px/10ms）

    this.addHtml();
    this.getTopArr();
    this.radomStart();

    this._startHook = (config && config.startHook) || this.startHook;
    this._endHook = (config && config.endHook) || this.endHook;

    // 防抖点击
    this._lastClickTs = 0;
    var start = document.getElementById('luckynum-start');
    if (start) {
      start.addEventListener('click', () => {
        var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - this._lastClickTs < 300) return; // 300ms 防抖
        this._lastClickTs = now;
        this.startRun();
      });
    }
  }

  /*
   * 获得一个随机的初始值
   *
   * */
  radomStart() {
    for (let i = 0; i < 3; i++) {
      var el = document.getElementById('luckynum-img' + (i + 1));
      if (!el) continue;
      var idxLen = (this._img && this._img.url && this._img.url.length) || 0;
      var p = idxLen > 0 ? this._topArr[Math.floor(Math.random() * idxLen)] : 0;
      el.style.top = p + 'px'; // 兼容旧逻辑
      el.style.transform = 'translate3d(0,' + p + 'px,0)';
      this._top[i] = p;
      this._posY[i] = p;
    }
  }

  /**
   * 设置获奖数字，可从服务端获取
   * @param {number|string} num 形如 123 的数字或字符串（外部从 1 开始）
   */
  setNum(num) {
    this._luckNum = (num + '').split('');
    this._luckNum = this._luckNum.map(function (x) {
      return x - 1;
    });
    var isRightNum = true;
    for (let i = 0; i < this._luckNum.length; i++) {
      var v = this._luckNum[i];
      if (v >= this._img.url.length || v < 0 || isNaN(v)) {
        isRightNum = false;
        break;
      }
    }
    if (!isRightNum) {
      alert('错误的抽奖结果');
      this._checkAgain = [true, true, true];
      this._run = false;
      if (this._timer) clearTimeout(this._timer);
      this._cancelAnimation();
      this._endHook('错误的抽奖结果');
    }
  }

  /*
   * 初始化dom
   *
   * */
  addHtml() {
    var host = this._myDom && this._myDom.appendChild ? this._myDom : document.body;

    var div = document.createElement('div');
    div.setAttribute('id', 'luckynum');
    div.style.width = this._width;
    div.style.height = this._height;
    div.innerHTML =
      "<div class=\"luckynum-content\">\n" +
      "                            <div class=\"luckynum-mask \" id=\"luckynum-mask1\"><div class='luckynum-imgs' id='luckynum-img1'></div></div>\n" +
      "                            <div class=\"luckynum-mask \" id=\"luckynum-mask2\"><div class='luckynum-imgs' id='luckynum-img2'></div></div>\n" +
      "                            <div class=\"luckynum-mask \" id=\"luckynum-mask3\"><div class='luckynum-imgs' id='luckynum-img3'></div></div>\n" +
      "                            <div class=\"luckynum-btn\" id=\"luckynum-start\"></div>\n" +
      "                         </div>";
    host.appendChild(div);

    var content = document.getElementsByClassName('luckynum-content')[0];
    if (content) content.style.backgroundImage = 'url(' + this._backgroundImg + ')';

    var imgString = '';
    for (let i = 0; i < this._img.url.length; i++) {
      // 可根据需要为图片添加 loading 策略（eager/auto）。此处保持语义不变
      imgString += '<img class="luckynum-myimg" src="' + this._img.url[i] + '" />';
    }
    for (let i = 1; i <= 3; i++) {
      var img = document.getElementById('luckynum-img' + i);
      var mask = document.getElementById('luckynum-mask' + i);
      if (!img || !mask) continue;
      mask.style.left = this._img.left[i - 1];
      mask.style.top = this._img.top;
      mask.style.height = this._imgWidth * 1.5 + 'px';
      mask.style.width = this._imgWidth + 'px';
      img.innerHTML = imgString + imgString;
    }
    var myimg = document.getElementsByClassName('luckynum-myimg');
    for (let m of myimg) {
      m.style.height = this._imgWidth + 'px';
    }

    // 生成btn
    var btn = document.getElementById('luckynum-start');
    if (btn) {
      btn.style.backgroundImage = 'url(' + this._btn.url + ')';
      btn.style.width = this._btn.width;
      btn.style.height = this._btn.height;
      btn.style.top = this._btn.top;
      btn.style.left = this._btn.left;
    }
    this.radomStart();
  }

  /**
   * 计算结束的位置
   **/
  getTopArr() {
    for (let i = 1; i < this._img.url.length; i++) {
      this._topArr[i] = -this._imgWidth * (i - 0.25);
    }
    this._topArr[0] = this._topArr[this._img.url.length - 1] - this._imgWidth;
    this._topArr[this._img.url.length] = this._topArr[this._img.url.length - 1] - this._imgWidth * 2;
  }

  /**
   * 开始转动
   **/
  startRun() {
    if (!this._run) {
      this.reSet();
      this._startHook();
      this._run = true;
      this.runUp(0);
      this.runUp(1);
      this.runUp(2);
      this._lastFrameTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      this._animFrameId = requestAnimationFrame(this._rafLoop.bind(this));
      var self = this;
      this._timer = setTimeout(function () {
        if (self._luckNum.length === 0) {
          self._checkAgain = [true, true, true];
          alert('抽奖超时');
          self._run = false;
          clearTimeout(self._timer);
          self._cancelAnimation();
          self._endHook('抽奖超时');
        }
      }, 10000);
    }
  }

  /*
   * 根据传入的index转动对应的img（初始化速度）
   *
   * */
  runUp(index) {
    var img = document.getElementById('luckynum-img' + (index + 1));
    if (img && img.style && typeof img.style.top === 'string') {
      var topStr = img.style.top;
      var n = parseFloat(topStr);
      this._top[index] = isNaN(n) ? 0 : n;
      this._posY[index] = this._top[index];
    }
    this._speed[index] = this._initialSpeed;
  }

  /**
   * rAF 驱动的主循环
   */
  _rafLoop(ts) {
    var now = ts || ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
    var delta = now - this._lastFrameTime;
    // 最小/最大帧时长保护
    if (delta < this._minFrameMs) delta = this._minFrameMs;
    if (delta > this._maxDeltaMs) delta = this._maxDeltaMs;

    // 更新三个转轴
    for (let i = 0; i < 3; i++) {
      if (!this._checkAgain[i]) {
        this._updateReel(i, delta);
      }
    }

    // 是否全部停止
    var stoppedCount = this._flag.filter(function (b) { return b; }).length;
    if (stoppedCount === 3) {
      clearTimeout(this._timer);
      // 对外结果从 1 开始
      var result = this._luckNum.map(function (x) { return ++x; });
      this._endHook(result);
      this.reSet();
      this._cancelAnimation();
      return;
    }

    this._lastFrameTime = now;
    this._animFrameId = requestAnimationFrame(this._rafLoop.bind(this));
  }

  _cancelAnimation() {
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = 0;
    }
  }

  /*
   * 循环函数，每次转动的速度为 speed[index]（px/s）
   *
   * */
  _updateReel(index, deltaMs) {
    var img = document.getElementById('luckynum-img' + (index + 1));
    if (!img) return;

    if (this._luckNum[index] !== undefined && this.isNow(index)) {
      this._flag[index] = true;
      this._checkAgain[index] = true;
    }

    if (this._posY[index] <= this._topArr[this._img.url.length]) {
      this._posY[index] = -this._imgWidth * 0.75;
    }

    // 使用 transform 减少布局抖动
    img.style.transform = 'translate3d(0,' + this._posY[index] + 'px,0)';
    this._top[index] = this._posY[index];

    this._posY[index] -= (this._speed[index] * deltaMs) / 1000;
  }

  /*
   * 判断当前是否应该停下
   * return true/false
   * */
  isNow(index) {
    var num = this._luckNum[index];

    // 前一个停下后速度才变为慢速，到达一次后速度变为最终速度
    switch (index) {
      case 2:
        if (this._flag[1]) {
          this._speed[index] = this._slowSpeed;
          if (this._check[index]) this._speed[index] = this._finalSpeed;
        }
        break;
      case 1:
        if (this._flag[0]) {
          this._speed[index] = this._slowSpeed;
          if (this._check[index]) this._speed[index] = this._finalSpeed;
        }
        break;
      case 0:
        this._speed[index] = this._slowSpeed;
        if (this._check[index]) this._speed[index] = this._finalSpeed;
    }

    // 到达对应的位置
    if (Math.abs(this._top[index] - this._topArr[num]) < 5) {
      // 如果第二次到达就停下来，否则就标记一次到达
      if (this._check[index]) {
        return true;
      } else {
        if (this._speed[index] === this._slowSpeed) {
          this._check[index] = true;
          this._speed[index] = this._finalSpeed;
        }
      }
    }
    return false;
  }

  /*
   * 重置所有参数
   *
   * */
  reSet() {
    this._luckNum = [];
    this._speed = [0, 0, 0];
    this._flag = [false, false, false];
    this._check = [false, false, false];
    this._run = false;
    this._checkAgain = [false, false, false];
  }

  startHook() {
    // 默认 startHook
    return 0;
  }
  endHook() {
    // 默认 endHook
    return 0;
  }
}
