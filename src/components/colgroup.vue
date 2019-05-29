<template>
   <colgroup >
        <col v-for="item in createColgroup" :key="item.index" :width="item.width"/>
   </colgroup >
</template>

<script>
import {mapMutations, mapGetters} from 'vuex'
export default {
    name:"myColgroup",
    data(){
        return{
            createColgroup:[],
        }
    },
    created(){
        this.createColgroup = this.doEachWidth();
    },
    computed: {
        ...mapGetters([
            'KDobj'
        ])
    },
    methods:{
        doEachWidth(){
            let colArray = [];
            for (let i = 0; i < 43; i++) {
                let width = this.KDobj.trHeight;
                if (i === 0) {
                    width = 100;
                } else if (i === 43) {
                    width = 60;
                }
                let params = {
                    width:width,
                    index:i
                }
                colArray.push(params);
            }
            return colArray;
        }
    }
}
</script>
<style>

</style>


