/**
 * @file Luckynum
 * @author admin
 * @date 2017/11/21
 */
export class Luckynum{

    constructor(config){
        this._id=0;
        this._topArr=[-1032,-912,-796,-678,-560,-440,-322,-204,-86,-1150];
        this._myDom=config.dom;
        this._luckNum=[];
        this._runUpTimer=[];
        this._speed=[];
        this._flag=[];
        this._check=[];
        this._checkAgain=[];
        this._run=false;
        this._top=[];
        this.addHtml();

        let start = document.getElementsByName('start')[0];
        start.addEventListener('click', () => {
            this.startRun()
        });
    }
    radomStart() {
        for(let i=0;i<3;i++){

            document.getElementById('img'+(i+1)).style.top=this._topArr[Math.floor(Math.random()*10)]+'px'

        }
    }
    setNum(num) {
        this._luckNum=(num+'').split('');
       // console.log(this._luckNum)
    }
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
    startRun(){
        if(!this._run) {
            console.log('start run')
            this._run=true;
            this.runUp(0)
            this.runUp(1)
            this.runUp(2)

        }


    }

    isNow(index) {
        let num=this._luckNum[index]
       //console.log(num);
       // console.log(top+' '+this._topArr[num])
        switch (index){
            case 2: if(!this._flag[1]) {
                       // return false
                    }else {
                         this._speed[index]=4
                        if(this._check[index])
                            this._speed[index]=2
                    }
                    break;
            case 1: if(!this._flag[0]) {
                        //  return false
                    }else {
                          this._speed[index]=4
                          if(this._check[index])
                             this._speed[index]=2
                    }
                    break;
            case 0: this._speed[index]=4
                    if(this._check[index])
                        this._speed[index]=2
        }


        if(Math.abs(this._top[index]-this._topArr[num])<5)
        {
            if(this._check[index])
            {
               // console.log(this._speed[index])
                return true
            }

            else
            {
                if(this._speed[index]===4){
                //  console.log(index," get",this._top[index])
                    this._check[index]=true
                    this._speed[index]=2
                    //console.log(this._speed[index])
                }

            }
        }
        return false
    }
    reSet() {
        this._luckNum=[];
        this._runUpTimer=[];
        this._speed=[];
        this._flag=[];
        this._check=[];
        this._run=false;
        this._checkAgain=[]


    }
    run(img,index){
       // this._id++;
       // console.log(this._id++);
        if(this._speed[index]===undefined)
        {
            console.log(this)
            return
        }
        if(this._luckNum[index]!==undefined&&this.isNow(index))
        {
             //console.log(this._luckNum)
           // clearInterval(this._runUpTimer[index])
            this._flag[index]=true;
            this._checkAgain[index]=true;
        }
        //console.log(img)
        if(this._top[index]<=-1185){
            // clearInterval(aa)
            this._top[index]=0;
        }
        img.style.top = this._top[index] + 'px';
        this._top[index] -= this._speed[index];
       // console.log(index,this._top[index])
        // clearTimeout(timer1)
        //  setTimeout(this.runUp,10)
    }
    runfun(img,index) {
        this.run(img,index);
        //console.log(this._run)
        if(!this._checkAgain[index]){
            setTimeout(()=>{
               // console.log(this._run)
              this.runfun(img,index)
            },10);
        }else {
            if(this._flag.filter(
                    (b)=>{
                        return b
                    }
                ).length===3)
            {
                console.log(this._luckNum)
                console.log('reSet')
                this.reSet()
                this._run=false
            }
        }
    }
    runUp(index) {
        let img=document.getElementById('img'+(index+1))
        this._top[index]= img.style.top.split('px')[0];
        this._speed[index] =10;
        this.runfun(img,index)

    }
}


