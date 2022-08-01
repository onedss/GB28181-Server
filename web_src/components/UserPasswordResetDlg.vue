<template>
    <FormDlg title="重置密码" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('newPassword')}">
            <label for="new-password" class="col-sm-4 control-label">新密码
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="password" class="form-control" name="newPassword" v-model.trim="form.newPassword" autocomplete="new-password" data-vv-as="新密码" v-validate="'required'" @keydown.enter="onSubmit">
                <p class="help-block" style="margin-bottom:0;" v-show="form.newPassword">
                    <PasswordLine ref="pwd-line" :pwd="form.newPassword" @update:level="level = $event;"/>
                </p>
            </div>
        </div>
    </FormDlg>
</template>

<script>
import FormDlg from 'components/FormDlg.vue'
import $ from 'jquery'
import PasswordLine from 'components/PasswordLine.vue'

export default {
    props: {
        pwdLevel: {
            type: Number,
            default: 0,
        }
    },
    data() {
        return {
            form: this.defForm(),
            level: 0,
        }
    },
    components: {
        FormDlg, PasswordLine
    },
    methods: {
        defForm() {
            return {
                uid: '',
                newPassword: '',
            }
        },
        onHide() {
            this.form = this.defForm();
            this.level = 0;
        },
        onShow() {
            this.errors.clear();
            // this.$el.querySelector('#old-password').focus();
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
            if(this.level < this.pwdLevel) {
                this.$message({
                    type: 'error',
                    message: "密码强度不够",
                })
                return
            }
            $.get('/api/v1/user/resetpassword', {
                id: this.form.uid,
                password: this.form.newPassword
            }).then(data => {
                this.$refs['dlg'].hide();
                this.$message({
                    type: 'success',
                    message: "密码重置成功！"
                })
            })
        },
        show(id) {
            this.errors.clear();
            this.form.uid = id;
            this.$refs['dlg'].show();
        },
    }
}
</script>
