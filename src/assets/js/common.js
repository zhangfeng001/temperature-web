import Vue from 'vue'
import moment from "moment";
import {mapMutations,mapGetters} from 'vuex'
import store from '../../store/index'
export default {
    install(Vue, options) {
        /**
         * @method getNewDate 根据传入时间，获取新的时间
         * @param {Object} dateStr 传入时间
         * @param {Number} dis 改变规则 ，-1为前一天，1为后一天，依次类推
         */
        Vue.prototype.getNewDate = function (dateStr, dis) {
            //判断是否Date()对象，如果不是转为Date对象
            let newDate;
            if (dateStr instanceof Date) {
                newDate = dateStr;
            } else {
                //将字符串时间转化成Date对象
                newDate = new Date(dateStr.replace(/-/g, "/"));
            }

            let type = dis || 0;
            //判断是否是合法的时间对象
            let dateParse = Date.parse(newDate);
            if (isNaN(dateParse)) { //日期是否合法
                console.log("日期格式不合法");
                return; //不合法时返回false
            }
            let year = newDate.getFullYear();
            let month = newDate.getMonth();
            let day = newDate.getDate();
            let finalDate = new Date(year, month, day + type);
            let finalYear = finalDate.getFullYear();
            let finalMonth = finalDate.getMonth() < 9 ? "0" + (finalDate.getMonth() + 1) : (finalDate.getMonth() + 1);
            let finalDay = finalDate.getDate() < 10 ? "0" + finalDate.getDate() : finalDate.getDate();
            return finalYear + "-" + finalMonth + "-" + finalDay;
        };
        /**
         * @method parseMapData 解析体温单每日录入数据
         * @param {JSON} mapData 每日录入数据字符串
         * @return
         * */
        Vue.prototype.parseMapData = function(mapData) {
            let titleArray = [];
            let valueArray = [];
            for (let i in mapData) {
                let title = eval("(" + i + ")");
                let value = mapData[i];
                titleArray.push(title);
                valueArray.push(value);
            }
            //排序，name长的排在前面
            //使用快速排序
            function bubbleSort(arr, aboutarr) {
                for (let i = 0; i < arr.length - 1; i++) {
                    for (let j = 0; j < arr.length - 1 - i; j++) {
                        if (arr[j].name.length < arr[j + 1].name.length) {
                            let temp = arr[j];
                            arr[j] = arr[j + 1];
                            arr[j + 1] = temp;
                            let aboutTemp = aboutarr[j];
                            aboutarr[j] = aboutarr[j + 1];
                            aboutarr[j + 1] = aboutTemp;
                        }
                    }
                }
                return {
                    "newArr": arr,
                    "newAboutArr": aboutarr
                };
            }
            // 排序
            // let newTitleArray = bubbleSort(titleArray, valueArray).newArr;
            // let newValueArray = bubbleSort(titleArray, valueArray).newAboutArr;
            // return {
            //     titleArray: newTitleArray,
            //     valueArray: newValueArray
            // };
            //不排序
            return {
                titleArray: titleArray,
                valueArray: valueArray
            };
        }; 
        /*
        * @desc 绘制刻度
        * @param {obj} oJson 参数
        * @return svgArray
        * */
       Vue.prototype.drawSvgScaleCreateParams = function (label,key,max,min,id,x1,y1,x2,y2,style,type,value,fill,x,y){
           return {
                label:label,
                key:key,
                max:max,
                min:min,
                id:id,
                x1:x1,
                y1:y1,
                x2:x2,
                y2:y2,
                style:style,
                type:type,
                value:value,
                fill:fill,
                x:x,
                y:y
            }
       }
        Vue.prototype.drawSvgScale = function(oJson){
            let scaleArray = [];
            let markName = oJson.markName;//显示类型
            let x = oJson.x;   //标定线相对于SVG容器的x坐标
            let beginKD = oJson.beginKD; //开始刻度
            let endKD = oJson.endKD; //结束刻度
            let width = oJson.width; // 标线宽度
            let disKD = oJson.disKD; // 刻度差
            let stepValue = oJson.stepValue; //一刻度表示的值
            let isShowLittle = oJson.isShowLittle; //是否显示小刻度,默认不显示
            let isShowdemarcate = oJson.isShowdemarcate; //是否显示标定线,默认显示，
            let demarcateId = oJson.demarcateId; //不显示时可以传入已存在标定线id，也可以不传
            let trRowBegin = oJson.trRowBegin; //相对于tr的开始行数
            let trRowEnd = oJson.trRowEnd; //相对于tr的结束行数
            let valueShow = oJson.valueShow;// 是否隐藏刻度,默认不隐藏
            let stepSide = oJson.stepSide; //刻度画在标定线左边还是右边,true为左边，false为右边，默认true
            let martchs = oJson.martchs; //匹配对齐
            let svgW = 100;//计算标定线用
            let svgH = Number(store.state.KDobj.trHeight) * 55;
            let tdB = 1;
            let tdH = Number(store.state.KDobj.trHeight); //tr的高度
            let disRow = trRowEnd - trRowBegin;
            let disPX = (disRow * tdH / ((endKD - beginKD) / disKD)); //一刻度需要多少像素px
            let endY = parseFloat(trRowEnd * tdH);//Y轴最大刻度
            let e = (endKD - beginKD) / disKD; //计算要画的刻度格子数
            x = (typeof(x) === "string") ? svgW * parseFloat(x) : x;
            if (martchs !== undefined) {  //华氏温度和摄氏温度换算时需要
                let scale = martchs.split(",")[0];
                let tdRegion = martchs.split(",")[1];
                let tdBegin = parseInt(tdRegion.split("-")[0]);
                let tdEnd = parseInt(tdRegion.split("-")[1]);
                let scale1 = parseInt(scale.split("-")[0]);
                let scale2 = parseInt(scale.split("-")[1])
                let y1 = tdBegin * tdH;
                let y2 = tdEnd * tdH;
                disPX = parseFloat((y1 - y2) / ((scale2 - scale1) / disKD)).toFixed(2);
                if (scale1 > beginKD) {
                    endY = parseFloat(y1) + parseFloat((scale1 - beginKD) / disKD * disPX);
                } else {
                    endY = y1;
                }
            }
            //当需要画标定线时 
            if (isShowdemarcate) {
                //结束Y点 最下行加一个格子的高度  开始Y点 
                let y1 = parseFloat(trRowEnd * tdH + parseFloat(disPX)).toFixed(2);
                let y2 = parseFloat(trRowBegin * tdH - 10).toFixed(2);
                scaleArray.push(this.drawSvgScaleCreateParams('line','0','','',demarcateId,x,y1,x,y2,{stroke: '#3c3c3c', strokeWidth: tdB}));
            }
            for (let i = 0; i <= e; i++) {
                let len = (i + beginKD).toString().length;
                if (isShowLittle) {
                    //画小刻度
                    if (i % 5 === 0) {
                        scaleArray.push(this.drawSvgScaleCreateParams('line',i + 1 + markName,beginKD,endKD,'',(stepSide ? (x - width) : (x + width)),
                            parseFloat(endY - (disPX * i)).toFixed(2),x,parseFloat(endY - (disPX * i)).toFixed(2),
                            {stroke: '#3c3c3c', strokeWidth: tdB, display: 'none'},markName + '_line'));

                    } else {
                        scaleArray.push(this.drawSvgScaleCreateParams('line',i + 1 + markName,beginKD,endKD,'',(stepSide ? (x - width) : (x + width)),
                            parseFloat(endY - (disPX * i)).toFixed(2),x,parseFloat(endY - (disPX * i)).toFixed(2),
                            {stroke: '#3c3c3c', strokeWidth: tdB},markName + '_line'));
                    }
                } else { //画大刻度
                    scaleArray.push(this.drawSvgScaleCreateParams('line',i + 1 + markName,beginKD,endKD,'',(stepSide ? (x - width) : (x + width)),
                        parseFloat(endY - (disPX * i)).toFixed(2),x,parseFloat(endY - (disPX * i)).toFixed(2),
                        {stroke: '#3c3c3c', strokeWidth: tdB},markName + '_line'));
                }
                //画刻度数
                scaleArray.push(this.drawSvgScaleCreateParams('text',(i + 1) + markName,'','','','',
                    '','','',{display: (valueShow ? "" : "none")},markName + '_line',i * disKD + beginKD,'#3c3c3c',
                    (stepSide ? (x - (width + len * 8)) : (x + (width + 2))),
                    parseFloat(endY - (disPX * i) + 4.5).toFixed(2)
                    ));
            }
            let b = 0;
            return {
                scaleArray: scaleArray,//左侧刻度线
                ySection: [parseFloat(endY - disPX * b).toFixed(2), parseFloat(endY - disPX * e).toFixed(2)]
            };
        };
        /**
         * 绘制图例
         * 疼痛 tt 红色正方形
         * 口温 kw 蓝色实心圆
         * 腋温 yw 蓝色叉叉
         * 肛温 gw 蓝色空心圆
         * 降温 jw 红色空心圆
         * 脉搏 mb 红色实心圆
         * 心率 xl 红色空心圆
         **/
        Vue.prototype.showPointTuglie = function(){
            function showText(x, y, text, key) {
                return <text key={y} x={x} y={y}>{text}</text>;
            }
        
            let oArray = ["tt", "kw", "yw", "gw", "jw", "mb", "xl"];
            //初始显示位置
            let initX = 16;
            let initTextX = 26;
            let initY = 15 * 40 + 30;
            let pTuglie = [];
            let textArray = [];
            for (let i = 0; i < oArray.length; i++) {
                let initTextY = initY + i * 16 + 4;
                switch (oArray[i]) {
                    case "tt" :
                        pTuglie.push(this.drawSquare("tt", {"x": initX, "y": (initY + i * 16)}, 4, "red", "疼痛", true));
                        pTuglie.push(this.showText(initTextX, initTextY, '疼痛'));
                        break;//疼痛
                    case "kw" :
                        pTuglie.push(this.drawCircle("hx", {"x": initX, "y": (initY + i * 16)}, 4, "blue", "口温", true));
                        pTuglie.push(this.showText(initTextX, initTextY, '口温'));
                        break;//口温
                    case "yw" :
                        pTuglie.push(this.drawCross("yw", {"x": initX, "y": (initY + i * 16)}, 4, "blue", "腋温"));
                        pTuglie.push(this.showText(initTextX, initTextY, '腋温'));
                        break;//腋温
                    case "gw" :
                        pTuglie.push(this.drawCircle("gw", {"x": initX, "y": (initY + i * 16)}, 4, "blue", "肛温", false));
                        pTuglie.push(this.showText(initTextX, initTextY, '肛温'));
                        break;//肛温
                    case "jw" :
                        pTuglie.push(this.drawCircle("jw", {"x": initX, "y": (initY + i * 16)}, 4, "red", "降温", false));
                        pTuglie.push(this.showText(initTextX, initTextY, '降温'));
                        break;//降温
                    case "mb" :
                        pTuglie.push(this.drawCircle("mb", {"x": initX, "y": (initY + i * 16)}, 4, "red", "脉搏", true));
                        pTuglie.push(this.showText(initTextX, initTextY, '脉搏'));
                        break;//脉搏
                    case "xl" :
                        pTuglie.push(this.drawCircle("xl", {"x": initX, "y": (initY + i * 16)}, 4, "red", "心率", false));
                        pTuglie.push(this.showText(initTextX, initTextY, '心率'));
                        break;//心率
                    default:
                        break;
                }
            }
            return pTuglie;
        };

        /**
         * @method drawEvent 绘制文字事件 如 入院/体温不升/手术
         * @param {Array} evenArray 事件数组
         * @param {String} curDate 当前时间
         * */
        Vue.prototype.drawEvent = function(evenArray, curDate){
            if (evenArray === undefined || evenArray.length === 0) {
                return;
            }
            let height = Number(store.state.KDobj.trHeight);
            let trLittleCounts = Number(store.state.KDobj.trLittleCounts);
            let svgW = height * 42;
            let svgH = height * Number(store.state.KDobj.lastTr);
            let tdW = height; //获取td的宽度
            let daysW = height * 6; //一天的显示的宽度
            let chinese = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            //按时间分组，显示在同一时间段
            let timeArray = {};//按时间存放事件的map  放在顶部展示的事件
            let otherArray = [];//存放其他事件 如：开呼吸机/关呼吸机/不升等事件
            for (let i = 0; i < evenArray.length; i++) {
                let value = evenArray[i].value;
                //let dataTime = evenArray[i].dataTime;
                let dataTime = evenArray[i].date + " " + evenArray[i].hour + ":00";
                if (value !== '开呼吸机' && value !== '关呼吸机' && value !== '不升') {
                    if (timeArray[dataTime] === undefined) {
                        timeArray[dataTime] = [];
                        timeArray[dataTime].push(evenArray[i]);
                    } else {
                        timeArray[dataTime].push(evenArray[i]);
                    }
                } else {
                    otherArray.push(evenArray[i])
                }
            }
            //生成HTML
            let showArray = [];//存放事件名称的数组
            let xPxArray = []; //存放事件开始点坐标的数组
            for (let time in timeArray) { 
                let evens = timeArray[time]; //该时间下的事件list
                let xPx = this.getDisDays(curDate, time) * daysW - 5;//计算事件的起点 =  （ 时间段间隔天数 乘以  一天的格子宽度 ） - 文字偏移量 
                
                let show = "";
                let k = 0;
                for (let j = 0; j < evens.length; j++) {
                    let curEven = evens[j];
                    let value = curEven.value;
                    let hour = parseInt(moment(curEven.dataTime).format('HH'));
                    let minute = parseInt(moment(curEven.dataTime).format('mm'));
                    let second = parseInt(moment(curEven.dataTime).format('ss'));
                    let hourStr = hour.toString();
                    let minuteStr = minute.toString();
                    let finalValue = "";
                    let isLeave = value === "请假";
                    if (minute > 0) {
                        finalValue = value + (isLeave ? "" : "||" + this.numToChinese(hourStr, chinese) + "时" + this.numToChinese(minuteStr, chinese) + "分");
                    } else {
                        finalValue = value + (isLeave ? "" : "||" + this.numToChinese(hourStr, chinese) + "时整");
                    }
                    //多个事件则加空格
                    if (k === 0) {
                        show += finalValue;
                    } else {
                        show += " " + finalValue;
                    }
                    k++;
                }
                showArray.push(show);//事件文本数组
                xPxArray.push(xPx);//偏移量数组
            }
            //绘制事件
            let reShowArray = [];
            for (let i = 0; i < showArray.length; i++) {
                //绘制path
                let xPx = xPxArray[i];
                let textArray = showArray[i].split("");
                let textEventArr = [];//用于储存text的内层数组
                textArray.map((v, i) => {
                    textEventArr.push({
                        eventType:'topEvent',
                        label:"text",
                        style:{fontSize: v === '|' ? '13px' : ''},
                        pKey:i,
                        key:i,                       
                        x:v === '|' ? (xPx + 4) : xPx,
                        y:12 + i * height + trLittleCounts * height,
                        fill:"red",
                        value:v
                    })
                })
                reShowArray.push(textEventArr);
            }
            //绘制其他事件
            for (let i = 0; i < otherArray.length; i++) {
                let value = otherArray[i].value;
                let time = otherArray[i].dataTime;
                //console.log("绘制其他事件"+curDate)
                let xPx = this.getDisDays(curDate, time) * daysW;
                if (value === "开呼吸机") {
                    //绘制向上的箭头
                    reShowArray.push(this.drawArrow({x: xPx, y: 35 * height}, 3 * height, true, 'blue'));
                    //在箭头旁边绘制呼吸机三字
                    let textArray = ["呼", "吸", "机"];
                    for (let j = 0; j < textArray.length; j++) {
                        reShowArray.push({
                            eventType:'botEvent',
                            label:'text',
                            key:"j" + j,
                            x:xPx - 14,
                            y:36 * height + j * Number(store.state.KDobj.trHeight) - 2,
                            style:{},
                            fill:'blue',
                            value:textArray[j],
                        })
                    }
                } else if (value === "关呼吸机") {
                    //绘制向下的箭头
                    reShowArray.push(this.drawArrow({x: xPx, y: 35 * height}, 3 * height, false, '#000'));
                } else if (value === "不升") {
                    let valueArray = value.split("");
                    //显示在35度下面
                    let cy = 35 * height;
                    for (let k = 0; k < valueArray.length; k++) {
                        reShowArray.push({
                            eventType:'botEvent',
                            label:'text',
                            key:xPx + 'bs' + k,
                            x:xPx - 5.5,
                            y:cy + height * k + 12 + trLittleCounts * height,
                            style:{},
                            fill:'#000',
                            value:valueArray[k],
                        })
                    }
                }
            }
            return reShowArray;
        };
        /**
         * @method 绘制辅助呼吸
         * @param {Array} hzhxData 疼痛数组
         * */
        Vue.prototype.drawHzhx = function(hzhxData, curDate){
            // let svgW = Number(store.state.KDobj.trHeight) * 42;
            // let svgH = Number(store.state.KDobj.trHeight) * 55;
            let Height = Number(store.state.KDobj.trHeight);
            let tdW = Height; //td的宽度
            let tdH = Height;//td的高度
            let daysW = Height * 6; //一天的显示的宽度
        
            //以疼痛刻度10为基准
            let cy1 = Height * Number(store.state.KDobj.lastTr) - 2;
            let cy2 = Height * 42 + 12;
            let hxArray = [];
            for (let i = 0; i < hzhxData.length; i++) {
                let endDate = hzhxData[i].dataTime;
                let value = hzhxData[i].value;
                let title = "辅助呼吸：" + value + "次";
                let y = (i % 2 === 0) ? cy1 : cy2;
                // console.log("辅助呼吸"+curDate)
                let xPx = this.getDisDays(curDate, endDate) * daysW;
                hxArray.push(this.drawText({"x": xPx, "y": y}, 'blue', value, title))
            }
            return hxArray;
        };

        /**
         * @method parseRePoint 解析是否存在重合的坐标点，若有请假事件，则将其分组，获取脉搏短促多边形
         * @param {JSON} pointData 时间录入信息
         * @param {String} curDate 当前时间
         * @return
         */
        Vue.prototype.parseRePoint = function(pointData, curDate){

            let beginKDWD = Number(store.state.KDobj.wdStartValue);
            let endKDWD = Number(store.state.KDobj.wdEndValue);
            let beginKDMB = Number(store.state.KDobj.mbStartValue);
            let endKDMB = Number(store.state.KDobj.mbEndValue); 
            let WDLastTr = Number(store.state.KDobj.lastTr)
            let disKDWD = Number(store.state.KDobj.disKDWD)
            let disKDMB = Number(store.state.KDobj.disKDMB)
            let trLines = Number(store.state.KDobj.trLines)
            let trLittleCounts = Number(store.state.KDobj.trLittleCounts)

            let height = Number(store.state.KDobj.trHeight);
            let mb = pointData.mb || []; //脉搏
            let xl = pointData.xl || []; //心率
            let wd = pointData.wd || []; //温度
            let tt = pointData.tt || []; //疼痛
            let events = pointData.eventDatas || []; //事件
            let leaveEvents = []; //缓存请假事件
            let that = this;
            //绘制点、折线、脉搏短促、物理降温
            let pointArray = [];
            //刻度线绘制
            let wdYSection = this.drawSvgScale({
                markName: "wd",
                svgId: "svgLeft",
                x: "0.5",
                beginKD: beginKDWD, 
                endKD: endKDWD,
                width: 10,
                disKD: disKDWD,
                trRowBegin: trLittleCounts,
                trRowEnd: WDLastTr,
                stepSide: false,
                valueShow: true,
                isShowdemarcate: false,
                // martchs: "40-35,15-40",
            }).ySection;
            let mbYSection = this.drawSvgScale({
                markName: "mb",
                svgId: "svgRight",
                x: "0",
                beginKD: beginKDMB,
                endKD: endKDMB,
                width: 10,
                disKD: disKDMB,
                trRowBegin: trLittleCounts,
                trRowEnd: WDLastTr,
                stepSide: false,
                valueShow: true,
                isShowdemarcate: false,
                // martchs: "140-40,15-40",
            }).ySection;
            let ttYSection = this.drawSvgScale({
                markName: "tk",
                x: "1",
                stepSide: true,
                valueShow: true,
                beginKD: 1,
                endKD: 10,
                width: 10,
                disKD: 1,
                trRowBegin: 45,
                trRowEnd: 54,
                isShowdemarcate: false,
            }).ySection;


            //统计请假事件
            for (let i = 0; i < events.length; i++) {
                let value = events[i].value;
                let dataTime = events[i].dataTime;
                if (value === "请假") {
                    leaveEvents.push(dataTime);
                }
                else if (value === "不升") {
                    leaveEvents.push(dataTime);
                }
            }
            //根据请假的时间节点 对事件进行数组分组处理
            //请假前一个组 请假后一个组 多个请假同样适用
            let mbGroup = this.splitGroup(leaveEvents, mb);
            let xlGroup = this.splitGroup(leaveEvents, xl);
            let wdGroup = this.splitGroup(leaveEvents, wd);
            let ttGroup = this.splitGroup(leaveEvents, tt);

            //计算脉搏点
            let mbPoints = [];
            let xlPoints = [];
            let wdPoints = [];
            let ttPoints = [];
            //计算每个点的x , y坐标
            //根据请假的分组长度进行循环画点，四种参数长度一致
            for (let i = 0; i < mbGroup.length; i++) {
                
                let mbArray = mbGroup[i];
                let xlArray = xlGroup[i];
                let wdArray = wdGroup[i];
                let ttArray = ttGroup[i];

                mbPoints[i] = [];//脉搏点集合
                xlPoints[i] = [];//心率点集合
                wdPoints[i] = [];//温度点集合
                ttPoints[i] = [];//疼痛点集合

                      
                //分别计算出x,y点的坐标
                for (let j = 0; j < mbArray.length; j++) {
                    let xy = this.getXY(mbArray[j], curDate, beginKDMB, endKDMB, mbYSection);
                    mbPoints[i].push(xy);
                }
                for (let j = 0; j < xlArray.length; j++) {
                    let xy = this.getXY(xlArray[j], curDate, beginKDMB, endKDMB, mbYSection);
                    xlPoints[i].push(xy);
                }
                for (let j = 0; j < wdArray.length; j++) {
                    let xy = this.getXY(wdArray[j], curDate, beginKDWD, endKDWD, wdYSection);
                    wdPoints[i].push(xy);
                }
                for (let j = 0; j < ttArray.length; j++) {
                    let xy = this.getXY(ttArray[j], curDate, 1, 10, ttYSection);
                    ttPoints[i].push(xy);
                }
            }
            //获取 温度等于42°C时的y轴值，如果温度大于42°,即y值小于wdMax，则绘制向上的箭头
            let wdMax = wdYSection[1];
            //绘制物理降温
            for (let i = 0; i < wdPoints.length; i++) {
                let wdPoint = wdPoints[i];
                for (let j = 0; j < wdPoint.length; j++) {
                    let value = wdPoint[j].value; //温度
                    let phValue = wdPoint[j].point.phValue; //物理降温
                    let yPx = wdPoint[j].y;
                    let xPx = wdPoint[j].x;
                    if (phValue !== undefined && phValue !== "") {
                        if (value > 42) {
                            yPx = wdMax;
                        }
                        //获取物理降温的坐标
                        let wljwY = this.getXY(wdPoint[j].point, curDate, beginKDWD, endKDWD, wdYSection, true).y;
                        pointArray.push(
                            {
                                pname:'wljw',
                                plabel:'g',
                                label:'path',
                                pkey:"pwljwPath" + xPx,
                                key:"wljwPath" + xPx,
                                pstyle:{fill: "none", stroke: "red", stokeWidth: "2px"},
                                strokeDasharray:'3,3',
                                d:"M" + xPx + " " + yPx + " " + xPx + " " + wljwY,

                            }
                        );
                        if (value !== phValue) {
                            pointArray.push(this.drawCircle('wljw', {
                                "x": xPx,
                                "y": wljwY,
                            }, 4, "red", "物理降温:" + phValue + "°C", false));
                        }
                    }
                }
            }
            // 绘制折线图
            //判断点是否重合
            let coor = [];
            for (let i = 0; i < mbPoints.length; i++) {
                let xlPoint = xlPoints[i];
                let mbPoint = mbPoints[i];
                let wdPoint = wdPoints[i];
                let ttPoint = ttPoints[i];
                //定义折线path
                let xlPath = "";
                let mbPath = "";
                let wdPath = "";
                let ttPath = "";
                coor[i] = {}
                for (let j = 0; j < xlPoint.length; j++) {
                    let x = xlPoint[j].x;
                    let y = xlPoint[j].y;
                    coor[i][x] = coor[i][x] || {};
                    coor[i][x]['xl'] = xlPoint[j];
                    if (xlPath === "") {
                        xlPath += "M" + x + "," + y;
                    } else {
                        xlPath += "L" + x + "," + y;
                    }
                }
                for (let j = 0; j < mbPoint.length; j++) {
                    let x = mbPoint[j].x;
                    let y = mbPoint[j].y;
                    coor[i][x] = coor[i][x] || {};
                    coor[i][x]['mb'] = mbPoint[j];
                    if (mbPath === "") {
                        mbPath += "M" + x + "," + y;
                    } else {
                        mbPath += "L" + x + "," + y;
                    }
                }
                for (let j = 0; j < wdPoint.length; j++) {
                    let x = wdPoint[j].x;
                    let y = wdPoint[j].y;
                    coor[i][x] = coor[i][x] || {};
                    coor[i][x]['wd'] = wdPoint[j];
                    if (wdPath === "") {
                        wdPath += "M" + x + "," + y;
                    } else {
                        wdPath += "L" + x + "," + y;
                    }
                }
                for (let j = 0; j < ttPoint.length; j++) {
                    let x = ttPoint[j].x;
                    let y = ttPoint[j].y;
                    coor[i][x] = coor[i][x] || {};
                    coor[i][x]['tt'] = ttPoint[j];
                    if (ttPath === "") {
                        ttPath += "M" + x + "," + y;
                    } else {
                        ttPath += "L" + x + "," + y;
                    }
                }
                pointArray.push({
                    label:'path',
                    plabel:'',
                    key:'pathXL'+i,
                    stroke:'red',
                    strokeWidth:'2',
                    fill:'none',
                    d:xlPath,
                });
                pointArray.push({
                    label:'path',
                    plabel:'',
                    key:'pathMB'+i,
                    stroke:'red',
                    strokeWidth:'2',
                    fill:'none',
                    d:mbPath,
                });
                pointArray.push({
                    label:'path',
                    plabel:'',
                    key:'pathWD'+i,
                    stroke:'blue',
                    strokeWidth:'2',
                    fill:'none',
                    d:wdPath,
                });
                pointArray.push({
                    label:'path',
                    plabel:'',
                    key:'pathTT'+i,
                    stroke:'red',
                    strokeWidth:'2',
                    fill:'none',
                    d:ttPath,
                })
            }
            for (let i = 0; i < coor.length; i++) {
                let json = coor[i];
                //相同X轴的点
                for (let j in json) {
                    if (!json[j].mb) {
                        json[j].mb = {};
                    }
                    if (!json[j].xl) {
                        json[j].xl = {};
                    }
                    if (!json[j].wd) {
                        json[j].wd = {};
                    }
                    if (!json[j].tt) {
                        json[j].tt = {};
                    }
                    //console.log(json[j].wd)
                    let mbY = json[j].mb.y;
                    let xlY = json[j].xl.y;
                    let wdY = json[j].wd.y;
                    let ttY = json[j].tt.y;
                    //console.log("mb:"+mbY+"xl:"+xlY+"wd:"+wdY);
                    let yw = json[j].wd.type === 'yw'; //腋温
                    let kw = json[j].wd.type === 'kw'; //口温
                    let gw = json[j].wd.type === 'gw'; //肛温
                    //判断是否重合
                    let ismbxlwd = mbY && xlY && wdY; //脉搏+心率+温度点都存在
                    let ismbxl = mbY && xlY; //脉搏+心率点都存在
                    let ismbwd = mbY && wdY; //脉搏+温度点都存在
                    let isxlwd = xlY && wdY; //心率+温度点都存在
                    let istt = ttY;
                    let iswd = wdY;
                    if (ismbxlwd && mbY === xlY && xlY === wdY && gw) { //脉搏+心率+肛温[红圆+红圈+蓝圈]：两个圈在外围（红圈在最外层表示心率，篮圈在里层表示肛温）、一个圆在中间（红圆表示脉搏）
                        let title = "脉搏：" + json[j].xl.value + "次，心率：" + json[j].xl.value + "次,肛温：" + json[j].wd.value + "°C";
                        pointArray.push(this.drawCircle("gw", {"x": j, "y": xlY}, 7, "blue", title, false));
                        pointArray.push(this.drawCircle("mb", {"x": j, "y": xlY}, 3, "red", title, true));
                    } else if (ismbxlwd && mbY === xlY && xlY === wdY && yw) {//脉搏+心率+腋温[红圆+红圈+蓝叉]：红圈在外围（表示心率）、红圆在中间（表示脉搏）、蓝叉在中间红圆之上（表示腋温）
                        let title = "脉搏：" + json[j].xl.value + "次，心率：" + json[j].xl.value + "次,腋温：" + json[j].wd.value + "°C";
                        pointArray.push(this.drawCircle("mb", {"x": j, "y": xlY}, 7, "red", title, true));
                        pointArray.push(this.drawCross("yw", {"x": j, "y": xlY}, 3, "blue", title));
                    } else if (ismbxlwd && mbY === xlY && xlY === wdY && kw) {//脉搏+心率+口温[红圆+红圈+蓝圆]：红圈在外围（表示心率）、红圆在中间（表示脉搏）、蓝圆在中间红圆之上（表示口温）
                        let title = "脉搏：" + json[j].xl.value + "次，心率：" + json[j].xl.value + "次,口温：" + json[j].wd.value + "°C";
                        pointArray.push(this.drawCircle("mb", {"x": j, "y": xlY}, 7, "red", title, true));
                        pointArray.push(this.drawCircle("kw", {"x": j, "y": xlY}, 3, "blue", title, true));
                    } else if (isxlwd && xlY === wdY && gw) { //心率+肛温[红圈+蓝圈]
                        let title = "心率：" + json[j].xl.value + "次，肛温：" + json[j].wd.value + "°C";
                        if (xlY && wdY) {
                            pointArray.push(this.drawCircle("gw", {"x": j, "y": xlY}, 7, "red", title, false));
                            pointArray.push(this.drawCircle("mb", {"x": j, "y": xlY}, 3, "blue", title, false));
                        }
                        mbY && pointArray.push(this.drawCircle("mb", {
                            "x": j,
                            "y": mbY
                        }, 4, "red", "脉搏：" + json[j].mb.value + "次", true));//脉搏
                    } else if (isxlwd && xlY === wdY && yw) { //心率+腋温[红圈+蓝叉]]
                        let title = "心率：" + json[j].xl.value + "次，腋温：" + json[j].wd.value + "°C";
                        if (xlY && wdY) {
                            pointArray.push(this.drawCircle("mb", {"x": j, "y": xlY}, 7, "red", title, false));
                            pointArray.push(this.drawCross("yw", {"x": j, "y": xlY}, 4, "blue", title));
                        }
                        mbY && pointArray.push(this.drawCircle("mb", {
                            "x": j,
                            "y": mbY
                        }, 4, "red", "脉搏：" + json[j].mb.value + "次", true));//脉搏
                    } else if (isxlwd && xlY === wdY && kw) {  //心率+口温[红圈+蓝圆]
                        let title = "心率：" + json[j].xl.value + "次，口温：" + json[j].wd.value + "°C";
                        if (xlY && wdY) {
                            pointArray.push(this.drawCircle("xl", {"x": j, "y": xlY}, 7, "red", title, false));
                            pointArray.push(this.drawCircle("kw", {"x": j, "y": xlY}, 3, "blue", title, true));
                        }
                        mbY && pointArray.push(this.drawCircle("mb", {
                            "x": j,
                            "y": mbY
                        }, 4, "red", "脉搏：" + json[j].mb.value + "次", true));//脉搏
                    } else if (ismbwd && mbY === wdY && gw) { //脉搏+肛温[红圆+蓝圈]
                        let title = "脉搏：" + json[j].mb.value + "次，肛温：" + json[j].wd.value + "°C";
                        if (mbY && wdY) {
                            pointArray.push(this.drawCircle("gw", {"x": j, "y": mbY}, 7, "red", title, false));
                            pointArray.push(this.drawCircle("mb", {"x": j, "y": mbY}, 3, "blue", title, false));
                        }
                        xlY && pointArray.push(this.drawCircle("xl", {
                            "x": j,
                            "y": xlY
                        }, 4, "red", "心率：" + json[j].xl.value + "次", false));//心率
                    } else if (ismbwd && mbY === wdY && yw) { //脉搏+腋温[红圆+蓝叉]
                        let title = "脉搏：" + json[j].mb.value + "次，腋温：" + json[j].wd.value + "°C";
                        if (mbY && wdY) {
                            pointArray.push(this.drawCircle("mb", {"x": j, "y": mbY}, 7, "red", title, false));
                            pointArray.push(this.drawCross("yw", {"x": j, "y": mbY}, 4, "blue", title));
                        }
                        xlY && pointArray.push(this.drawCircle("xl", {
                            "x": j,
                            "y": xlY
                        }, 4, "red", "心率：" + json[j].xl.value + "次", false));//心率
                    } else if (ismbwd && mbY === wdY && kw) {  //脉搏+口温[红圆+蓝圆]
                        let title = "脉搏：" + json[j].mb.value + "次，口温：" + json[j].wd.value + "°C";
                        if (mbY && wdY) {
                            pointArray.push(this.drawCircle("mb", {"x": j, "y": mbY}, 7, "red", title, false));
                            pointArray.push(this.drawCircle("kw", {"x": j, "y": mbY}, 3, "blue", title, true));
                        }
                        xlY && pointArray.push(this.drawCircle("xl", {
                            "x": j,
                            "y": xlY
                        }, 4, "red", "心率：" + json[j].xl.value + "次", false));//心率
                    } else if (ismbxl && mbY === xlY) { //脉搏+心率[红圆]
                        let title = "脉搏：" + json[j].mb.value + "次，心率" + json[j].mb.value + "次";
                        mbY && xlY && pointArray.push(this.drawCircle("mb", {"x": j, "y": mbY}, 4, "red", title, true));
                        drawWd(json[j], j, wdY);
                    } else {//正常绘制
                        xlY && pointArray.push(this.drawCircle("xl", {
                            "x": j,
                            "y": xlY
                        }, 4, "red", "心率：" + json[j].xl.value + "次", false));//心率
                        mbY && pointArray.push(this.drawCircle("mb", {
                            "x": j,
                            "y": mbY
                        }, 4, "red", "脉搏：" + json[j].mb.value + "次", true));//脉搏
                        drawWd(json[j], j, wdY);
                    }
        
                    //绘制温度
                    function drawWd(point, j, wdY) {
                        if (wdY && wdY < wdMax) {
                            //绘制向上的箭头
                            pointArray.push(that.drawArrow({"x": j, "y": wdMax}, 2 * height, true, 'blue'));
                        } else {
                            if (point.wd.type === "yw") {
                                wdY && pointArray.push(that.drawCross("yw", {
                                    "x": j,
                                    "y": wdY
                                }, 4, "blue", "腋温：" + point.wd.value + "°C"));//温度
                            } else if (point.wd.type === "gw") {
                                wdY && pointArray.push(that.drawCircle("gw", {
                                    "x": j,
                                    "y": wdY
                                }, 4, "blue", "肛温：" + point.wd.value + "°C", false));
                            } else if (point.wd.type === "kw") {
                                wdY && pointArray.push(that.drawCircle("yw", {
                                    "x": j,
                                    "y": wdY
                                }, 4, "blue", "口温：" + point.wd.value + "°C", true));
                            }
                        }
                    }
        
                    //绘制疼痛
                    let title = "疼痛：" + json[j].tt.value;
                    istt && pointArray.push(this.drawSquare("tt", {"x": j, "y": ttY}, 4, "blue", title, true));
                }
            }
        
            for (let i = 0; i < mbPoints.length; i++) {
                for (let j = 0; j < mbPoints[i].length; j++) {
                    let x = mbPoints[i][j].x;
                    let y = mbPoints[i][j].y;
                    //pointArray.push(this.drawCircle("mb",{"x":x,"y":y},4,"red","脉搏",true));
                }
                for (let j = 0; j < xlPoints[i].length; j++) {
                    let x = xlPoints[i][j].x;
                    let y = xlPoints[i][j].y;
                    //pointArray.push(this.drawCircle("xl",{"x":x,"y":y},4,"red","心率",false));
                }
            }
            // 根据心率和脉搏点，绘制多边形（脉搏短促）
            //统计出现的多边形
            let polygonArray = this.getPolygon(mbPoints, xlPoints);
            //console.log("多边形")
            //console.log(polygonArray)
            //绘制多边形
            for (let i = 0; i < polygonArray.length; i++) {
                let polygon = polygonArray[i];
                pointArray.push(this.drawBlueLine(polygon))
            }
            return pointArray;
        };
        /**
         * @method getPolygon 获取多边形
         * @param {Array} mbPoints 脉搏点
         * @param {Array} xlPoints 心率点
         * 脉搏短绌即在同一单位时间内，脉率少于心率
         */
        Vue.prototype.getPolygon = function(mbPoints, xlPoints){        
            let polygonArray = [];
            let intersectionArray = []; //缓存交点数组
            for (let i = 0; i < mbPoints.length; i++) {
                intersectionArray[i] = [];
                let mbArray = mbPoints[i];
                let xlArray = xlPoints[i];
                //如果不存在脉搏大于心率的点则不绘制多边形
                if (mbArray.length === 0 || xlArray.length === 0) {
                    return polygonArray;
                }
                for (let j = 0; j < mbArray.length; j++) {
                    let curMbX = this.getParseFloat(mbArray[j].x, 4);
                    let curMbY = this.getParseFloat(mbArray[j].y, 4);
                    if (mbArray[j + 1] !== undefined) {
                        let nextMbX = this.getParseFloat(mbArray[j + 1].x, 4);
                        let nextMbY = this.getParseFloat(mbArray[j + 1].y, 4);
                        let line1 = this.lineX({"x": curMbX, "y": curMbY}, {"x": nextMbX, "y": nextMbY});
                        for (let h = 0; h < xlArray.length; h++) {
                            let curXlX = this.getParseFloat(xlArray[h].x, 4);
                            let curXlY = this.getParseFloat(xlArray[h].y, 4);
                            if (xlArray[h + 1] !== undefined) {
                                let nextXlX = this.getParseFloat(xlArray[h + 1].x, 4);
                                let nextXlY = this.getParseFloat(xlArray[h + 1].y, 4);
                                let line2 = this.lineX({"x": curXlX, "y": curXlY}, {"x": nextXlX, "y": nextXlY});
                                let interX = this.segmentsIntr(line1, line2).x;
                                let interY = this.segmentsIntr(line1, line2).y;
                                //交点在心率线段上
                                if (h === xlArray.length - 2 && j === xlArray.length - 2) {
                                    //console.log(segmentsIntr(line1,line2))
                                }
                                let xlBool = interX >= curXlX && interX <= nextXlX && (interY >= curXlY && interY <= nextXlY || interY <= curXlY && interY >= nextXlY);
                                //交点在脉搏线段上
                                let mbBool = interX >= curMbX && interX <= nextMbX && (interY >= curMbY && interY <= nextMbY || interY <= curMbY && interY >= nextMbY);
                                if (xlBool && mbBool) {
                                    intersectionArray[i].push(this.segmentsIntr(line1, line2));
                                }
                            }
                        }
                    }
                }
            }
            //根据交点计算多边形
            for (let i = 0; i < intersectionArray.length; i++) {
                let interArray = intersectionArray[i];
                let xlPoint = xlPoints[i];
                let mbPoint = mbPoints[i];
                if (interArray.length === 0) { //不存在交点
                    //判断是否所有脉搏小于心率的点,按x坐标分组
                    let coor = {};
                    for (let j = 0; j < xlPoint.length; j++) {
                        let x = xlPoint[j].x;
                        let y = xlPoint[j].y;
                        coor[x] = coor[x] || [];
                        coor[x]['xl'] = y;
                    }
                    for (let j = 0; j < mbPoint.length; j++) {
                        let x = mbPoint[j].x;
                        let y = mbPoint[j].y;
                        coor[x] = coor[x] || [];
                        coor[x]['mb'] = y;
                    }
                    let isMore = true;
                    for (let j in coor) {
                        if (coor[j].xl && coor[j].mb) {
                            if (coor[j].xl > coor[j].mb) {
                                isMore = false;
                                break;
                            }
                        }
                    }
                    if (isMore) { //存在脉搏短促
                        let newXlpoint = xlPoint;
                        let newMbpoint = mbPoint;
                        let newPoint;
                        newXlpoint.reverse();
                        newPoint = newMbpoint.concat(newXlpoint);
                        newPoint.push(newMbpoint[0]);
                        polygonArray.push(newPoint);
                    }
                }
                //存在交点，绘制交点前的多边形
                //console.log(intersectionArray)
                if (interArray.length > 0 && mbPoint.length > 0) {
                    //获取第一个交点前脉搏、心率点
                    let mbArray = [];
                    let xlArray = [];
                    let firstInter = interArray[0];
                    let firstInterX = interArray[0].x;
                    for (let k = 0; k < mbPoint.length; k++) {
                        let moreX = mbPoint[k].x;
                        if (moreX <= firstInterX) {
                            mbArray.push(mbPoint[k]);
                        }
                    }
                    for (let k = 0; k < xlPoint.length; k++) {
                        let moreX = xlPoint[k].x;
                        if (moreX <= firstInterX) {
                            xlArray.push(xlPoint[k]);
                        }
                    }
                    if (mbArray.length > 0 || xlArray.length > 0) {
                        mbArray.push(firstInter)
                        xlArray.reverse();
                        mbArray = mbArray.concat(xlArray);
                        mbArray.push(mbArray[0]);
                        polygonArray.push(mbArray);
                    }
                }
                //存在多个交点
                for (let f = 0; f < interArray.length; f++) {
                    if (interArray[f] && interArray[f + 1] !== undefined) {
                        let enterX = interArray[f].x;
                        let enterNextX = interArray[f + 1].x;
                        let morePointArray = []; //保存相邻的两个 交点（心率）
                        let lessPointArray = []; //保存相邻的两个 交点（脉搏）
                        for (let j = 0; j < mbPoint.length; j++) {
                            let moreX = mbPoint[j].x;
                            if (moreX >= enterX && moreX <= enterNextX) {
                                morePointArray.push(mbPoint[j]);
                            }
                        }
                        for (let j = 0; j < xlPoint.length; j++) {
                            let moreX = xlPoint[j].x;
                            if (moreX >= enterX && moreX <= enterNextX) {
                                lessPointArray.push(xlPoint[j]);
                            }
                        }
                        if (morePointArray.length > 0) { //存在心率大于脉搏的点
                            morePointArray.unshift(interArray[f]);
                            lessPointArray.reverse();
                            morePointArray.push(interArray[f + 1]);
                            morePointArray = morePointArray.concat(lessPointArray);
                            morePointArray.push(interArray[f]);
                            polygonArray.push(morePointArray)
                        }
                    } else if (interArray[f] && interArray[f + 1] === undefined) {
                        //获取最后的节点
                        let morePointArray = []; //保存相邻的两个 交点（心率）
                        let lessPointArray = []; //保存相邻的两个 交点（脉搏）
                        let enterX = interArray[f].x;
                        for (let j = 0; j < mbPoint.length; j++) {
                            let moreX = mbPoint[j].x;
                            if (moreX > enterX) {
                                morePointArray.push(mbPoint[j]);
                            }
                        }
                        for (let j = 0; j < xlPoint.length; j++) {
                            let moreX = xlPoint[j].x;
                            if (moreX > enterX) {
                                lessPointArray.push(xlPoint[j]);
                            }
                        }
                        if (morePointArray.length > 0 && lessPointArray.length > 0) { //存在心率大于脉搏的点
                            morePointArray.unshift(interArray[f]);
                            lessPointArray.reverse();
                            morePointArray = morePointArray.concat(lessPointArray);
                            morePointArray.push(interArray[f]);
                            polygonArray.push(morePointArray)
                        }
                    }
                }
            }
            return polygonArray || [];
        };
        /**
         * @method splitGroup 根据请假事件分组
         * @param {Array} leaveEvent 请假事件
         * @param {Array} point 录入信息
         */
        Vue.prototype.splitGroup = function(leaveEvent, point){
            //没有请假事件
            if (leaveEvent.length === 0) {
                return [point];
            }
            //按请假事件分组 根据请假事件的数量，判断分组数量
            let groupArray = [];
            let groupRule = []; //缓存分组规则
            let groupNum = leaveEvent.length + 1; //分组数量
            for (let i = 0; i < groupNum; i++) { // 计算分组规则
                groupRule[i] = {};
                //只有一个分组点时
                if (i === 0) {
                    groupRule[i].min = leaveEvent[i];
                } else if (i === groupNum - 1) {
                    groupRule[i].max = leaveEvent[i - 1];
                } 
                //有多个分组点时
                else {
                    groupRule[i].min = leaveEvent[i - 1];
                    groupRule[i].max = leaveEvent[i];
                }
            }
            //将录入信息根据请假事件分组
            for (let i = 0; i < groupRule.length; i++) {
                let min = groupRule[i].min;
                let max = groupRule[i].max;
                groupArray[i] = []; //初始化
                for (let j = 0; j < point.length; j++) {
                    let time = point[j].dataTime;
                    if (this.judgeIn(time, min, max)) {
                        groupArray[i].push(point[j]);
                    }
                }
            }
            return groupArray;
        };
        /**
         * @method judgeIn 判断当前时间是否处于某个时间段
         * @param {String} curTime 当前时间
         * @param {String} minTime 最小时间
         * @param {String} maxTime 最大时间
         * @return {Boolean}
         */
        Vue.prototype.judgeIn = function(curTime, minTime, maxTime){
            curTime = new Date(curTime.replace(/-/g, "/"));
            minTime = minTime ? new Date(minTime.replace(/-/g, "/")) : 0;
            maxTime = maxTime ? new Date(maxTime.replace(/-/g, "/")) : 0;
            if (!minTime && maxTime) { //最小时间未定义，则返回是否大于最大值
                if (curTime > maxTime) {
                    return true;
                }
            }
            if (minTime && !maxTime) {
                if (curTime <= minTime) {
                    return true;
                }
            }
            if (minTime && maxTime) {
                if (curTime > minTime && curTime <= maxTime) {
                    return true;
                }
            }
        };

        /**
         * @method getXY 计算在svg中的x、y值
         * @param {JSON} point 录入信息
         * @param {String} beginDate 开始时间
         * @param {Number} originY 坐标原点显示刻度
         * @param {Number} maxY 最大刻度
         * @param {Array} ySection y值区间
         * @param {Boolean} type ture 返回phVlaue(物理降温)对应的xy,false value值 返回对应的xy,默认为true
         */
        Vue.prototype.getXY = function(point, beginDate, originY, maxY, ySection, type){
            //let curDate = point.dataTime;
            let curDate = point.date + " " + point.hour + ":00";
            let value = type ? parseFloat(point.phValue) : parseFloat(point.value);
            let height = Number(store.state.KDobj.trHeight);
            let daysW = height * 6;
            //Y轴刻度差
            let Yheight = Math.abs(ySection[0] - ySection[1]);
            //一刻度对应的像素值 - y轴
            let Ypxs = Yheight / (maxY - originY); //原点为(0,0) 计算出一刻度对应的像素值
            let disTop = parseFloat(ySection[1]); //顶部刻度值所在的像素点
            let xPx = this.getDisDays(beginDate, curDate) * daysW;//计算出x点坐标
            //y轴总高度减去 （从底部的开始刻度值到目标的刻度值 之差 * 一个刻度对应的像素值 ：从底部计算这个高度 就能得到目标点所处的y轴高度）
            let yPx = Math.round((Yheight + disTop) - Ypxs * (value - originY));
            return {
                x: xPx,
                y: yPx,
                value: value,
                type: point.type,
                point: point,
            }
        };
        /**
         * @method numToChinese 将阿拉伯数字转换成中文数字
         * @param {Array} numArray 阿拉伯数字数组
         * @param {Array} chineseArray 中文数字数组
         * @return
         * */
        Vue.prototype.numToChinese = function(numArray, chineseArray){
            let finalStr = "";
            if (numArray.length === 1) {//几点
                finalStr = chineseArray[parseInt(numArray[0])]; // 索引 - 数组中文
                return finalStr;
            } else {//十几点
                if (numArray[0] === "1") {
                    if (numArray[1] === "0") {
                        finalStr += "十";
                    } else {
                        finalStr += "十" + chineseArray[parseInt(numArray[1])];// 索引 - 数组中文
                    }
                } else {//二十几点
                    if (numArray[1] === "0") {
                        finalStr += chineseArray[parseInt(numArray[0])] + "十";
                    } else {
                        finalStr += chineseArray[parseInt(numArray[0])] + "十" + chineseArray[parseInt(numArray[1])];
                    }
                }
            }
            return finalStr;
        };
        /**
         * @method getDisDays 计算时间段间隔多少天
         * @param {String/Date} beginDate 开始时间
         * @param {String/Date} endDate 结束时间
         * @param {Number} beginHour 起始时刻
         * @return
         */
        Vue.prototype.getDisDays = function(beginDate, endDate, beginHour){
            beginHour = beginHour || 2;
            //判断是否是Date对象
            if (!(beginDate instanceof Date)) {
                beginDate = new Date(beginDate.replace(/-/g, "/"));
            }
            if (!(endDate instanceof Date)) {
                endDate = new Date(endDate.replace(/-/g, "/"));
            }
            return (endDate - beginDate) / (3600 * 1000 * 24);
        };
        
        /**
         * @method getParseFloat 将浮点数保留多少位小数
         * @param {String/Float} number 数字
         * @param {String/Float} sub 保留多少位小数
         */
        Vue.prototype.getParseFloat = function(number, sub){
            return parseFloat(parseFloat(number).toFixed(sub));
        };
        /**
         * 绘制正方形
         * @param {Object} type 属性 可选值有hx/mb/tw
         * @param {Object} size 正方形大小
         * @param {Object} xy 坐标
         * @param {Object} color 颜色
         * @param {Object} title 鼠标放上去显示的值
         * @param {Object} fill 是否实心
         * @return
         */
        Vue.prototype.drawSquare = function(type, xy, size, color, title, fill){
            if (title === null || title === undefined) {
                return "";
            }
            let width = 1; //定义正方形的宽度
            return ({
                pLabel:'Tooltip',
                PClassName:'oak-tooltip',
                pKey:"tt" + xy.y + xy.x,
                pTitle:title,
                label:'rect',
                title:title,
                x:xy.x-size,
                y:xy.y-size,
                width:size * 2,
                height:size * 2,
                style:{fill: (fill ? color : "#fff"), stroke: color, strokeWidth: width},
            })
        };
        /**
         * @method drawCircle 绘制圆 [ 空心圆,实心圆]
         * @param {String} type 属性 可选值有hx/mb/tw
         * @param {JSON} xy 坐标
         * @param {Number} r 半径
         * @param {String} color 颜色
         * @param {String} title 鼠标放上去显示的值
         * @param {Boolean} fill 是否实心  true为实心，false为空心
         * @return
         */
        Vue.prototype.drawCircle = function (type, xy, r, color, title, fill) {
            if (title === null || title === undefined) {
                return "";
            }
            let width = 2;	//定义圆环的宽度
            let circleHtml = "";
            let circleObj = {};//存放圆形的对象，用于代替circleHtml
            if (fill) { //实心
                circleObj = {
                    plabel:'Tooltip',
                    pclassName:'oak-tooltip',
                    pkey:type + xy.y + xy.x,
                    ptitle:title,
                    label:'circle',
                    key:type + xy.y + xy.x,
                    cx:xy.x,
                    cy:xy.y,
                    r:r,
                    strokeWidth:width,
                    stroke:color,
                    fill:color,
                    title:title,
                }
            } else { //空心
                circleObj = {
                    plabel:'Tooltip',
                    pclassName:'oak-tooltip',
                    pkey:type + xy.y + xy.x,
                    ptitle:title,
                    label:'circle',
                    key:type + xy.y + xy.x,
                    cx:xy.x,
                    cy:xy.y,
                    r:r,
                    strokeWidth:width,
                    stroke:color,
                    fill:'#fff',
                    title:title,
                }
            }
            return circleObj;
        };
        /**
         * @method drawCross 绘制叉叉
         * @param {String} type 属性 可选值有hx/mb/tw
         * @param {JSON} xy 坐标
         * @param {Number}  halfSize 叉叉的尺寸
         * @param {String} color 颜色
         * @param {String} title 鼠标放上去显示的值
         * @return
         * */
        Vue.prototype.drawCross =function (type, xy, halfSize, color, title) {
            let html = [];
            let HtmlArr = [];
            if (title === null || title === undefined) {
                return html;
            }
            let x = parseFloat(xy.x);
            let y = parseFloat(xy.y);
            HtmlArr.push({
                ppLabel:'svg',
                ppKey:x,
                plabel:'Tooltip',
                PClassName:'oak-tooltip',
                pkey:'0',
                pTitle:title,
                label:'line',
                type:type,
                title:title,
                x1:x-halfSize,
                y1:y-halfSize,
                x2:x+halfSize,
                y2:y+halfSize,
                style:{strokeWidth: 2, stroke: color}
            });
            HtmlArr.push({
                ppLabel:'svg',
                ppKey:x,
                plabel:'Tooltip',
                PClassName:'oak-tooltip',
                pkey:'1',
                pTitle:title,
                label:'line',
                type:type,
                title:title,
                x1:x+halfSize,
                y1:y-halfSize,
                x2:x-halfSize,
                y2:y+halfSize,
                style:{strokeWidth: 2, stroke: color}
            });
            return HtmlArr;
        };
        /**
         * @method drawFiveStar  绘制五角星
         * @param {String} type 属性 可选值有hx/mb/tw
         * @param {JSON} xy 坐标
         * @param {Number} size 五角星的尺寸
         * @param {String} color 颜色
         * @param {String} title 鼠标放上去显示的值
         * @return
         */
        Vue.prototype.drawFiveStar = function (type, xy, size, color, title) {
            if (title === null || title === undefined) {
                return "";
            }
            //已值点为中心,进行算法来形成五角星
            let disX = size / 2; //左右差值
            let points = xy.x + "," + (xy.y - (size + disX)) + " " + (xy.x - size) + "," + (xy.y + (size + disX)) + "  " + (xy.x + (size + disX)) + " ," + (xy.y - disX) + " " + (xy.x - (size + disX)) + "," + (xy.y - disX) + ", " + (xy.x + size) + "," + (xy.y + (size + disX));
            return <polygon key={xy.y} type={type} points={points} title={title} fill={color}/>;
        };
        /**
         * @method drawArrow 绘制箭头
         * @param {JSON} xy 坐标 {x:x,y:y}
         * @param {Number} length 箭头长度
         * @param {Boolean} type 箭头类型
         * @param {String} color 箭头颜色
         */
        Vue.prototype.drawArrow = function (xy, length, type, color, title) {
            let x = xy.x;
            let y1 = xy.y - length;
            let y2 = xy.y - 3;
            if (type) {
                x = xy.x;
                y1 = xy.y;
                y2 = xy.y - length + 3;
            }
            return ({
                eventType:'botEvent',
                label:'line',
                plabel:'svg',
                pkey: xy.y + (type ? "up" : "down"),
                x1:x,
                y1:y1,
                x2:x,
                y2:y2,
                style:{stroke: color, strokeWidth: 1.3},
                markerEnd:'url(#markerArrow)',
                defs:{
                    label:'marker',
                    id:'markerArrow',
                    markerWidth:'8',
                    markerHeight:'8',
                    refX:'4',
                    refY:'4.5',
                    orient:'auto',
                    path:{
                        label:'path',
                        d:'M1.62,1.62 L1.62,7.92 L7.2,4.32 L1.62,1.62',
                        style:{fill: color},
                        title:title ? title : "",
                    },
                }
            }
            );
        };
        /**
         * @method 绘制文字
         * @param {Object} xy {x:x,y:y} 坐标点
         * @param {Object} color 颜色
         * @param {Object} value 值
         * @param {Object} title 鼠标放上去显示的title
         */
        Vue.prototype.drawText = function (xy, color, value, title) {
            let x = xy.x;
            let y = xy.y;
            return <text key={x + y} fill={color} x={x - 6} y={y} title={title}>{value}</text>;
        };
        /**
         * @method drawPolygon 绘制多边形
         * @param {Array} points 多边形的点[{"x":x,"y":y},{"x":x,"y":y}]
         * @param {String} color 多边形颜色
         * @param {String/Number} key react数组key值（唯一）
         * @return {JSON} polygonLinear 多边形边的二元一次方程的数组；polygonHtml 多边形显示组件；point多边形的点的数组
         */
        Vue.prototype.drawPolygon = function (points, color, key) {
            if (points.length === 0) {
                return "";
            }
            color = color || "#000";
            let polygonLinear = [];
            let pointStr;
            let pointStrArray = [];
            let point = [];
            for (let i = 0; i < points.length; i++) {
                pointStr = points[i].x + "," + points[i].y;
                //根据两点求方程
                if (points[i + 1] !== undefined) {
                    let linear = this.lineX(points[i], points[i + 1]);
                    polygonLinear.push(linear);
                    point.push([points[i], points[i + 1]]);
                }
                pointStrArray.push(pointStr);
            }
            pointStr = pointStrArray.join(" ");
            let polygonHtml = {
                label:'polygon',
                key:key,
                points:pointStr,
                style:{fill: 'none', stroke: color, strokeWidth: 1},
            }

            return {
                "html": polygonHtml,
                "linear": polygonLinear,
                "point": point
            };
        };
        /**
         * @method lineX 根据两点求二元一次方程
         * @param {JSON} point1 点1{x:"",y:""}
         * @param {JSON} point2 点2{x:"",y:""}
         * @return {JSON} a为常数，b为系数, 返回x为垂直于x轴的直线，返回Y为垂直于y轴的直线
         * */
        Vue.prototype.lineX = function (point1, point2) {
            let x1 = point1.x;
            let x2 = point2.x;
            let y1 = point1.y;
            let y2 = point2.y;
            if (x2 - x1 === 0) {
                return {x: x1};
            }
            /*if(y1 - y2 === 0){
            return {y : y1}
            }*/
            //求系数
            let b = (y2 - y1) / (x2 - x1);
            //求常数
            let a = y1 - b * x1;
            return {
                a: a,
                b: b
            }
        };
        /**
         * @method segmentsIntr  求二元一次方程的交点
         * @param {JSON} line1 线条1方程
         * @param {JSON} line2 线条2方程
         * @return 交点
         * */
        Vue.prototype.segmentsIntr = function (line1, line2) {
            let a1 = line1.a;
            let a2 = line2.a;
            let b1 = line1.b;
            let b2 = line2.b;
            let x, y;
            if (a2 === undefined || b2 === undefined) {
                x = line2.x;
                y = a1 + b1 * x
            } else {
                x = (a1 - a2) / (b2 - b1);
                y = a1 + b1 * x;
            }
            x = parseFloat(parseFloat(x).toFixed(4));
            y = parseFloat(parseFloat(y).toFixed(4));
            return {
                x: x,
                y: y
            }
        };
        /**
         * @method getDoundary 计算边界
         * @param point
         * @returns {{maxX: Number, minX: Number, maxY: Number, minY: Number}}
         */
        Vue.prototype.getDoundary = function (point) {
            let maxX = +point[0].x;
            let minX = +point[0].x;
            let maxY = +point[0].y;
            let minY = +point[0].y;
            for (let i = 0; i < point.length; i++) {
                let pointX = +point[i].x;
                let pointY = +point[i].y;
                if (pointX > maxX) {
                    maxX = pointX;
                }
                if (pointX < minX) {
                    minX = pointX;
                }
                if (pointY > maxY) {
                    maxY = pointY;
                }
                if (pointY < minY) {
                    minY = pointY;
                }
            }
            return {
                maxX: parseFloat(parseFloat(maxX).toFixed(4)),
                minX: parseFloat(parseFloat(minX).toFixed(4)),
                maxY: parseFloat(parseFloat(maxY).toFixed(4)),
                minY: parseFloat(parseFloat(minY).toFixed(4))
            }
        };
        /**
         * @getBlueLineFuncs 获取蓝斜线方法
         * @param {Number/Float} b 斜度
         * @returns {Array}
         */
        Vue.prototype.getBlueLineFuncs = function (b) {
            b = b || -4;
            let blueLineFuncs = [];
            //计算蓝斜线可能显示的最大区域，即根据系数，计算常数的最小值，和最大值
            let svgW = Number(store.state.KDobj.trHeight) * 42;
            let svgH = Number(store.state.KDobj.trHeight) * Number(store.state.KDobj.lastTr);
            let disI = parseInt(b) * 3;
            if (b < 0) {
                let a1 = 0;
                let a2 = svgH - b * svgW;
                for (let i = a1; i < a2; i = i + 16) {//
                    blueLineFuncs.push({a: i, b: b});
                }
            } else {
                let a1 = -(svgW / b);
                let a2 = svgH;
                for (let i = a1; i < a2; i = i + 16) {
                    blueLineFuncs.push({a: i, b: b});
                }
            }
            return blueLineFuncs;
        };
        /**
         * @method drawBlueLine 绘制蓝斜线
         * @param {Array} polygonArray 多边形点的数组集合
         * @param {String/Number} key react数组的key值
         * @return
         */
        Vue.prototype.drawBlueLine =function (polygonArray, key) {
            let htmlArray = [];
            let polygonline = this.drawPolygon(polygonArray, "red").linear;
            let htmlde = this.drawPolygon(polygonArray, "red", 'polygon').html;
            let point = this.drawPolygon(polygonArray, "red").point;
            let totalPoints = [];
            let blueLineFuncs = this.getBlueLineFuncs();
            for (let i = 0; i < blueLineFuncs.length; i++) {
                let pointArray = [];
                for (let j = 0; j < polygonline.length; j++) {
                    let pointNow = point[j];
                    let maxX = this.getDoundary(pointNow).maxX;
                    let minX = this.getDoundary(pointNow).minX;
                    let maxY = this.getDoundary(pointNow).maxY;
                    let minY = this.getDoundary(pointNow).minY;
                    //一条边与斜线的交点
                    //计算交点
                    let line1 = blueLineFuncs[i];
                    let line2 = polygonline[j];
                    let points = this.segmentsIntr(line1, line2);
                    // 判断交点是否在线段上，即在多边形内
                    //console.log(minX+"~"+maxX+"~"+minY+"~"+maxY)
                    if (points.x >= minX && points.x <= maxX && points.y >= minY && points.y <= maxY) {
                        pointArray.push(points);
                    }
                }
                if (pointArray.length) {
                    totalPoints.push(pointArray);
                }
            }
            for (let j = 0; j < totalPoints.length; j++) {
                let points = totalPoints[j];
                if (points.length === 2) {
                    htmlArray.push({
                        label:'line',
                        key:j + "points",
                        x1:points[0].x,
                        y1:points[0].y,
                        x2:points[1].x,
                        y2:points[1].y,
                        style:{stroke: 'blue', strokeWidth: 1}
                    })                 
                } else if (points.length > 2 && points.length % 2 === 0) {
                    //根据x值大小排序（升序）冒泡排序
                    for (let i = 0; i < points.length - 1; i++) { //取数组中任意两点匹配
                        for (let k = 0; k < points.length - 1 - i; k++) {
                            let pointX = points[k].x;
                            let nextPointX = points[k + 1].x;
                            if (pointX > nextPointX) {
                                let temp = points[k];
                                points[k] = points[k + 1];
                                points[k + 1] = temp;
                            }
                        }
                    }
                    //相邻两点生成一条线段
                    for (let i = 0; i < points.length; i = i + 2) {
                        htmlArray.push({
                            label:'line',
                            key:'xiangling' + i,
                            x1:points[i].x,
                            y1:points[i].y,
                            x2:points[i + 1].x,
                            y2:points[i + 1].y,
                            style:{stroke: 'blue', strokeWidth: 1}
                        })     
                    }
                }
            }
            htmlArray.push(htmlde);
            return htmlArray;
        }
    }
} 