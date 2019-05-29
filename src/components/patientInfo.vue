<template>
<div class='hospitalTitle'>
    <p class="hospitalName">{{selHospital}}</p>
    <!-- <p class="tempTitle">体温表</p> -->
    <div class="patinfoDiv">
        <p>姓名：{{selPatientList.name}}</p>
        <p>年龄：{{selPatientList.age}}</p>
        <p>性别：{{selPatientList.sex}}</p>
        <p>科别：{{selPatientList.endemicName}}</p>
        <p>床号：{{selPatientList.bedNo}}</p>
        <p>入院日期:{{selPatientList.admissionDateTime}}</p>
        <p>住院号:{{selPatientList.inpNo}}</p>
    </div>
</div>
</template>
<script>
export default {
    name:"patientinfo",
    props:["hospital","patientList"],
    data(){
        return{
            selHospital:"",
            selPatientList:[],
        }
    },
    created(){
        this.selHospital = this.hospital;
        this.selPatientList = this.patientList;
    },
    methods:{

    },
}
</script>
<style lang="less">
  @import '../assets/styles/app.less';
    .hospitalName{
        text-align: center;
        font-size: 20px;
        margin-bottom: 20px;
    }
    .tempTitle{
        text-align: center;
        font-size: 16px;
    }
    .patinfoDiv{
        margin-bottom: 10px;
        overflow: hidden;
        p{
            margin: 0 20px 0 0;
            font-size:14px;
            float: left;
            padding: 0;
            max-width: 180px;
            overflow: hidden;
            white-space:nowrap;
            text-overflow:ellipsis;
        }
    }
  
</style>


