<template>
    <svg id="svgLeft">
        <!-- 温度 -->
        <template  v-for="item in CalibrationlineWD">
            <line v-if="doCheckLabelLine(item.label,item.key)" :key="'wd'+item.y1" :max="item.max" :min="item.min" :type="item.type"
                :x1="item.x1" :y1="item.y1" :x2="item.x2" :y2="item.y2" :style="item.style"/>
            <text v-if="doCheckLabelText(item.label,item.value)" :key="item.y" :type="item.type"
                :x="item.x" :y="item.y" :style="item.style" :value="item.value" :fill="item.fill">
                {{item.value}}
            </text>
        </template>
        <!-- 脉搏 -->
        <template  v-for="item in CalibrationlineMB">
            <line v-if="doCheckLabelLine(item.label,item.key)" :id="'mb'+item.y1" :key="'mb'+item.y1" :max="item.max" :min="item.min" :type="item.type"
                :x1="item.x1" :y1="item.y1" :x2="item.x2" :y2="item.y2" :style="item.style"/>
            <text v-if="doCheckLabelText(item.label,item.value)" :key="item.value" :type="item.type"
                :x="item.x" :y="item.y" :style="item.style" :value="item.value" :fill="item.fill">
                {{item.value}}
            </text>
        </template>
    </svg>
</template>
<script>
  import {mapMutations,mapGetters} from 'vuex'
    export default {
        name:"svgLeft",
        props:[],
        data(){
            return{
                CalibrationlineWD:[],
                CalibrationlineMB:[],
            }
        },
        created(){
            console.log(this.KDobj)
            this.drawCalibrationline();
            
        },
        computed: {
            ...mapGetters([
                'KDobj'
            ])
        },
        methods:{
            /* 温度 刻度线 */
            drawCalibrationline(){
                let wdStartValue = Number(this.KDobj.wdStartValue);
                let wdEndValue   = Number(this.KDobj.wdEndValue);
                let disKDWD      = Number(this.KDobj.disKDWD);
                let trLittleCounts = Number(this.KDobj.trLittleCounts);
                let lastTr = Number(this.KDobj.lastTr);
                let mbStartValue = Number(this.KDobj.mbStartValue);
                let mbEndValue = Number(this.KDobj.mbEndValue);
                let disKDMB = Number(this.KDobj.disKDMB);
                this.CalibrationlineWD = this.drawSvgScale({
                    markName: "wd",
                    x: "1",
                    stepSide: true,
                    valueShow: true,
                    beginKD: wdStartValue,
                    endKD: wdEndValue,
                    width: 10,
                    disKD: disKDWD,
                    trRowBegin: trLittleCounts,
                    trRowEnd: lastTr,
                    isShowdemarcate: false,
                }).scaleArray;
                /* 脉博 刻度线 */
                this.CalibrationlineMB = this.drawSvgScale({
                    markName: "mb",
                    x: "0.5",
                    beginKD: mbStartValue,
                    endKD: mbEndValue,
                    width: 10,
                    disKD: disKDMB,
                    trRowBegin: trLittleCounts,
                    trRowEnd: lastTr,
                    stepSide: true,
                    valueShow: true,
                    isShowdemarcate: true,
                    // martchs: "104-95,15-40",
                }).scaleArray;
            },
            doCheckLabelLine(label,val){
                if(label == 'line'){ 
                    return true
                }else{
                    return false
                }
            },
            doCheckLabelText(label,val){
                let wdEndValue = Number(this.KDobj.wdEndValue);
                let mbEndValue = Number(this.KDobj.mbEndValue);
                let trLittleCounts = Number(this.KDobj.trLittleCounts);
                if( trLittleCounts == 0){
                    if(label == 'text' && val !== wdEndValue && val !== mbEndValue ){
                        return true
                    }else{
                        return false
                    }
                }else if(label == 'text'){
                    return true
                }
            },
        },
    }
</script>
<style lang="less" scoped>
  @import '../assets/styles/app.less';
</style>

