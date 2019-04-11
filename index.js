var targetScore = 2000;
var table;
var currScore = 0;
var baseScore = 5;
var stepScore = 10;
var squareWidth = 50;//每个方块的宽度
var boardWidth = 12;//有多少行和列的方块
var squareSet = [];//当前桌面上的方块集合（二维数组，最左下角是0，0位置）
var timer = null;//闪烁定时器
var choose = [];//被选中的方块
var flag = true;//对点击事件加锁，消除过程中不允许有其他移入和点击操作
var tempSquare = null;//消除过程中如果输入移入其他方块，进行记录

function init(){
    table = document.getElementById("warper");
    document.getElementById("targetScore").innerHTML = "目标分数： "+targetScore+"分";
    for(var i = 0;i<boardWidth;i++){
        squareSet[i] = new Array();
        for(var j =0 ;j<boardWidth;j++){
            var element = createSquare(Math.floor(Math.random()*5),i,j);
            /**添加移动到方块,搜索附近方块并闪烁功能 */
            element.onmouseover = function(){
                mouseOver(this);
            };
            element.onclick = function(){
                if(!flag ||choose.length ==0){
                    return;
                }
                flag = false;
                var score = 0;
                tempSquare = null;
                for(var i = 0;i<choose.length;i++){
                    score += baseScore + i*stepScore;
                }
                currScore += score;
                document.getElementById("currScore").innerHTML = currScore;
                
                for (var i = 0 ; i < choose.length ; i ++) {//对每个选中的方块进行移除操作
                    (function(i){
                        setTimeout(function () {
                            squareSet[choose[i].row][choose[i].col] = null;
                            table.removeChild(choose[i]);
                        }, i * 100);
                    })(i);
                }
                
                setTimeout(function(){
                    move();
                    setTimeout(function() {
                        var finished = isFinish();
                        if(finished){
                            var resultDiv = document.createElement("div");
                            resultDiv.style.width = "250px";
                            resultDiv.style.height = "100px";
                            resultDiv.style.margin = "0 auto";
                            resultDiv.style.textAlign = "center";
                            resultDiv.style.lineHeight = "100px";
                            resultDiv.style.opacity = "1";
                            var warper = document.getElementById("warper");
                            
                            if(currScore>targetScore){
                                
                                var img = document.createElement("img");
                                img.setAttribute("src","pic/clearance.png");
                                resultDiv.appendChild(img);                                
                                warper.appendChild(resultDiv);                                
                            }
                            else{
                                var img = document.createElement("img");
                                img.setAttribute("src","pic/very_good.png");
                                resultDiv.appendChild(img);                                                              
                                warper.appendChild(resultDiv);                                
                            }
                        }
                        else{
                            choose = [];
                            flag = true;
                            mouseOver(tempSquare);
                        }
                    }, 300+choose.length*150);

                },choose.length*100);
            }
            /*将每个方块添加到表格中*/
            squareSet[i][j] = element;
            table.appendChild(element);
        }
    }   
    refresh(); 
}


/**创建小方框DIV */
function createSquare(value,row,col){
    var element = document.createElement("div");
    element.style.width = squareWidth+"px";
    element.style.height = squareWidth+"px";
    element.style.position = "absolute";
    element.style.borderRadius = "12px";
    element.style.display  = "inline-block";
    element.style.boxSizing = "border-box";
    element.num = value;
    element.row = row;
    element.col = col;
    return element;
}

/**鼠标滑过 */

function mouseOver(obj){
    if(!flag){
        tempSquare = obj;
        return;
    }
    backStyle();
    choose = [];
    checkLinkedSquare(obj,choose);/**搜索附近方块 */
    if(choose.length <= 1){
        choose = [];
        return;
    }
    /**方块闪烁 */
    flicker(choose);
    /**显示分数 */
    showSelectScore();
}

/**还原方块样式 */

function backStyle(){  
    if(timer != null){
        clearInterval(timer);
    }
    for(var i = 0;i< squareSet.length;i++){
        for(var j = 0 ;j<squareSet[i].length;j++){
            if(squareSet[i][j] == null){
                continue;  /**被消除的 */
            }
            squareSet[i][j].style.transform="scale(0.95)";
            squareSet[i][j].style.border = "0 solid white";
        }
    }

}

/**搜索相连方框 */
function checkLinkedSquare(square,arr){
    if(square == null){
        return;
    }
    arr.push(square);
    /**判断左侧 */
    if(square.col>0 && squareSet[square.row][square.col-1]&&squareSet[square.row][square.col-1].num == square.num && arr.indexOf(squareSet[square.row][square.col-1]) == -1){
        checkLinkedSquare(squareSet[square.row][square.col-1],arr);
    }
    /**判断右侧 */
    if(square.col<boardWidth-1 && squareSet[square.row][square.col+1]&&squareSet[square.row][square.col+1].num == square.num && arr.indexOf(squareSet[square.row][square.col+1]) == -1){
        checkLinkedSquare(squareSet[square.row][square.col+1],arr);
    }
    /**判断上侧 */
    if(square.row <boardWidth-1 && squareSet[square.row+1][square.col]&&squareSet[square.row+1][square.col].num == square.num && arr.indexOf(squareSet[square.row+1][square.col]) == -1){
        checkLinkedSquare(squareSet[square.row+1][square.col],arr);
    }
    /**判断下侧 */
    if(square.row>0 && squareSet[square.row-1][square.col]&&squareSet[square.row-1][square.col].num == square.num && arr.indexOf(squareSet[square.row-1][square.col]) == -1){
        checkLinkedSquare(squareSet[square.row-1][square.col],arr);
    }
}

/** 选中闪烁*/
function flicker(arr){
   
    var num = 0;
    timer = setInterval(function(){
        for(var i  =0; i<arr.length;i++){
            arr[i].style.border = "3px solid #BFEFFF";
            arr[i].style.transform = "scale("+(0.90+0.05*Math.pow(-1,num))+")";/**设置定时器，使得方块大小不断变化 */
        }
        num++;
    },300);
};


/**展示消除选中方块会得到的分数 */
function showSelectScore(){
    var score = 0;
    for(var i = 0;i<choose.length;i++){
        score += baseScore + i*stepScore; 
    }
    if(score == 0){
        return;
    }
   document.getElementById("stepScore").innerHTML = "消除"+choose.length+"块" +score+"分";
   document.getElementById("stepScore").style.transition = null;
   document.getElementById("stepScore").style.opacity = 1;
   setTimeout(function() {
    document.getElementById("stepScore").style.transition = "opacity 1s";
    document.getElementById("stepScore").style.opacity = 0;
   }, 1000);
}


/**刷新所有方块 */
function refresh(){
    for(var i = 0;i<squareSet.length;i++){
        for(var j = 0;j<squareSet[i].length;j++){
            if (squareSet[i][j] == null) {
                continue;
            }
            squareSet[i][j].row = i;
            squareSet[i][j].col = j;
            squareSet[i][j].style.backgroundImage = "url('pic/"+squareSet[i][j].num+".png')";
            squareSet[i][j].style.left = squareSet[i][j].col*squareWidth+"px";
            squareSet[i][j].style.bottom = squareSet[i][j].row*squareWidth+"px";
            squareSet[i][j].style.backgroundSize = "cover";
            squareSet[i][j].style.transform = "scale(0.95)";  /*方块大小变为原来的95%*/
            squareSet[i][j].style.transition="left 0.3s,bottom 0.3s";/*使得方块下落有缓冲*/
        }
    }
}
function move() {//方块纵向下落与横向合并
    for (var i = 0 ; i < boardWidth ; i ++) {//纵向移动
        var pointer = 0;
        for (var j = 0 ; j < boardWidth ; j ++) {
            if(squareSet[j][i] != null) {
                if (j != pointer) {
                    squareSet[pointer][i] = squareSet[j][i];
                    squareSet[pointer][i].row = pointer;
                    squareSet[j][i] = null;
                }
                pointer ++;
            }
        }
    }
    for (var i = 0 ; i < squareSet[0].length ; ) {//横向移动
        if (squareSet[0][i] == null) {
            for (var j = 0 ; j < boardWidth ; j ++) {
                squareSet[j].splice(i, 1);
            }
            continue;
        }
        i ++;
    }
    refresh();
}

function isFinish(){
    var isFlag = true;
    for(var i = 0;i<squareSet.length;i++){
        for(var j  =0;j<squareSet[i].length;j++){
            var temp =[];
            checkLinkedSquare(squareSet[i][j],temp);
            if(temp.length>1){
                return false;
            }
        }        
    }
    return isFlag;
}

window.onload = function(){
    init();  
};