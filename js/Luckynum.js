/**
 * @file Luckynum
 * @author admin
 * @date 2017/11/21
 */
export class Luckynum{

    constructor(config){
        this._topArr=[-1032,-912,-796,-678,-560,-440,-322,-204,-86,-1150];// 0-9数字对应的top值
        this._myDom=config.dom; //传入dom
        this._luckNum=[];  //抽奖结果
        this._speed=[]; //各个图片转动的速度
        this._flag=[]; // 每个图片是否已停止

        // 为实现慢慢停下来的效果 两次到达后才停下来
        this._check=[];
        this._checkAgain=[];


        this._run=false;// 数字转动后，让开始按钮不可触发
        this._top=[];// 当前图片所处位置
        this.addHtml();

        //为按钮添加点击事件
        let start = document.getElementsByName('start')[0];
        start.addEventListener('click', () => {
            this.startRun();
        });
    }
    /*
    * 获得一个随机的初始值
    *
    * */
    radomStart() {
        for(let i=0;i<3;i++){
            document.getElementById('img'+(i+1)).style.top=this._topArr[Math.floor(Math.random()*10)]+'px';
        }
    }

    /*
    * 设置获奖数字，可从服务端获取
    *
    **/
    setNum(num) {
        this._luckNum=(num+'').split('');
    }

    /*
    * 初始化dom
    *
    * */
    addHtml(){
        let div = document.createElement('div');
        div.setAttribute('id','luckynum');
        div.innerHTML=`<div class="mac">
                            <div class="mask1"><img id='img1' src="imgs/num.png"></div>
                            <div class="mask2"><img id='img2' src="imgs/num.png"></div>
                            <div class="mask3"><img id='img3' src="imgs/num.png"></div>
                            <div class="btn" name="start"></div>
                         </div>`;
        this._myDom.appendChild(div);
        this.radomStart();
    }
    /**
    * 开始转动
    *
    **/
    startRun(){
        if(!this._run) {
            this.reSet();
            console.log('start run')
            this._run=true;
            this.runUp(0);
            this.runUp(1);
            this.runUp(2);
            setTimeout(()=>{
                    if(this._luckNum.length===0)
                    {
                        this._checkAgain=[true,true,true];
                        alert('抽奖超时');
                        this._run=false;
                       // this.radomStart();
                       // this.reSet();

                    }
            },10000)

        }


    }

    /*
    * 根据传入的index转动对应的img
    *
    * */
    runUp(index) {
        let img=document.getElementById('img'+(index+1));
        this._top[index]= img.style.top.split('px')[0];
        this._speed[index] =10;
        this.runfun(img,index)

    }

    /*
    * 控制循环的函数，当3个img都停下来就重置
    * 用setimeout代替setInterval
    *
    * */
    runfun(img,index) {
        this.run(img,index);
        if(!this._checkAgain[index]){
            setTimeout(()=>{
                this.runfun(img,index)
            },10);
        }else {
            if(this._flag.filter(
                    (b)=>{
                        return b;
                    }
                ).length===3)
            {
                console.log(this._luckNum);
                console.log('reSet');
                this.reSet();

            }
        }
    }

    /*
    * 循环函数，每次转动的速度为speed[index]
    *
    * */
    run(img,index){
        /*if(this._speed[index]===undefined)
        {
            console.log(this);
            return;
        }*/
       // console.log(index);
        if(this._luckNum[index]!==undefined&&this.isNow(index))
        {
            this._flag[index]=true;
            this._checkAgain[index]=true;
        }

        if(this._top[index]<=-1185){
            this._top[index]=0;
        }
        img.style.top = this._top[index] + 'px';
        this._top[index] -= this._speed[index];
    }

    /*
    * 判断当前是否应该停下
    * return true/false
    * */
    isNow(index) {
        let num=this._luckNum[index];

        //前一个停下后速度才变为4，到达一次后速度变为2
        switch (index){
            case 2: if(this._flag[1]) {
                         this._speed[index]=4;
                        if(this._check[index])
                            this._speed[index]=2;
                    }
                    break;
            case 1: if(this._flag[0]) {
                          this._speed[index]=4;
                          if(this._check[index])
                             this._speed[index]=2;
                    }
                    break;
            case 0: this._speed[index]=4;
                    if(this._check[index])
                        this._speed[index]=2;
        }

        //到达对应的位置
        if(Math.abs(this._top[index]-this._topArr[num])<5)
        {
            //如果第二次到达就停下来，否则就标记一次到达
            if(this._check[index])
            {
               // console.log(this._speed[index])
                return true;
            }
            else
            {
                if(this._speed[index]===4){
                    this._check[index]=true;
                    this._speed[index]=2;
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
        this._luckNum=[];
        this._speed=[];
        this._flag=[];
        this._check=[];
        this._run=false;
        this._checkAgain=[]

    }
}


