<template>
  <div>
     <temperatureChart :params="params"/>
  </div>
</template>

<script>
  import temperatureChart from './temperatureChart.vue'
  import {mapMutations, mapGetters} from 'vuex'
  export default {
    name: 'temperature',
    data () {
      return {
        KDobj:{
          trLines:'',//一刻度对应是行数
          lastTr:'',//最后一行TR数
          trLittleCounts:0,//是否有小数
          beginTime:2,//时间开始偏移量 1 - 5 - 9 / 2 - 6 - 10
          wdStartValue:'',//温度开始值
          wdEndValue:'',//温度结束值
          disKDWD:'',//温度刻度差
          mbStartValue:'',//脉搏开始值
          mbEndValue:'',//脉搏结束值
          disKDMB:'',//脉搏刻度差
          trHeight:15,//tr高度 
        },//刻度配置项
        data: "",
        hospital:"北京市博仁医院体温单",
        beginDate: "2017-06-28",
        patientList: {
            name: "胡八一", //姓名
            sex: "男", //性别
            age: "40", //年龄
            admissionDateTime: "2017-06-28", //入院时间
            endemicName: "骨科", //科室
            bedNo: "123", //床号
            inpNo: "Z23456", //住院号
            medicalHao: "Z23456" //病案号
        },
        //住院天数
        dayList: ['1', '2', '3', '4', '5', '6', '7'], 
        //手术天数
        dayOps: ['1', '2', '3', '4', '5', '6', '7'], 
        breathingList: [
            '75', '', '65', '66', '56', '60', '70', '60', 
        '70', '65', '66', '56', '65', '', '60', '70', '65', '66', '56', 
        '60', '70', '60', '70', '65', '66', '56', '60', '70', '60', '70', 
        '65', '66', '56', '60', '70', '60', '70', '65', '66', '56', '60', '70'
        ], 
        dayMap: {//每日录入信息
            "{name:'血压',units:'mmHg'}": ["110/120", "82/120", "100/120","","110/120","110/120","110/120" ],
            "{name:'入量',units:'ml'}": ["41", "40.5", "41", "42", "42", "44", "43"],
            "{name:'出量',units:'ml'}":  ["41", "40.5", "41", "42", "42", "44", "43"],
            "{name:'db次数',units:'g'}": ["80", "80.5", "80.5", "80.2", "81", "81.5", "81"],
            "{name:'体重',units:'KG'}": ["80", "80.5", "80.5", "80.2", "81", "81.5", "81"],
            "{name:'身高',units:'cm'}": ["180","","","","","","", ],
        }, 
        pointTime: {//时间和事件
            "tt": [{"dataTime": "2017-06-29 02:00:00", "value": "9"}, 
                    {"dataTime": "2017-06-29 06:00:00", "value": "8"}, 
                    {"dataTime": "2017-06-29 10:00:00", "value": "7"}],
            "xl": [{
                "dataTime": "2017-06-28 02:00:00",
                "date": "2017-06-28",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "88",
                "xlValue": ""
            },{
                "dataTime": "2017-06-28 10:00:00",
                "date": "2017-06-28",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "95",
                "xlValue": ""
            },{
                "dataTime": "2017-06-29 02:00:00",
                "date": "2017-06-29",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "88",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 06:00:00",
                "date": "2017-06-29",
                "hour": 6,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "90",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 14:00:00",
                "date": "2017-06-29",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "88",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 18:00:00",
                "date": "2017-06-29",
                "hour": 18,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 22:00:00",
                "date": "2017-06-29",
                "hour": 22,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "90",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-30 04:00:00",
                "date": "2017-06-30",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "100",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-30 22:00:00",
                "date": "2017-06-30",
                "hour": 22,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "101",
                "xlValue": ""
            },{
                "dataTime": "2017-07-01 02:00:00",
                "date": "2017-07-01",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "100",
                "xlValue": ""
            },{
                "dataTime": "2017-07-01 10:00:00",
                "date": "2017-07-01",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "101",
                "xlValue": ""
            }],
            "mb": [{
                "dataTime": "2017-06-28 02:00:00",
                "date": "2017-06-28",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            },{
                "dataTime": "2017-06-28 10:00:00",
                "date": "2017-06-28",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "100",
                "xlValue": ""
            },{
                "dataTime": "2017-06-29 02:00:00",
                "date": "2017-06-29",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 06:00:00",
                "date": "2017-06-29",
                "hour": 6,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "80",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 14:00:00",
                "date": "2017-06-29",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "100",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 18:00:00",
                "date": "2017-06-29",
                "hour": 18,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 22:00:00",
                "date": "2017-06-29",
                "hour": 22,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "105",
                "xlValue": ""
            },{
                "dataTime": "2017-06-30 02:00:00",
                "date": "2017-06-30",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            },{
                "dataTime": "2017-06-30 10:00:00",
                "date": "2017-06-30",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "103",
                "xlValue": ""
            },{
                "dataTime": "2017-07-01 02:00:00",
                "date": "2017-07-01",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "95",
                "xlValue": ""
            },{
                "dataTime": "2017-07-01 10:00:00",
                "date": "2017-07-01",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "98",
                "xlValue": ""
            }],
            //此数据需要按时间排序
            "eventDatas": [
            {
                "dataTime": "2017-06-30 14:00:00",
                "date": "2017-06-30",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "心跳停止",
                "xlValue": ""
            }, 
            // {
            //     "dataTime": "2017-06-29 10:00:00",
            //     "date": "2017-06-29",
            //     "hour": 10,
            //     "mbValue": "",
            //     "phValue": "",
            //     "type": "", 
            //     "value": "请假",
            //     "xlValue": ""
            // },
             {
                "dataTime": "2017-06-30 06:00:00",
                "date": "2017-06-30",
                "hour": 6,
                "mbValue": "",
                "phValue": "",
                "type": "break",
                "value": "不升",
                "xlValue": ""
            }, 
             {
                "dataTime": "2017-06-30 14:00:00",
                "date": "2017-06-30",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "break",
                "value": "请假",
                "xlValue": ""
            },
            {
                "dataTime": "2017-06-29 02:00:00",
                "date": "2017-06-29",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "入院",
                "xlValue": ""
            }, 
            // {
            //     "dataTime": "2017-06-29 14:00:00",
            //     "date": "2017-06-29",
            //     "hour": 14,
            //     "mbValue": "",
            //     "phValue": "",
            //     "type": "",
            //     "value": "开呼吸机",
            //     "xlValue": ""
            // }, 
            // {
            //     "dataTime": "2017-06-29 22:00:00",
            //     "date": "2017-06-29",
            //     "hour": 22,
            //     "mbValue": "",
            //     "phValue": "",
            //     "type": "",
            //     "value": "关呼吸机",
            //     "xlValue": ""
            // }
            ],
            "wd": [{
                "dataTime": "2017-06-28 02:00:00",
                "date": "2017-06-28",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "kw",
                "value": "36.5",
                "xlValue": ""
            },{
                "dataTime": "2017-06-28 10:00:00",
                "date": "2017-06-28",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "gw",
                "value": "36.5",
                "xlValue": ""
            },{
                "dataTime": "2017-06-29 02:00:00",
                "date": "2017-06-29",
                "hour": 2,
                "mbValue": "",
                "phValue": "36.5",
                "type": "gw",
                "value": "37.2",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 06:00:00",
                "date": "2017-06-29",
                "hour": 6,
                "mbValue": "",
                "phValue": "",
                "type": "yw",
                "value": "37",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 14:00:00",
                "date": "2017-06-29",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "gw",
                "value": "37.5",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 18:00:00",
                "date": "2017-06-29",
                "hour": 18,
                "mbValue": "",
                "phValue": "",
                "type": "kw",
                "value": "37.4",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 22:00:00",
                "date": "2017-06-29",
                "hour": 22,
                "mbValue": "",
                "phValue": "",
                "type": "kw",
                "value": "36.8",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-30 02:00:00",
                "date": "2017-06-30",
                "hour": 2,
                "mbValue": "",
                "phValue": "",
                "type": "kw",
                "value": "37",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-30 10:00:00",
                "date": "2017-06-30",
                "hour": 10,
                "mbValue": "",
                "phValue": "",
                "type": "kw",
                "value": "37.8",
                "xlValue": ""
            }, 
            // {
            //     "dataTime": "2017-06-30 22:00:00",
            //     "date": "2017-06-30",
            //     "hour": 22,
            //     "mbValue": "",
            //     "phValue": "",
            //     "type": "kw",
            //     "value": "36.8",
            //     "xlValue": ""
            // }
            ],
            "hzfx": [{
                "dataTime": "2017-06-29 14:00:00",
                "date": "2017-06-29",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "66",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 18:00:00",
                "date": "2017-06-29",
                "hour": 18,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "66",
                "xlValue": ""
            }],
            "respiratorDatas": [{
                "dataTime": "2017-06-29 14:00:00",
                "date": "2017-06-29",
                "hour": 14,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "66",
                "xlValue": ""
            }, {
                "dataTime": "2017-06-29 18:00:00",
                "date": "2017-06-29",
                "hour": 18,
                "mbValue": "",
                "phValue": "",
                "type": "",
                "value": "66",
                "xlValue": ""
            }]
        },// 时间段录入信息
        loading: false,
        params:{}//将数据封装为对象传给子组件
      }
    },
    components: {
        temperatureChart,
    },
    created(){
      this.params = {
        data:this.data,
        beginDate:this.beginDate,
        patientList:this.patientList,
        dayOps:this.dayOps,
        breathingList:this.breathingList,
        dayList:this.dayList,
        dayMap:this.dayMap,
        pointTime:this.pointTime,
        hospital:this.hospital,
      }
      // this.getPatientInfo();
      this.getInfo();
    },
    methods:{
      ...mapMutations({
        setKDlimit: 'SET_KDLIMIT'
      }),
      getInfo(){
          //模拟数据
        let obj = {
          trLines:'5',
          lastTr:'',
          trLittleCounts:0,
          beginTime:1,
          wdStartValue:'34',
          wdEndValue:'42',
          disKDWD:'1',
          mbStartValue:'20',
          mbEndValue:'180',
          disKDMB:'20',
          trHeight:15,
        }
        //判断温度差是否有小数
        let trLittleCounts = 0;
        if(String(obj.wdEndValue).indexOf(".") > 0){
            if(obj.trLines == '5'){
                trLittleCounts =  String(obj.wdEndValue).split('.')[1] / 2;
            }else if(obj.trLines == '10'){
                trLittleCounts =  String(obj.wdEndValue).split('.')[1];
            }
            obj.wdEndValue = String(obj.wdEndValue).split('.')[0]
            let WDDisKD = (obj.wdEndValue - obj.wdStartValue)/Number(obj.disKDWD);
            obj.wdEndValue = Number(obj.wdEndValue);
            obj.lastTr = WDDisKD * obj.trLines + Number(trLittleCounts);
        }else{
            let WDDisKD = (obj.wdEndValue - obj.wdStartValue)/Number(obj.disKDWD);
            obj.lastTr = WDDisKD * obj.trLines + Number(trLittleCounts);
        }
        obj.trLittleCounts = trLittleCounts;
        obj.mbEndValue = Number(obj.mbEndValue);
        this.KDobj = obj;
        this.setKDlimit(this.KDobj);
      },
      //请求患者体温单数据
      getPatientInfo(){
        return;
        this.$axios.get('',{
            patientId: data.patientId,
            visitId: data.clinicNo,
            hspCode: data.hspCode,
            timeType: 4,
            time: beginDate
        }).then(res => {
          if(res.success){
            this.patientList = res.patientList || {};
            this.beginDate = res.beginDay;
            this.dayOps = res.dayOps || [];
            this.dayList = res.dayList || [];
            this.breathingList = res.breathingList || [];
            this.dayMap = res.dayMap || {};
            this.pointTime = res.pointTime || {};
          }else{
            console.log(res)
          }
        }).catch(res => {
          console.log(res)
        })
      },
      //子组件点击分页
      changeBeginDay(){
        if (newDate !== oldDate) {
            let {data} = this.state;
            this.getPatientInfo(data, newDate);
        }
    }
    },
  }
</script>

<style lang="less" scoped>
  @import '../assets/styles/app.less';
</style>
