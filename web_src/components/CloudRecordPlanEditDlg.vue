<template>
<FormDlg title="编辑录像计划" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()" size="modal-lgg" tabindex="">
    <input type="hidden" name="ID" v-model.trim="form.ID">
    <div class="col-md-12">
        <div :class="{'form-group':true, 'has-error': errors.has('Name')}">
            <label for="name" class="col-sm-2 control-label">名称
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-9">
                <input type="text" class="form-control" id="name" name="Name" v-model.trim="form.Name" data-vv-as="名称" v-validate="'required'" @keydown.enter.prevent>
            </div>
        </div>

        <div :class="{'form-group':true, 'has-error': errors.has('Enable')}">
            <label class="col-sm-2 control-label">状态
            </label>
            <div class="col-sm-9 checkbox">
                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.Enable" name="Enable">
                    启用&nbsp;&nbsp;
                </el-checkbox>
            </div>
        </div>
        <div :class="{'form-group':true}">
            <label for="name" class="col-sm-2 control-label">录像计划详情
                <!-- <span class="text-red">*</span> -->
            </label>
            <div class="col-sm-9">
                <CloudRecordPlan ref="recordPlan"></CloudRecordPlan>
            </div>
        </div>
    </div>
    <div class="clearfix"></div>
</FormDlg>
</template>

<script>
import FormDlg from 'components/FormDlg.vue'
import CloudRecordPlan from 'components/CloudRecordPlan.vue'
import $ from 'jquery'

export default {
    data() {
        return {
            form: this.defForm()
        }
    },
    components: {
        FormDlg,
        CloudRecordPlan
    },
    methods: {
        defForm() {
            return {
                ID: "",
                Name: "",
                Enable: false,
                Plan: "",
            }
        },
        onHide() {
            this.form = this.defForm();
        },
        onShow() {
            this.errors.clear();
            this.$refs["recordPlan"].init(this.form.Plan);
        },
        async onSubmit() {
            var ok = await this.$validator.validateAll();
            if (!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: 'error',
                    message: e.msg
                })
                $(`[name=${e.field}]`).focus();
                return;
            }
            $.post('/api/v1/cloudrecord/plan/save', {
                ID: this.form.ID,
                Name: this.form.Name,
                Plan: this.$refs["recordPlan"].getplan(),
                Enable: this.form.Enable,
            }).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if (data) {
                Object.assign(this.form, data);
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>

<style lang="less" scoped>
.model-lg {
    width: 80% !important;
}
#name {
    max-width: 800px;
}
</style>
