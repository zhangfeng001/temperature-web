<template>
    <tbody id="mtbody">
        <tr v-for="(item,pindex) in gridArray" :style="styleObj"  :key="pindex" :class="doTrBorder(item.className,pindex) " >
            <td v-for="(childitem,cindex) in item" :key="cindex" :rowSpan="doCheckIndex(pindex,cindex)"
            :style="doVerticalAlign(childitem.styleAlin,pindex,cindex,childitem.title)"
            :class="doTdBorder(childitem.className,pindex,cindex)" :colSpan="childitem.colSpan">
             <div v-if="doSvgLeftShow(pindex,cindex)" className="svgLeft">
                    <div class="kdTitle">
                        <p>{{title1[0]}}<br>({{title1[1]}})</p>
                        <p>{{title2[0]}}<br>({{title2[1]}})</p>
                    </div>
                    <SvgLeft/>
             </div>
                {{childitem.text}}
            </td>
        </tr> 
    </tbody>
</template>

<script>
import SvgLeft from "./svgLeft";
import SvgRight from "./svgRight";
import {mapMutations, mapGetters} from 'vuex'
export default {
    name:'gridTable',
    props:['breathingList','dayMap'],
    data(){
        return{
            selBreathingList:[],//呼吸数据
            selDayMap:[],//下方可扩展项目
            gridArray:[],//网格数组
            styleObj:{
                height:"",
            },
            title1:['脉搏','次/分'],
            title2:['体温','℃'],
            lastTr:0,
            trLines:5,
        }
    },
    components:{
        SvgLeft,
        SvgRight
    },
     computed: {
            ...mapGetters([
                'KDobj'
            ])
        },
    created(){
        this.selBreathingList = this.breathingList;
        this.selDayMap = this.dayMap;
        this.WDLastTr = Number(this.KDobj.lastTr + 1);
        this.trLines = Number(this.KDobj.trLines);
        this.styleObj.height =  Number(this.KDobj.trHeight) + 'px';
        //画网格
        this.gridArray = this.createTable(this.breathingList,this.selDayMap);
    },
    methods:{
        returnParams(key='',rowSpan,colSpan,className='',text='',styleAlin='',title=''){
            let params = {
                key:key,
                rowSpan:rowSpan || 0,
                colSpan:colSpan || 0,
                className:className || '',
                text:text || '',
                styleAlin:styleAlin || '',
                title:title,
            }
            return params;
        },
        //首行首各 跨行处理
        doCheckIndex(pindex,cindex){
            if(pindex == 0 && cindex == 0){
                return this.WDLastTr;
            }
        },
        //每五行 加粗
        doTrBorder(className,index){
            if(index == Number(this.KDobj.trLittleCounts) - 1){
                return ['borderB']
            }else{
                index = index - Number(this.KDobj.trLittleCounts);
                if((index + 1) % this.trLines === 0 && index < this.WDLastTr ){
                    return ['borderB']
                }else{ 
                    return [''] 
                }
            }
           
        },
        //每六列标红
        doTdBorder(border,pindex,cindex){
            if(pindex < this.WDLastTr){
                return  [border]
            }
            else{ return [''] }
        },
        //处理呼吸 奇偶列上下显示
        doVerticalAlign(styleAlin,pindex,cindex,val){
            if(val == '呼吸' ){
                return {
                    "vertical-align": styleAlin,
                    'height':"30px",
                    'font-size':'10px',
                    '-webkit-transform':'scale(0.9)'
                }
            }else if(val == '血压'){
                return {
                    'font-size':'12px',
                    '-webkit-transform':'scale(0.9)'
                }
            }
        },
        //展示左侧刻度线
        doSvgLeftShow(pindex,cindex){
            if( pindex === 0 && cindex === 0 ){
                return true;
            }else{
                return false
            }
        },
    //画表格
    createTable(breathingList, selDayMap) {

        let gridArray = [];
        //中间41行
        for (let i = 0; i < this.WDLastTr ; i++) {//每一列41个格子 循环41遍 这里要写活 写成可配置的
            gridArray[i] = [];
            if (i === 0) { //第一行
                gridArray[i].push(this.returnParams(0,this.WDLastTr))
                for (let j = 0; j < 42; j++) { //中间42个格子
                    if ((j + 1) % 6 === 0) {
                        gridArray[i].push(this.returnParams(j + 1,0,'','borderR'))
                    } else {
                        gridArray[i].push(this.returnParams(j + 1,0))
                    }
                }
            } else {//非第一行
                for (let j = 0; j < 42; j++) {
                    if ((j + 1) % 6 === 0) {
                        gridArray[i].push(this.returnParams(j+1,0,'','borderR'))
                    } else {
                        gridArray[i].push(this.returnParams(j+1,0))
                    }
                }
            }
        }
        //下方 生成呼吸信息
        let hxData = breathingList; 
        let len = gridArray.length;
        gridArray[len] = [];
        gridArray[len].push(this.returnParams(0,0,'','hx','呼吸'))
        let align = 'bottom';
        for (let i = 0; i < 42; i++) {
            if(align == 'bottom' && hxData[i] !== ''){
                align = "top";
            }else if(align == 'top' && hxData[i] !== ''){
                align = "bottom";
            }
            gridArray[len].push(this.returnParams(i + 1,0,'','hx',hxData[i],align,'呼吸'))
        }
        gridArray[len].push(this.returnParams(42,0,'','hx','',''))

        //生成每日录入信息
        let dayInput = this.parseMapData(selDayMap); //获取每日录入数据 排序
        let title = dayInput.titleArray;
        let value = dayInput.valueArray;
        for (let i = 0; i < title.length; i++) {
            if(value[i].length == 0){//无值则不展示
                continue
            }
            let length = gridArray.length;
            gridArray[length] = [];
            gridArray[length].push(this.returnParams(0,0,'','every',title[i].name + "(" + title[i].units + ")",''))
            if(title[i].name == "血压"){
                for (let j = 0; j < value[i].length*2; j++) {
                    gridArray[length].push(this.returnParams(1 + j,0,6,'every borderR',value[i][j],'','血压'))
                }
            }else{
                for (let j = 0; j < value[i].length; j++) {
                    gridArray[length].push(this.returnParams(1 + j,0,6,'every borderR',value[i][j],''))
                }
            }
           
            gridArray[length].push(this.returnParams(value[i].length + 1,0,0,'every'))
        }
        return gridArray;
    }
    },
}
</script>
<style lang="less">
  @import '../assets/styles/app.less';
    
</style>


