<template>
     <svg id="msvg" :style="{width:svgWidth , height:svgHeight}">
        <svg v-for="item in eventList" :key='item.pkey'>
            <!-- 入院等上方展示事件 -->
            <svg v-if="doCheckTopLabelText(item,item.eventType,item.label)">
                <text v-for='citem in item' :x='citem.x' :y='citem.y' :key='citem.key' :style='citem.style' 
                    :fill='citem.fill'>
                    {{citem.value}}
                </text>
            </svg>
            <!-- 体温不升等下方展示事件 -->
            <text  v-if="doCheckBotLabelText(item,item.eventType,item.label)" :x='item.x' :y='item.y' :key='item.key' :style='item.style' 
                :fill='item.fill'>
                {{item.value}}
            </text>
            <!-- 上下箭头展示 目前先不做，暂时保留 -->
            <!-- <line v-if="doCheckLabelLine(item.label)" :x1='item.x1' :y1='item.y1' :x2='item.x2' :y2='item.y2' 
                :key='item.key' :style='item.style' :fill='item.fill' :marker-end='item.markerEnd'>
            </line>
            <defs v-if="item.defs">
                <marker :id='item.defs.id' :markerWidth='item.defs.markerWidth' :markerHeight='item.defs.markerHeight' 
                    :refX='item.defs.refX' :refY='item.defs.refY' :orient='item.defs.orient'>
                    <path :d='item.defs.path.d' :style='item.defs.path.style'
                        :title='item.defs.path.title'/>
                </marker>
            </defs>   -->
        </svg>
        <!-- 中间点展示区域 -->
        <svg v-for="item in parseRePointList" :key='item.key'>
            <!-- 处理物理降温 -->
            <template v-if='item.plabel == "g"'> 
                <g :key='item.pkey' :name="item.name" :style='item.pstyle'>
                    <path :stroke-dasharray='item.strokeDasharray' :d='item.d'/>
                </g>
            </template>
            <!-- 处理温度/脉搏/心率展示 线颜色填充 -->
            <template v-if='item.plabel == ""'> 
                <path :key='item.key' :stroke='item.stroke' :stroke-width='item.strokeWidth' :fill='item.fill' :d='item.d'/>
            </template>
            <!-- 事件点标记 以及鼠标触摸提示 点颜色填充-->
             <template v-if='item.label == "circle"'>  
                 <g :class="item.pclassName" :key='item.pkey' v-tooltip='{content:item.ptitle,classes:"tooltipClass"}'>
                    <circle :cx='item.cx' :cy='item.cy' :r='item.r' :stroke-width='item.strokeWidth' :stroke='item.stroke' 
                    :fill='item.fill' :title='item.title'/>
                </g> 
             </template> 
            <!-- 绘制方行图标 -->
            <template v-if='item.label == "rect" && item.pLabel == "Tooltip"'> 
                <g :className="item.PClassName" :key='item.pKey' v-tooltip='{content:item.ptitle,classes:"tooltipClass"}'>
                    <rect :title='item.title' :x='item.x' :y='item.y' :width='item.width' :height='item.height'
                    :style='item.style'/>
                </g>
            </template>
            <!-- 处理line 与 polygon -->
             <template v-if='!checkDataType(item)'> 
                <g v-for="cItem in item" :key="cItem.id">
                    <template v-if='cItem.label == "polygon"'>
                        <polygon :key='cItem.key' :points='cItem.points' :style='cItem.style'/>
                    </template>
                    <template v-if='cItem.label == "line"'>
                        <line :type='cItem.type' :title='cItem.title' :x1="cItem.x1" :y1="cItem.y1" :x2="cItem.x2" :y2="cItem.y2"
                                :style='cItem.style'/>
                    </template>
                </g>
            </template>
            <!-- 处理 xx 标记 -->
                <template v-if='checkDataType(item)'> 
                    <g v-for="cItem in item" :key="cItem.pkey" :class='cItem.PClassName' v-tooltip='{content:cItem.pTitle,classes:"tooltipClass"}'>
                        <template v-if='cItem.label == "line" && cItem.ppLabel == "svg"  && cItem.plabel == "Tooltip"'>
                            <line :type='cItem.type' :title='cItem.title' :x1="cItem.x1" :y1="cItem.y1" :x2="cItem.x2" :y2="cItem.y2"
                                :style='cItem.style'/>
                        </template>
                    </g>
                </template>
        </svg>
    </svg> 
</template>

<script>
  import {mapMutations,mapGetters} from 'vuex'

export default {
    name:'svgCenter',
    props:['pointTime','curDate'],
    data(){
        return{
            svgWidth:0,
            svgHeight:0,
            selPointTime: "",//时间和事件
            selCueDate: "",//开始时间
            eventList:[],//定义事件列表
            parseRePointList:[],//折线list
            drawHzhxList:[],//
        }
    },
    computed: {
        ...mapGetters([
            'KDobj'
        ])
    },
    created(){
        this.selPointTime=this.pointTime;
        this.selCueDate=this.curDate;
        this.svgWidth = Number(this.KDobj.trHeight) * 42 + 'px';
        this.svgHeight = Number(this.KDobj.lastTr + 1) * Number(this.KDobj.trHeight) + 'px';
        this.drawEventMethod()
    },
    methods:{
        
        //画事件方法
        drawEventMethod(){
            //绘制文字事件
            this.eventList = this.drawEvent(this.selPointTime.eventDatas, this.selCueDate);
            //绘制折线图
            this.parseRePointList = this.parseRePoint(this.selPointTime, this.selCueDate);
        },
        //判断展示text标签方法
        doCheckTopLabelText(item,eventType,label){
            if(item instanceof Array){
                return true
            }
        },
        //判断展示text标签方法
        doCheckBotLabelText(item,eventType,label){
            if(item instanceof Object && eventType == 'botEvent' && label == 'text'){
                return true
            }
        },

        //判断展示line标签方法
        doCheckLabelLine(eventType,label){
            if(label == 'line'){
                return true
            }
        },
        //判断数据类型
        checkDataType(dataType){
            if(dataType instanceof Array && dataType[0]["ppKey"]){
                return true
            }else if(dataType instanceof Array && !dataType[0]["ppKey"] ){
                return false
            }
        },
    },
}
</script>

<style lang='less'>
  @import '../assets/styles/app.less';
  #msvg{
        float: right;
  }
  .tooltipClass{
      color:#ffffff;
      background: #000000;
      z-index: 999;
      border-radius: 5px;
      padding: 2px 8px;
      font-size: 14px;
  }
</style>


