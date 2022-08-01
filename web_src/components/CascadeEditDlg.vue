<template>
    <FormDlg title="编辑上级平台级联" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()" size="modal-lgg">
        <input type="hidden" name="ID" v-model.trim="form.ID">
        <div class="col-md-6">
            <div :class="{'form-group':true, 'has-error': errors.has('Name')}">
                <label for="name" class="col-sm-4 control-label">名称
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="name" name="Name" v-model.trim="form.Name" data-vv-as="名称" v-validate="'required'" @keydown.enter="$el.querySelector('#serial').focus()">
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('Serial')}">
                <label for="serial" class="col-sm-4 control-label">SIP服务ID
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="serial" name="Serial" v-model.trim="form.Serial" data-vv-as="SIP服务ID" v-validate="'required'" @keydown.enter="$el.querySelector('#realm').focus()">
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('Realm')}">
                <label for="realm" class="col-sm-4 control-label">SIP服务域
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="realm" name="Realm" v-model.trim="form.Realm" data-vv-as="SIP服务域" v-validate="" placeholder="选填" @keydown.enter="$el.querySelector('#host').focus()">
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('Host')}">
                <label for="host" class="col-sm-4 control-label">SIP服务IP
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="host" name="Host" v-model.trim="form.Host" data-vv-as="SIP服务IP" v-validate="'required'" @keydown.enter="$el.querySelector('#port').focus()">
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('Port')}">
                <label for="port" class="col-sm-4 control-label">SIP服务端口
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="port" name="Port" v-model.trim="form.Port" data-vv-as="SIP服务端口" v-validate="'required|numeric'" @keydown.enter="$el.querySelector('#local-serial').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('LocalSerial')}">
                <label for="local-serial" class="col-sm-4 control-label">设备国标编号
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="local-serial" name="LocalSerial" v-model.trim="form.LocalSerial" data-vv-as="设备国标编号" v-validate="" placeholder="默认使用 livecms.ini > sip > serial" @keydown.enter="$el.querySelector('#local-host').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('LocalHost')}">
                <label for="local-host" class="col-sm-4 control-label">本地IP
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="local-host" name="LocalHost" v-model.trim="form.LocalHost" data-vv-as="本地IP" v-validate="" placeholder="默认使用 livecms.ini > sip > host" @keydown.enter="$el.querySelector('#local-port').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('LocalPort')}">
                <label for="local-port" class="col-sm-4 control-label">本地端口
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="local-port" name="LocalPort" v-model.trim="form.LocalPort" data-vv-as="本地端口" v-validate="'numeric'" placeholder="选填" @keydown.enter="$el.querySelector('#username').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('DigestAlgorithm')}" v-show="(ctrl && alt) || showDigestAlgorithm">
                <label for="digest-algorithm" class="col-sm-4 control-label">摘要算法
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <select class="form-control" id="digest-algorithm" name="DigestAlgorithm" v-model.trim="form.DigestAlgorithm" data-vv-as="摘要算法" v-validate="">
                        <option value="">MD5</option>
                        <!-- <option value="MD5">MD5</option> -->
                        <option value="SHA-256">SHA-256</option>
                        <option value="SHA-1">SHA-1</option>
                    </select>
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('StreamKeepalive')}">
                <label class="col-sm-4 control-label">其它选项
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7 checkbox">
                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.Enable" name="Enable">
                        启用&nbsp;&nbsp;
                    </el-checkbox>
                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.AllowControl" name="AllowControl">
                        允许云台控制&nbsp;&nbsp;
                    </el-checkbox>
                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.StreamKeepalive" name="StreamKeepalive" title="开启RTCP流保活可防止产生野流">
                        RTCP 流保活
                    </el-checkbox>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div :class="{'form-group': true, 'has-error': errors.has('Username')}">
                <label for="username" class="col-sm-4 control-label">SIP认证用户名
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="username" name="Username" v-model.trim="form.Username" data-vv-as="SIP认证用户名" v-validate="" placeholder="默认使用 设备国标编号" @keydown.enter="$el.querySelector('#password').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('Password')}">
                <label for="password" class="col-sm-4 control-label">SIP认证密码
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="password" name="Password" v-model.trim="form.Password" data-vv-as="SIP认证密码" v-validate="" @keydown.enter="$el.querySelector('#register-interval').focus()">
                </div>
            </div>
            <!-- <div :class="{'form-group': true, 'has-error': errors.has('RegisterTimeout')}">
                <label for="register-timeout" class="col-sm-4 control-label">注册有效期(秒)
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="register-timeout" name="RegisterTimeout" v-model.trim="form.RegisterTimeout" data-vv-as="注册有效期" v-validate="'required|numeric'" @keydown.enter="$el.querySelector('#register-interval').focus()">
                </div>
            </div> -->
            <div :class="{'form-group': true, 'has-error': errors.has('RegisterInterval')}">
                <label for="register-interval" class="col-sm-4 control-label">注册周期(秒)
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="register-interval" name="RegisterInterval" v-model.trim="form.RegisterInterval" data-vv-as="注册周期" v-validate="'required|numeric'" @keydown.enter="$el.querySelector('#keepalive-interval').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('KeepaliveInterval')}">
                <label for="keepalive-interval" class="col-sm-4 control-label">心跳周期(秒)
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="keepalive-interval" name="KeepaliveInterval" v-model.trim="form.KeepaliveInterval" data-vv-as="心跳周期" v-validate="'required|numeric'" @keydown.enter="$el.querySelector('#load-limit').focus()">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('LoadLimit')}">
                <label for="load-limit" class="col-sm-4 control-label">流并发数限制
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7">
                    <input type="text" class="form-control" id="load-limit" name="LoadLimit" v-model.trim="form.LoadLimit" data-vv-as="流并发数限制" v-validate="'numeric'" placeholder="选填" @keydown.enter="onSubmit">
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('CatalogGroupSize')}">
                <label for="catalog-group-size" class="col-sm-4 control-label">目录分组大小
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <select class="form-control" id="catalog-group-size" name="CatalogGroupSize" v-model.trim="form.CatalogGroupSize" data-vv-as="目录分组大小" v-validate="">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="8">8</option>
                    </select>
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('CivilCodeLimit')}" v-show="(ctrl && alt) || showCivilCodeLimit">
                <label for="civil-code-limit" class="col-sm-4 control-label">行政区划长
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <select class="form-control" id="civil-code-limit" name="CivilCodeLimit" v-model.trim="form.CivilCodeLimit" data-vv-as="行政区划长" v-validate="">
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="20">20</option>
                    </select>
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('CommandTransport')}">
                <label for="command-transport" class="col-sm-4 control-label">信令传输
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <select class="form-control" id="command-transport" name="CommandTransport" v-model.trim="form.CommandTransport" data-vv-as="信令传输" v-validate="">
                        <option value="UDP">UDP</option>
                        <option value="TCP">TCP</option>
                    </select>
                </div>
            </div>
            <div :class="{'form-group': true, 'has-error': errors.has('Charset')}">
                <label for="charset" class="col-sm-4 control-label">字符集
                    <span class="text-red">*</span>
                </label>
                <div class="col-sm-7">
                    <select class="form-control" id="charset" name="Charset" v-model.trim="form.Charset" data-vv-as="字符集" v-validate="">
                        <option value="GB2312">GB2312</option>
                        <option value="UTF-8">UTF-8</option>
                    </select>
                </div>
            </div>
            <div :class="{'form-group':true, 'has-error': errors.has('StreamReader')}">
                <label class="col-sm-4 control-label">
                    <!-- <span class="text-red">*</span> -->
                </label>
                <div class="col-sm-7 checkbox">
                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.StreamReader" name="StreamReader">
                        强制推送H264编码&nbsp;&nbsp;
                    </el-checkbox>
                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.BindLocalIP" name="BindLocalIP" v-show="form.LocalHost">
                        绑定本地IP&nbsp;&nbsp;
                    </el-checkbox>
                </div>
            </div>
        </div>
        <div class="clearfix"></div>

        <template slot="footer">
            <div class="inline text-orange" v-if="alertMsg">
                <small>
                    <strong><i class="fa fa-info-circle"></i> 提示 : &nbsp;&nbsp;</strong>
                    {{alertMsg}}
                    &nbsp;&nbsp;
                </small>
            </div>
        </template>
    </FormDlg>
</template>

<script>
import FormDlg from 'components/FormDlg.vue'
import $ from 'jquery'

export default {
    data() {
        return {
            form: this.defForm(),
            ctrl: false,
            alt: false,
            showCivilCodeLimit: false,
            showDigestAlgorithm: false,
        }
    },
    components: {
        FormDlg
    },
    computed: {
        alertMsg() {
            var list = [];
            if(this.form.StreamKeepalive) {
                list.push("RTCP 流保活, 需要上级支持");
            }
            if(this.form.StreamReader) {
                list.push("强制推送H264编码, 可能带来额外的性能消耗");
            }
            if(this.form.DigestAlgorithm && this.form.DigestAlgorithm != "MD5") {
                list.push("指定摘要算法, 需要上级支持");
            }
            var msg = "";
            if (list.length > 0) {
                msg = list.join("; ")
            }
            return msg;
        }
    },
    methods: {
        defForm() {
            return {
                ID: "",
                Enable: false,
                Name: "",
                Serial: "",
                Realm: "",
                Host: "",
                Port: 5060,
                LocalSerial: "",
                LocalHost: "",
                LocalPort: "",
                Username: "",
                Password: "",
                Online: false,
                Status: "",
                RegisterTimeout: 3600,
                KeepaliveInterval: 60,
                RegisterInterval: 300,
                StreamKeepalive: false,
                StreamReader: false,
                BindLocalIP: false,
                AllowControl: true,
                ShareAllChannel: false,
                CommandTransport: "UDP",
                Charset: "GB2312",
                CatalogGroupSize: 1,
                LoadLimit: "",
                CivilCodeLimit: 8,
                DigestAlgorithm: "",
            }
        },
        onHide() {
            this.ctrl = false;
            this.alt = false;
            this.showCivilCodeLimit = false;
            this.showDigestAlgorithm = false;
            this.form = this.defForm();
            $(this.$el).off("keydown", this.keyDown).off("keyup", this.keyUp);
        },
        onShow() {
            this.errors.clear();
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
            $.get('/api/v1/cascade/save', this.form).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if(data) {
                Object.assign(this.form, data);
            }
            if(!this.form["LocalPort"]) {
                this.form["LocalPort"] = "";
            }
            if(!this.form["LoadLimit"]) {
                this.form["LoadLimit"] = "";
            }
            if(this.form["CivilCodeLimit"]) {
                this.showCivilCodeLimit = this.form["CivilCodeLimit"] != 8;
            }
            if(this.form["DigestAlgorithm"]) {
                this.showDigestAlgorithm = this.form["DigestAlgorithm"] != "MD5";
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
</style>

