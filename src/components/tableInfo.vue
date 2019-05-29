<template>
     <tbody class="tableInfoTbody">
            <tr id="dateTR">
                <td>日期</td>
                <td v-for="item in daysArray" :key="item.id" :colSpan="6" >{{item}}</td>
            </tr>
            <tr id="hospDaysTr">
                <td>住院日数</td>
                <td v-for="item in dayList" :key="item.id" colSpan="6" >{{item}}</td>
            </tr>
            <tr id="operaDaysTr">
                <td>手术后天数</td>
                <td v-for="item in dayOps" :key="item.id" colSpan="6" >{{item}}</td>
            </tr>
            <tr id="timeTr">
                <td>时间</td>
                <td v-for="item in timesArray" :key="item.id" :class="item.border">{{item.num}}</td>
            </tr>
            </tbody>
</template>

<script>
import {mapMutations, mapGetters} from 'vuex'

export default {
    name:'tableInfo',
    props:['beginDate','dayOps','dayList'],
    data(){
        return{
            selBeginDate:'',
            selDayOps:[],
            selDayList:[],
            daysArray:[],//
            timesArray:[],//
        }
    },
    computed: {
            ...mapGetters([
                'KDobj'
            ])
        },
    created(){
        this.selBeginDate=this.beginDate;
        this.selDayOps=this.dayOps;
        this.selDayList=this.dayList;
        this.daysArray = this.getDaysArray(this.beginDate);
        this.timesArray = this.getTimes();
    },
    methods:{
        // @method getDaysArray 生成显示天数
        // @param {String} beginDate 开始时间
        getDaysArray(beginDate) {
            const showDays = 7;
            //根据当前日期和显示天数生成日期数组
            let daysArray = [];
            let years = []; //定义跨年数据
            let monthes = []; //定义跨月数据
            for ( let i = 0; i < showDays; i++ ) {
                let newDate = this.getNewDate(beginDate, i);
                let newARR = newDate.split('-')
                years.push(newARR[0]);
                monthes.push(newARR[1]);
                if( i == 0 ){
                    daysArray.push(newDate);
                }else{
                    //跨年处理
                    if( years[i] !== years[i-1] ){
                        daysArray.push(newDate);
                    }else{
                        //跨月处理
                        if( monthes[i] !== monthes[i-1] ){
                            let monDys = String(newARR[1]) + '-' + String(newARR[2])
                            daysArray.push(monDys)
                        }else{
                            daysArray.push(newARR[2]);
                        }
                    }
                }
            }
            return daysArray;
        },
        // @method getTimes 生成每天的时刻 2-6-10-14-18-22
        getTimes(){
            //生成timesArray
            let timesArray = [];
            let beginTime = Number(this.KDobj.beginTime) == 0 ? 2 : 3 ; 
            // 2 - 6 - 10 - 14 - 18 - 22 
            // 1 - 5 - 9 - 13 - 17 - 21 
            for ( let i = 0; i < 42; i++ ) {
                let num = beginTime + (i % 6) * 4;
                let params = {
                    border:'',
                    num:'',
                    index:'',
                }
                params.border = "";
                params.num = num;
                params.index = i;
                if (num === 22) {
                    params.border = "borderR"
                }
                timesArray.push(params);
            }
            return timesArray;
        },
  
    },
}
</script>
<style lang="less">
  @import '../assets/styles/app.less';

  .tableInfoTbody tr td:last-child{
      border-right: 1px solid #333;
  }
</style>


