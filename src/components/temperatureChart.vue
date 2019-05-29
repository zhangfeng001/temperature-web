<template>
  <div class="temperature-chart" id="temperature-chart">
    <PatientInfo :hospital="hospital" :patientList="patientList"/>
    <div class="tempCartSvg">
         <!-- 病人信息组件  -->
        <div class="fixed_div">
            <!-- <PatientInfo :hospital="hospital" :patientList="patientList"/> -->
        </div>
        <div class="flow_div">
             <!-- 日期 住院天数展示  -->
            <table class="showInfo">
                <Colgroup/>
                <TableInfo :beginDate="beginDate" :dayOps="dayOps" :dayList="dayList"/>
            </table> 
             <!-- 中间主内容区域 -->
            <div class="svgCenter">
                <SvgCenter :pointTime="pointTime" :curDate="beginDate"/>
            </div>
            <!-- 背景区域  -->
            <table class="tableSvg">
                <Colgroup/>
                <GridTable :breathingList="breathingList" :dayMap="dayMap"/>
            </table>
        </div>
    </div>
  </div>
</template>

<script>
  import GridTable from "./gridTable";
  import Colgroup from "./colgroup";
  import PatientInfo from "./patientInfo";
  import TableInfo from "./tableInfo";
  import SvgCenter from "./svgCenter";
  export default {
    name: 'temperatureChart',
    props:['params'],
    data () {
      return {
        beginDate: this.params.beginDate, //开始时间
        hospital: this.params.hospital, //医院
        patientList: this.params.patientList, //患者信息
        dayOps: this.params.dayOps, //术后/产后天数
        breathingList: this.params.breathingList, //呼吸次数
        dayList: this.params.dayList, //住院天数
        dayMap: this.params.dayMap, //每日录入信息
        pointTime: this.params.pointTime, // 时间段录入信息
        msg: 'this is temperatureChart.vue'
      }
    },
    components: {
        GridTable,
        Colgroup,
        PatientInfo,
        TableInfo,
        SvgCenter,
    },
    created(){
    },
    methods:{

    },
  }
</script>

<style lang="less" scoped>
  @import '../assets/styles/app.less';

</style>
