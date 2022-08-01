<template>
    <FormDlg title="导出通道列表" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true}" v-if="devid">
            <div class="col-sm-12 checkbox text-center">
                <el-checkbox style="margin-left:-19px;margin-top:-5px;" v-model.trim="downloadThisDev">
                    只导出当前设备({{devid}})的通道
                </el-checkbox>
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('start')}" v-show="showPage">
            <label for="input-start" class="col-sm-3 control-label">开始
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-start" name="start" v-model.trim="start" data-vv-as="开始" v-validate="'numeric|min_value:0'">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('limit')}" v-show="showPage">
            <label for="input-limit" class="col-sm-3 control-label">上限
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-limit" name="limit" v-model.trim="limit" data-vv-as="上限" v-validate="'numeric|min_value:100'">
            </div>
        </div>
    </FormDlg>
</template>

<script>
import FormDlg from 'components/FormDlg.vue'
import $ from 'jquery'

export default {
    data() {
        return {
            ctrl: false,
            alt: false,
            devid: '',
            start: 0,
            limit: 10000,
            downloadThisDev: false,
        }
    },
    components: {
        FormDlg
    },
    beforeDestroy() {
        $(this.$el).off("keydown", this.keyDown).off("keyup", this.keyUp);
    },
    computed: {
        showPage() {
            return (this.ctrl && this.alt) || this.start || this.limit != 10000;
        },
        downloadURL() {
            if(this.downloadThisDev && this.devid) {
                return `/api/v1/channel/export?serial=${this.devid}&start=${this.start}&limit=${this.limit}`;
            }
            return `/api/v1/channel/export?start=${this.start}&limit=${this.limit}`
        }
    },
    methods: {
        onHide() {
            this.ctrl = false;
            this.alt = false;
            this.devid = '';
            this.downloadThisDev = false;
            this.start = 0;
            this.limit = 10000;
            this.$emit("hide");
            $(this.$el).off("keydown", this.keyDown).off("keyup", this.keyUp);
        },
        onShow() {
            this.errors.clear();
            this.$emit("show");
            $(this.$el).on("keydown", this.keyDown).on("keyup", this.keyUp);
        },
        keyDown(e) {
            if(e.keyCode == 17) {
                this.ctrl = true;
            }
            if(e.keyCode == 18) {
                this.alt = true;
            }
        },
        keyUp(e) {
            // if(e.keyCode == 17) {
            //     this.ctrl = false;
            // }
            // if(e.keyCode == 18) {
            //     this.alt = false;
            // }
        },
        async onSubmit() {
            var ok = await this.$validator.validateAll();
            if(!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: 'error',
                    message: e.msg
                })
                $(`[name=${e.field}]`).focus();
                return;
            }
            window.open(this.downloadURL);
            this.$refs['dlg'].hide();
            this.$emit("submit");
        },
        show(devid) {
            this.errors.clear();
            this.devid = devid;
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
