<template>
    <FormatProgress text-inside :stroke-width="height"
        :percentage="percentage" :status="status" :format="format">
    </FormatProgress>
</template>

<script>
import FormatProgress from 'components/FormatProgress.vue'

export default {
    props: {
        pwd: {
            type: String,
            default: "",
        },
        height: {
            type: Number,
            default: 18,
        }
    },
    components: {
        FormatProgress
    },
    computed: {
        level() {
            var l = 0;
            if(!this.pwd) return l;
            if(this.pwd.length >= 1) l++;
            if(this.pwd.length >= 4) l++;
            if(this.pwd.length >= 6) {
                if(/\d/.test(this.pwd)) l++; // 数字
                if(/[a-z]/.test(this.pwd)) l++; // 小写
                if(/[A-Z]/.test(this.pwd)) l++; // 大写
                if(/\W/.test(this.pwd)) l++; // 特殊字符
                if(!/(\w)\1/.test(this.pwd)) l++; //连续字符
            }
            if(this.pwd.length >= 8) l++;
            if(this.pwd.length >= 12) l++;
            this.$emit("update:level", l);
            return l;
        },
        status() {
            if(this.percentage >= 90) {
                return "success";
            }
            if(this.percentage >= 50) {
                return "warning";
            }
            return "exception";
        },
        percentage() {
            var ret = this.level * 15;
            if(ret < 0) ret = 0;
            if(ret > 100) ret = 100;
            return ret;
        }
    },
    methods: {
        format(percentage) {
            if(percentage >= 90) {
                return "强";
            }
            if(percentage >= 50) {
                return "中";
            }
            return "弱";
        }
    }
}
</script>
