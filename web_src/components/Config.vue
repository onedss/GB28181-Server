<template>
<div class="container-fluid no-padding">
    <!-- <section class="content"> -->
    <div :class="['nav-tabs-custom', 'no-padding', {'col-lg-offset-2':!bShowMore, 'col-lg-8':!bShowMore, 'col-lg-offset-1':bShowMore, 'col-lg-10':bShowMore}]">
        <ul class="nav nav-tabs">
            <li class="active"><a href="#base-config" data-toggle="tab">{{logoText}} 信令服务配置</a></li>
            <li @click.prevent="getSMSList"><a href="#sms-config" data-toggle="tab">{{logoText}} 流媒体服务配置</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active" id="base-config">
                <form role="form" class="form-horizontal" autocomplete="off" @submit.prevent="onSubmit">
                    <div :class="[{'col-md-6': bShowMore, 'col-md-12': !bShowMore}]">
                        <div :class="['form-group' , {'has-error':  errors.has('Serial')}]">
                            <label for="sip-serial" class="col-sm-4 control-label">SIP ID</label>
                            <div class="col-sm-7">
                                <input id="sip-serial" type="text" class="form-control" name="Serial" data-vv-as="SIP ID" v-validate="'required'" v-model.trim="Serial">
                                <span class="help-block">{{errors.first('Serial')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('Realm')}]">
                            <label for="sip-realm" class="col-sm-4 control-label">SIP 域</label>
                            <div class="col-sm-7">
                                <input id="sip-realm" type="text" class="form-control" name="Realm" data-vv-as="SIP 域" v-validate="'required'" v-model.trim="Realm">
                                <span class="help-block">{{errors.first('Realm')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('Host')}]">
                            <label for="sip-host" class="col-sm-4 control-label">SIP Host</label>
                            <div class="col-sm-7">
                                <input type="text" id="sip-host" class="form-control" name="Host" data-vv-as="SIP Host" v-validate="'required'" v-model.trim="Host">
                                <span class="help-block">{{errors.first('Host')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('Port')}]">
                            <label for="sip-port" class="col-sm-4 control-label">SIP 端口</label>
                            <div class="col-sm-7">
                                <input type="text" id="sip-port" class="form-control" name="Port" data-vv-as="SIP 端口" v-validate="'required|numeric'" v-model.trim="Port">
                                <span class="help-block">{{errors.first('Port')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('DevicePassword')}]">
                            <label for="sip-dev-pwd" class="col-sm-4 control-label">设备统一接入密码</label>
                            <div class="col-sm-7">
                                <input type="text" id="sip-dev-pwd" class="form-control" name="DevicePassword" data-vv-as="设备统一接入密码" v-model.trim="DevicePassword">
                                <span class="help-block">{{errors.first('DevicePassword')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group', {'has-error': errors.has('PreferStreamFmt')}]" title="配置直播流优先使用的播放格式">
                            <label for="prefer-stream-fmt" class="col-sm-4 control-label">首选直播格式</label>
                            <div class="col-sm-7">
                                <select id="prefer-stream-fmt" name="PreferStreamFmt" class="form-control" v-model.trim="PreferStreamFmt">
                                    <option value="">自动选择</option>
                                    <option value="FLV">FLV</option>
                                    <option value="WS_FLV">WS_FLV</option>
                                    <option value="WEBRTC">WEBRTC</option>
                                    <option value="HLS">HLS</option>
                                    <option value="RTMP">RTMP</option>
                                </select>
                                <span class="help-block">{{errors.first('PreferStreamFmt')}}</span>
                            </div>
                        </div>
                        <div :class="{'form-group': true, 'has-error': errors.has('HTTPSPort')}" title="配置为0, 表示不开启HTTPS">
                            <label for="base-https-port" class="col-sm-4 control-label">HTTPS 端口(可选)</label>
                            <div class="col-sm-7">
                                <input id="base-https-port" type="text" class="form-control" name="HTTPSPort" data-vv-as="HTTPS 端口" v-validate="'numeric'" v-model.trim="HTTPSPort" placeholder="默认不开启HTTPS">
                                <span class="help-block">{{errors.first('HTTPSPort')}}</span>
                            </div>
                        </div>
                        <div :class="{'form-group': true, 'has-error': errors.has('HTTPSCertFile')}" title="配置 Cert 证书路径，绝对路径" v-if="HTTPSPort && HTTPSPort != '0'">
                            <label for="base-https-cert-file" class="col-sm-4 control-label">HTTPS Cert 证书路径</label>
                            <div class="col-sm-7">
                                <input id="base-https-cert-file" type="text" class="form-control" spellcheck="false" autocomplete="off" name="HTTPSCertFile" v-model.trim="HTTPSCertFile" placeholder="配置cert证书绝对路径">
                                <span class="help-block">{{errors.first('HTTPSCertFile')}}</span>
                            </div>
                        </div>
                        <div :class="{'form-group': true, 'has-error': errors.has('HTTPSKeyFile')}" title="配置 Cert 证书路径，绝对路径" v-if="HTTPSPort && HTTPSPort != '0'">
                            <label for="base-https-key-file" class="col-sm-4 control-label">HTTPS Key 证书路径</label>
                            <div class="col-sm-7">
                                <input id="base-https-key-file" type="text" class="form-control" spellcheck="false" autocomplete="off" name="HTTPSKeyFile" v-model.trim="HTTPSKeyFile" placeholder="配置key证书绝对路径">
                                <span class="help-block">{{errors.first('HTTPSKeyFile')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">接入控制(可选)</label>
                            <div class="col-sm-7 checkbox">
                                <router-link :to="`/black/1`">
                                    <i title="设备接入黑名单维护" class="fa fa-calendar-times-o cfg-black-list" aria-hidden="true">&nbsp;&nbsp;黑名单&nbsp;&nbsp;</i>
                                </router-link>
                                <router-link :to="`/white/1`">
                                    <i title="设备接入白名单维护" class="fa fa-calendar-check-o cfg-white-list" aria-hidden="true">&nbsp;&nbsp;白名单</i>
                                </router-link>
                                <span class="help-block"></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">其他配置</label>
                            <div class="col-sm-7 checkbox">
                                <el-checkbox title="开启后接口调用会校验登录" style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="APIAuth" name="APIAuth">
                                    HTTP 接口鉴权&nbsp;&nbsp;
                                </el-checkbox>
                                <el-checkbox title="开启后不需要事先通过接口拉流, 直播地址直接可用" style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="AllowStreamStartByURL" name="AllowStreamStartByURL">
                                    允许直播地址拉流&nbsp;&nbsp;
                                </el-checkbox>
                                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="SIPLog" name="SIPLog">信令日志&nbsp;&nbsp;</el-checkbox>
                                <span class="help-block"></span>
                            </div>
                        </div>
                        <br v-if="bShowMore"/>
                        <div class="form-group" style="font-weight: bold;padding-top: 15px;padding-bottom: 10px;">
                            <div class="col-sm-offset-4 col-sm-7">
                                <a href="#" class="form-control-static text-primary" @click.prevent="bShowMore = !bShowMore;" >
                                    {{bShowMore ? '&lt;&lt;&nbsp;&nbsp;关闭更多配置':'显示更多配置&nbsp;&nbsp;&gt;&gt;'}}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6" v-if="bShowMore">
                        <div :class="['form-group' , {'has-error': errors.has('TimeServer')}]">
                            <label for="sip-time-server" class="col-sm-4 control-label">校时源(可选)</label>
                            <div class="col-sm-7">
                                <input type="text" id="sip-time-server" class="form-control" name="TimeServer" data-vv-as="校时源" v-validate="" v-model.trim="TimeServer" placeholder="上级国标编号/NTP">
                                <span class="help-block">{{errors.first('TimeServer')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="black-ip-list" class="col-sm-4 control-label">黑名单 IP(可选)</label>
                            <div class="col-sm-7">
                                <input type="text" id="black-ip-list" class="form-control" name="BlackIPList" data-vv-as="黑名单 IP" v-model.trim="BlackIPList" placeholder="选填">
                                <span class="help-block"></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="black-ua-list" class="col-sm-4 control-label">黑名单 UA(可选)</label>
                            <div class="col-sm-7">
                                <input type="text" id="black-ua-list" class="form-control" name="BlackUAList" data-vv-as="黑名单 UA" v-model.trim="BlackUAList" placeholder="选填">
                                <span class="help-block"></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局过滤通道类型</label>
                            <div class="col-sm-7">
                                <el-select style="width:100%;" size="medium" v-model.trim="dropChannelTypes" multiple filterable allow-create default-first-option placeholder="选填, 需要丢弃的通道类型">
                                    <el-option v-for="(item, idx) in innerChannelTypes" :key="idx" :label="`${idx} - ${item}`" :value="idx">
                                    </el-option>
                                </el-select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局订阅项目</label>
                            <div class="col-sm-7 checkbox">
                                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="global_catalog_subscribe" name="global_catalog_subscribe">
                                    目录订阅&nbsp;&nbsp;
                                </el-checkbox>
                                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="global_alarm_subscribe" name="global_alarm_subscribe">
                                    报警订阅&nbsp;&nbsp;
                                </el-checkbox>
                                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="global_position_subscribe" name="global_position_subscribe">
                                    位置订阅
                                </el-checkbox>
                                <span class="help-block"></span>
                            </div>
                        </div>
                        <!-- <div class="form-group">
                            <label class="col-sm-4 control-label">全局目录订阅周期(秒)</label>
                            <div class="col-sm-7">
                                <input type="number" title="全局目录订阅周期" class="form-control" name="GlobalDeviceCatalogSubscribeInterval" data-vv-as="全局目录订阅周期" v-model.trim="GlobalDeviceCatalogSubscribeInterval" placeholder="选填">
                                <span class="help-block">{{errors.first('GlobalDeviceCatalogSubscribeInterval')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局报警订阅周期(秒)</label>
                            <div class="col-sm-7">
                                <input type="number" title="全局报警订阅周期" class="form-control" name="GlobalDeviceAlarmSubscribeInterval" data-vv-as="全局报警订阅周期" v-model.trim="GlobalDeviceAlarmSubscribeInterval" placeholder="选填">
                                <span class="help-block">{{errors.first('GlobalDeviceAlarmSubscribeInterval')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局位置订阅周期(秒)</label>
                            <div class="col-sm-7">
                                <input type="number" title="全局位置订阅周期" class="form-control" name="GlobalDevicePositionSubscribeInterval" data-vv-as="全局位置订阅周期" v-model.trim="GlobalDevicePositionSubscribeInterval" placeholder="选填">
                                <span class="help-block">{{errors.first('GlobalDevicePositionSubscribeInterval')}}</span>
                            </div>
                        </div> -->
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局通道开启音频</label>
                            <div class="col-sm-7 checkbox">
                                 <el-switch  v-model.trim="GlobalChannelAudio"></el-switch>
                                 <span class="help-block"></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">全局通道开启分享</label>
                            <div class="col-sm-7 checkbox">
                                 <el-switch  v-model.trim="GlobalChannelShared"></el-switch>
                                 <span class="help-block"></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="form-group">
                            <div :class="[{'col-sm-offset-5': bShowMore, 'col-sm-offset-4': !bShowMore,'col-sm-7': true}]">
                                <button type="submit" class="btn btn-primary" :disabled="isBasicNoChange || errors.any() || bCommitting">保存</button>
                            </div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </form>
            </div>
            <div class="tab-pane" id="sms-config">
                <form role="form" class="form-horizontal" autocomplete="off" @submit.prevent="onSubmitSMS">
                    <div class="form-group" v-if="smss.length <= 0">
                        <div class="col-sm-12">
                            <div class="alert text-center no-margin">SMS {{smstip}}</div>
                        </div>
                    </div>
                    <div :class="[{'col-md-6': bShowMore, 'col-md-12': !bShowMore}]">
                        <div class="form-group" v-if="smss.length > 0">
                            <label class="col-sm-4 control-label">SMS 服务</label>
                            <div class="col-sm-7">
                                <select class="form-control" v-model.trim="smsserial" @change="smschange">
                                    <option v-for="(c, idx) in smss" :value="c.Serial" :key="idx">{{c.Serial}}</option>
                                </select>
                            </div>
                        </div>
                        <div v-if="smsbaseconfig.Host != undefined && smss.length > 0">
                            <div :class="['form-group' , {'has-error': errors.has('smsHost')}]" title="内部通信收流. 启用外网IP收流后, 此处配置信令服务可访问的局域网IP如：127.0.0.1">
                                <label class="col-sm-4 control-label">本地|内网 IP</label>
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" placeholder="内部通信收流. 启用外网IP收流后, 此处配置信令服务可访问的局域网IP如：127.0.0.1" name="smsHost" data-vv-as="本地|内网 IP" v-validate="'required'" v-model.trim="smsbaseconfig.Host">
                                    <span class="help-block">{{errors.first('smsHost')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('WanIP')}]">
                                <label class="col-sm-4 control-label">外网 IP(可选)</label>
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" name="WanIP" data-vv-as="外网 IP" v-model.trim="smsbaseconfig.WanIP" placeholder="选填">
                                    <span class="help-block">{{errors.first('WanIP')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('RecordDir')}]">
                                <label class="col-sm-4 control-label">云录像目录</label>
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" name="RecordDir" data-vv-as="云录像目录" v-model.trim="smsbaseconfig.RecordDir">
                                    <span class="help-block">{{errors.first('RecordDir')}}</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-4 control-label">RTSP 端口(可选)</label>
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" name="RTSPPort" data-vv-as="RTSP 端口" v-validate="'numeric'" v-model.trim="smsbaseconfig.RTSPPort" placeholder="选填">
                                    <span class="help-block">{{errors.first('RTSPPort')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('RTMPPort')}]">
                                <label class="col-sm-4 control-label">RTMP 端口</label>
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" name="RTMPPort" data-vv-as="RTMP 端口" v-validate="'required|numeric'" v-model.trim="smsbaseconfig.RTMPPort">
                                    <span class="help-block">{{errors.first('RTMPPort')}}</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-4 control-label">其他配置</label>
                                <div class="col-sm-7 checkbox">
                                    <el-checkbox title="加快启播速度,相应也会增大一点延时" style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="smsbaseconfig.GOPCache" name="GOPCache">直播秒开</el-checkbox>
                                    <br v-if="bShowMore"/><br v-if="bShowMore"/><span v-if="!bShowMore">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="smsbaseconfig.HLS" name="HLS">HLS</el-checkbox>
                                    <br v-if="bShowMore"/><br v-if="bShowMore"/><span v-if="!bShowMore">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="smsbaseconfig.SIPLog" name="SIPLog">信令日志</el-checkbox>
                                    <br v-if="bShowMore"/><br v-if="bShowMore"/><span v-if="!bShowMore">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="smsbaseconfig.UseWanIPRecvStream" name="UseWanIPRecvStream">外网 IP 收流</el-checkbox>
                                </div>
                            </div>
                            <br v-if="bShowMore"/>
                            <div class="form-group" style="font-weight: bold;padding-top: 15px;padding-bottom: 10px;">
                                <div class="col-sm-offset-4 col-sm-7">
                                    <a href="#" class="form-control-static text-primary" @click.prevent="bShowMore = !bShowMore;" >
                                        {{bShowMore ? '&lt;&lt;&nbsp;&nbsp;关闭更多配置':'显示更多配置&nbsp;&nbsp;&gt;&gt;'}}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6" v-if="bShowMore && smsbaseconfig.Host != undefined && smss.length > 0">
                        <div :class="['form-group' , {'has-error': errors.has('smsSerial')}]" title="内部通信使用">
                            <label class="col-sm-4 control-label">SMS ID</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="smsSerial" data-vv-as="SIP ID" v-validate="'required'" v-model.trim="smsbaseconfig.Serial">
                                <span class="help-block">{{errors.first('smsSerial')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('smsRealm')}]" title="内部通信使用">
                            <label class="col-sm-4 control-label">SMS 域</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="smsRealm" data-vv-as="SIP 域" v-validate="'required'" v-model.trim="smsbaseconfig.Realm">
                                <span class="help-block">{{errors.first('smsRealm')}}</span>
                            </div>
                        </div>
                        <div :class="['form-group' , {'has-error': errors.has('smsPort')}]" title="内部通信使用">
                            <label class="col-sm-4 control-label">SMS 端口</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="smsPort" data-vv-as="SIP 端口" v-validate="'required|numeric'" v-model.trim="smsbaseconfig.Port">
                                <span class="help-block">{{errors.first('smsPort')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">分组 ID(可选)</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="GroupID" data-vv-as="分组 ID" v-model.trim="smsbaseconfig.GroupID" placeholder="选填">
                                <span class="help-block">{{errors.first('GroupID')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">录像保留(天数)</label>
                            <div class="col-sm-7">
                                <input type="number" title="默认不配置会永久保存，直到触发下面的清理阀值" class="form-control" name="CleanOverDays" data-vv-as="录像保留(天数)" v-model.trim="smsbaseconfig.CleanOverDays" placeholder="选填">
                                <span class="help-block">{{errors.first('CleanOverDays')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">存储清理阀值(%)</label>
                            <div class="col-sm-7">
                                <input type="number" class="form-control" name="CleanFreespacePercent" data-vv-as="存储清理阀值(%)" v-model.trim="smsbaseconfig.CleanFreespacePercent" placeholder="选填">
                                <span class="help-block">{{errors.first('CleanFreespacePercent')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">存储清理阀值(MB)</label>
                            <div class="col-sm-7">
                                <input type="number" class="form-control" name="CleanFreespaceSize" data-vv-as="存储清理阀值(MB)" v-model.trim="smsbaseconfig.CleanFreespaceSize" placeholder="选填">
                                <span class="help-block">{{errors.first('CleanFreespaceSize')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">收流端口区间(TCP)</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="TCPPortRange" data-vv-as="收流TCP端口区间" v-model.trim="smsbaseconfig.TCPPortRange" placeholder="选填">
                                <span class="help-block">{{errors.first('TCPPortRange')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">收流端口区间(UDP)</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="UDPPortRange" data-vv-as="收流UDP端口区间" v-model.trim="smsbaseconfig.UDPPortRange" placeholder="选填">
                                <span class="help-block">{{errors.first('UDPPortRange')}}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-4 control-label">WebRTC端口区间(UDP)</label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="RTCPortRange" data-vv-as="WebRTC播放端口区间(UDP)" v-model.trim="smsbaseconfig.RTCPortRange" placeholder="选填">
                                <span class="help-block">{{errors.first('RTCPortRange')}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-12" v-if="smss.length > 0">
                        <div class="form-group">
                            <div :class="[{'col-sm-offset-5': bShowMore, 'col-sm-offset-4': !bShowMore,'col-sm-7': true}]">
                                <button type="submit" class="btn btn-primary" :disabled="isSMSNoChange || errors.any() || bCommitting">保存</button>
                            </div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </form>
            </div>
        </div>
        <!-- /.tab-content -->
    </div>
    <!-- </section> -->
</div>
</template>

<script>
import $ from "jquery";
import {
    mapState,
    mapActions
} from "vuex"

export default {
    data() {
        return {
            bCommitting: false,
            Serial: "",
            Realm: "",
            Host: "",
            Port: 0,
            DevicePassword: "",
            TimeServer: "",
            PreferStreamFmt: "",
            AckTimeout: 0,
            KeepaliveTimeout: 0,
            APIAuth: false,
            SIPLog: false,
            AllowStreamStartByURL: false,
            BlackIPList: "",
            BlackUAList: "",
            remoteBasicData: "",
            remoteSMSData: "",
            smsserial: "",
            smss: [],
            sms: {},
            smsbaseconfig: {},
            smstip: "流媒体服务尚未启动",
            HTTPSPort: "",
            HTTPSCertFile: "",
            HTTPSKeyFile: "",
            timer: 0,
            bShowMore: false,
            GlobalChannelShared: false,
            GlobalChannelAudio: false,
            GlobalDeviceCatalogSubscribeInterval: 0,
            GlobalDeviceAlarmSubscribeInterval: 0,
            GlobalDevicePositionSubscribeInterval: 0,
            globalDeviceCatalogSubscribeInterval: 0, //backup
            globalDeviceAlarmSubscribeInterval: 0, //backup
            globalDevicePositionSubscribeInterval: 0, //backup
            global_catalog_subscribe: false,
            global_alarm_subscribe: false,
            global_position_subscribe: false,
            DropChannelType: "",
            dropChannelTypes: [],
            innerChannelTypes: {
                "134": "报警输入",
                "135": "报警输出",
                "136": "语音输入",
                "137": "语音输出",
                "200": "中心信令",
                "215": "业务分组",
                "216": "虚拟组织",
            },
        };
    },
    mounted() {
        this.getBaseConfig();
    },
    beforeDestroy() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
    },
    methods: {
        async onSubmit() {
            var ok = await this.$validator.validateAll();
            if (!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: "error",
                    message: e.msg
                });
                $(`[name=${e.field}]`).focus();
                return;
            }
            this.bCommitting = true;
            $.get("/api/v1/setbaseconfig", this.getBasicCommitObject()).then(data => {
                this.$message({
                    type: "success",
                    message: "配置成功！"
                });
            }).always(() => {
                this.getBaseConfig();
                this.bCommitting = false;
            })
        },
        async onSubmitSMS() {
            var ok = await this.$validator.validateAll();
            if (!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: "error",
                    message: e.msg
                });
                $(`[name=${e.field}]`).focus();
                return;
            }
            if (this.smsbaseconfig["CleanOverDays"] != ""  && this.smsbaseconfig["CleanOverDays"] < 0 ) {
                 this.$message({
                    type: "error",
                    message: "录像保留(天数)不能小于0"
                });
                return
            }
            if (this.smsbaseconfig["CleanFreespacePercent"] < 0 ) {
                 this.$message({
                    type: "error",
                    message: "存储清理阀值(百分比)不能小于0"
                });
                return
            }
            if (this.smsbaseconfig["CleanFreespaceSize"] < 0 ) {
                 this.$message({
                    type: "error",
                    message: "存储清理阀值(MB))不能小于0"
                });
                return
            }
            if (this.smsbaseconfig["CleanOverDays"] == "") {
                this.smsbaseconfig["CleanOverDays"] = 0;
            }
            this.bCommitting = true;
            $.get("/api/v1/sms/setbaseconfig", this.smsbaseconfig).then(data => {
                this.$message({
                    type: "success",
                    message: "配置保存中,请稍后..."
                });
            }).always(() => {
                this.smstip = "配置保存中,请稍后...";
                this.smsserial = "";
                this.getSMSList();
                this.bCommitting = false;
            })
        },
        getBasicCommitObject() {
            this.DropChannelType = this.dropChannelTypes.join(",");
            if(this.global_catalog_subscribe && this.GlobalDeviceCatalogSubscribeInterval <= 0) {
                if(this.globalDeviceCatalogSubscribeInterval > 0) {
                    this.GlobalDeviceCatalogSubscribeInterval = this.globalDeviceCatalogSubscribeInterval;
                } else {
                    this.GlobalDeviceCatalogSubscribeInterval = 3600;
                }
            } else if(!this.global_catalog_subscribe && this.GlobalDeviceCatalogSubscribeInterval > 0) {
                this.GlobalDeviceCatalogSubscribeInterval = 0;
            }
            if(this.global_alarm_subscribe && this.GlobalDeviceAlarmSubscribeInterval <= 0) {
                if(this.globalDeviceAlarmSubscribeInterval > 0) {
                    this.GlobalDeviceAlarmSubscribeInterval = this.globalDeviceAlarmSubscribeInterval;
                } else {
                    this.GlobalDeviceAlarmSubscribeInterval = 3600;
                }
            } else if(!this.global_alarm_subscribe && this.GlobalDeviceAlarmSubscribeInterval > 0) {
                this.GlobalDeviceAlarmSubscribeInterval = 0;
            }
            if(this.global_position_subscribe && this.GlobalDevicePositionSubscribeInterval <= 0) {
                if(this.globalDevicePositionSubscribeInterval > 0) {
                    this.GlobalDevicePositionSubscribeInterval = this.globalDevicePositionSubscribeInterval;
                } else {
                    this.GlobalDevicePositionSubscribeInterval = 3600;
                }
            } else if(!this.global_position_subscribe && this.GlobalDevicePositionSubscribeInterval > 0) {
                this.GlobalDevicePositionSubscribeInterval = 0;
            }
            return {
                Serial: this.Serial,
                Realm: this.Realm,
                Host: this.Host,
                Port: this.Port,
                DevicePassword: this.DevicePassword,
                TimeServer: this.TimeServer,
                PreferStreamFmt: this.PreferStreamFmt,
                AckTimeout: this.AckTimeout,
                KeepaliveTimeout: this.KeepaliveTimeout,
                APIAuth: this.APIAuth,
                SIPLog: this.SIPLog,
                AllowStreamStartByURL: this.AllowStreamStartByURL,
                BlackIPList: this.BlackIPList,
                BlackUAList: this.BlackUAList,
                HTTPSPort: this.HTTPSPort,
                HTTPSCertFile: this.HTTPSCertFile,
                HTTPSKeyFile: this.HTTPSKeyFile,
                GlobalChannelShared: this.GlobalChannelShared,
                GlobalChannelAudio: this.GlobalChannelAudio,
                GlobalDeviceCatalogSubscribeInterval: this.GlobalDeviceCatalogSubscribeInterval,
                GlobalDeviceAlarmSubscribeInterval: this.GlobalDeviceAlarmSubscribeInterval,
                GlobalDevicePositionSubscribeInterval: this.GlobalDevicePositionSubscribeInterval,
                DropChannelType: this.DropChannelType,
            };
        },
        getBaseConfig() {
            $.get("/api/v1/getbaseconfig").then(ret => {
                this.Serial = ret.Serial;
                this.Realm = ret.Realm;
                this.Host = ret.Host;
                this.Port = ret.Port;
                this.DevicePassword = ret.DevicePassword;
                this.TimeServer = ret.TimeServer;
                this.PreferStreamFmt = ret.PreferStreamFmt;
                this.AckTimeout = ret.AckTimeout;
                this.KeepaliveTimeout = ret.KeepaliveTimeout;
                this.APIAuth = ret.APIAuth;
                this.SIPLog = ret.SIPLog;
                this.AllowStreamStartByURL = ret.AllowStreamStartByURL;
                this.BlackIPList = ret.BlackIPList;
                this.BlackUAList = ret.BlackUAList;
                this.HTTPSPort = ret.HTTPSPort || "";
                this.HTTPSCertFile = ret.HTTPSCertFile;
                this.HTTPSKeyFile = ret.HTTPSKeyFile;
                this.GlobalChannelShared = ret.GlobalChannelShared || false;
                this.GlobalChannelAudio = ret.GlobalChannelAudio || false;
                this.GlobalDeviceCatalogSubscribeInterval = ret.GlobalDeviceCatalogSubscribeInterval || 0;
                this.GlobalDeviceAlarmSubscribeInterval = ret.GlobalDeviceAlarmSubscribeInterval || 0;
                this.GlobalDevicePositionSubscribeInterval = ret.GlobalDevicePositionSubscribeInterval || 0;

                this.globalDeviceCatalogSubscribeInterval = this.GlobalDeviceCatalogSubscribeInterval;
                this.globalDeviceAlarmSubscribeInterval = this.GlobalDeviceAlarmSubscribeInterval;
                this.globalDevicePositionSubscribeInterval = this.GlobalDevicePositionSubscribeInterval;

                this.global_catalog_subscribe = this.GlobalDeviceCatalogSubscribeInterval > 0;
                this.global_alarm_subscribe = this.GlobalDeviceAlarmSubscribeInterval > 0;
                this.global_position_subscribe = this.GlobalDevicePositionSubscribeInterval > 0;
                this.DropChannelType = ret.DropChannelType || "";
                if(this.DropChannelType) {
                    this.dropChannelTypes = this.DropChannelType.split(",");
                } else {
                    this.dropChannelTypes = [];
                }

                this.remoteBasicData = JSON.stringify(this.getBasicCommitObject());
            });
        },
        getSMSList() {
            if (this.smsserial == "") {
                $.get("/api/v1/sms/list").then(ret => {
                    this.smss = ret;
                    if (ret.length > 0) {
                        this.sms = ret[0];
                        this.smsserial = ret[0].Serial;
                    }
                    this.getSMSInfo();
                    if (this.smsserial == "") {
                        this.timer = setTimeout(() => {
                            this.getSMSList();
                        }, 1000);
                    } else {
                        this.smstip = "流媒体服务尚未启动";
                    }
                })
            }
        },
        getSMSInfo() {
            if (this.smsserial != "") {
                $.get("/api/v1/sms/getbaseconfig", {
                    serial: this.smsserial
                }).then(ret => {
                    this.smsbaseconfig = ret;
                    this.smsbaseconfig["RTSPPort"] = this.smsbaseconfig["RTSPPort"] || "";
                    this.smsbaseconfig["RTMPPort"] = this.smsbaseconfig["RTMPPort"] || "";
                    this.smsbaseconfig["PreSerial"] = this.smsserial;
                    if (this.smsbaseconfig["CleanOverDays"] == 0) {
                       this.smsbaseconfig["CleanOverDays"] = "";
                    }
                    this.remoteSMSData = JSON.stringify(this.smsbaseconfig);
                })
            }
        },
        smschange() {
            this.getSMSInfo();
        }
    },
    computed: {
        ...mapState([
            "logoText",
            "logoMiniText",
            "menus",
            "serverInfo"
        ]),
        isBasicNoChange() {
            var localeData = JSON.stringify(this.getBasicCommitObject());
            return this.remoteBasicData.localeCompare(localeData) == 0;
        },
        isSMSNoChange() {
            this.smsbaseconfig["PreSerial"] = this.smsserial;
            var localeData = JSON.stringify(this.smsbaseconfig);
            return this.remoteSMSData.localeCompare(localeData) == 0;
        }
    }
};
</script>

<style lang="less" scoped>
@import url(~assets/styles/variables.less);

.fa.cfg-black-list,
.fa.cfg-white-list {
    font-size: 14px;
    line-height: 24px;
    display: inline-block;
    color: @base;
}
</style>
