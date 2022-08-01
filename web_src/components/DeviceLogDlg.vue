<template>
    <div :class="['modal', {fade: fade}]" data-backdrop="static" data-disable="false" data-keyboard="true" tabindex="-1">
        <div :class="['modal-dialog', size]">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title text-center text-primary"><span>{{title}}</span></h4>
                </div>
                <div class="modal-body">
                    <el-tabs v-model="tabName" @tab-click="tabClick">
                        <el-tab-pane name="status" v-loading="bStatusLogLoading" element-loading-text="加载中...">
                            <span slot="label"><i class="fa fa-list-ul"></i> 状态记录</span>
                            <el-timeline v-if="statusLogs.length > 0"
                                style="margin-top: 10px; min-height: 200px; max-height: 450px; overflow-y:auto;">
                                <el-timeline-item v-for="(v, idx) in statusLogs" :key="idx" :type="statusTimeLineType(v)" :timestamp="v.CreatedAt">
                                    {{v.Description}}
                                </el-timeline-item>
                            </el-timeline>
                            <p v-else class="text-center">
                                <br>
                                <span v-if="bStatusLogLoading">暂无数据</span>
                                <span v-else-if="statusDays && statusDays > 0">最近{{statusDays}}天没有状态变更记录</span>
                                <span v-else>未找到最近的状态变更记录</span>
                            </p>
                        </el-tab-pane>
                        <el-tab-pane name="stream" v-loading="bStreamLogLoading" element-loading-text="加载中...">
                            <span slot="label"><i class="fa fa-bar-chart"></i> 流量统计</span>
                            <br>
                            <el-radio-group v-model="streamLogType" size="mini" @change="changeStreamLogType">
                                <el-radio-button label="today">今天</el-radio-button>
                                <el-radio-button label="yesterday">昨天</el-radio-button>
                                <el-radio-button label="week">最近7天</el-radio-button>
                                <el-radio-button label="month">最近30天</el-radio-button>
                            </el-radio-group>
                            <br>
                            <br>
                            <br>
                            <ve-line ref="streamChart" height="300px" :colors="chartColors" :data="streamLogs"
                                :extend="streamLogExtend" :settings="streamLogSettings" legend-position="bottom" :legend-visible="true"
                                :title="{text:'流量使用', left: 'center'}">
                            </ve-line>
                        </el-tab-pane>
                        <el-tab-pane name="position" v-loading="bPositionLogLoading" element-loading-text="加载中...">
                            <span slot="label"><i class="fa fa-location-arrow"></i> 移动轨迹</span>
                            <!-- <span slot="label"><i class="fa fa-map-marker"></i> 移动轨迹</span> -->
                            <el-timeline v-if="positionLogs.length > 0"
                                style="margin-top: 10px; min-height: 200px; max-height: 450px; overflow-y:auto;">
                                <el-timeline-item v-for="(v, idx) in positionLogs" :key="idx" :type="positionTimeLineType(v)" :timestamp="v.CreatedAt">
                                    {{v.Method}} {{v.Longitude}}, {{v.Latitude}}
                                </el-timeline-item>
                            </el-timeline>
                            <p v-else class="text-center">
                                <br>
                                <span v-if="bPositionLogLoading">暂无数据</span>
                                <span v-else-if="positionDays && positionDays > 0">最近{{positionDays}}天没有位置变更记录</span>
                                <span v-else>未找到最近的位置变更记录</span>
                            </p>
                        </el-tab-pane>
                    </el-tabs>
                    <div class="tab-content">
                        <div class="tab-pane active" id="status-log">
                        </div>
                        <div class="tab-pane" id="stream-log">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import 'jquery-ui/ui/widgets/draggable'
    import $ from 'jquery'
    import prettyBytes from 'pretty-bytes'
    import ElTimeline from 'components/Timeline.vue'
    import ElTimelineItem from 'components/TimelineItem.vue'
    import moment from 'moment'

    export default {
        props: {
            size: {
                type: String,
                default: ''
            },
            fade: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                tabName: "status",
                chartColors: ["#337ab7", "#7FFFD4"],
                streamLogSettings: {
                    area: true,
                    // xAxisType: "time",
                    labelMap: {
                        OutBytes:"发送",
                        InBytes:"接收",
                    },
                },
                streamLogExtend: {
                    legend: {
                        formatter: name => {
                            switch(name) {
                                case "接收":
                                    return `接收(${prettyBytes(this.streamLogs.sumInBytes)})`
                                    break;
                                case "发送":
                                    return `发送(${prettyBytes(this.streamLogs.sumOutBytes)})`
                                    break;
                            }
                            return name;
                        }
                    },
                    tooltip: {
                        formatter: arr => {
                            var name = arr[0].name;
                            if(this.streamLogType == 'today' || this.streamLogType == 'yesterday') {
                                name = moment(arr[0].name, 'YYYY-MM-DD HH:mm:ss').format('HH');
                            } else {
                                name = moment(arr[0].name, 'YYYY-MM-DD HH:mm:ss').format('MM-DD');
                            }
                            return `${name}<br>${arr[0].seriesName} ${prettyBytes(arr[0].value)}<br>${arr[1].seriesName} ${prettyBytes(arr[1].value)}`;
                        },
                    },
                    yAxis: {
                        axisLabel: {
                            formatter: (name, idx) => {
                                return `${prettyBytes(name)}`;
                            }
                        }
                    },
                    xAxis: {
                        axisLabel: {
                            formatter: (name, idx) => {
                                if(this.streamLogType == 'today' || this.streamLogType == 'yesterday') {
                                    return `${moment(name, 'YYYY-MM-DD HH:mm:ss').format("HH")}`;
                                } else {
                                    return `${moment(name, 'YYYY-MM-DD HH:mm:ss').format('MM-DD')}`;
                                }
                            }
                        }
                    }
                },
                title: '状态记录',
                serial: '',
                code: '',
                limit: 20,

                statusLogs: [],
                statusDays: 0,
                bStatusLogLoading: false,

                positionLogs: [],
                positionDays: 0,
                bPositionLogLoading: false,

                streamLogType: "today",
                streamLogs: {
                    columns: ["Time", "OutBytes", "InBytes"],
                    rows: [],
                    sumInBytes: 0,
                    sumOutBytes: 0,
                },
                bStreamLogLoading: false,
            }
        },
        components: {
            ElTimeline, ElTimelineItem
        },
        mounted() {
            $(this.$el).find('.modal-content').draggable({
                handle: '.modal-header',
                cancel: ".modal-title span",
                addClasses: false,
                containment: 'document',
                delay: 100,
                opacity: 0.5
            });
            $(this.$el).on("shown.bs.modal", () => {
                this.$emit("show");
            }).on("hidden.bs.modal", () => {
                this.reset();
                this.$emit("hide");
            });
        },
        methods: {
            getStatusLogs() {
                if(!this.serial) return;
                this.bStatusLogLoading = true;
                this.statusLogs = [];
                $.get("/api/v1/device/statuslog", {
                    serial: this.serial,
                    code: this.code,
                    limit: this.limit,
                }).then(ret => {
                    if(ret) {
                        this.statusLogs = ret.LogList || [];
                        this.statusDays = ret.LogReserveDays || 0;
                    }
                }).always(() => {
                    this.$nextTick(() => {
                        this.bStatusLogLoading = false;
                    })
                })
            },
            getPositionLogs() {
                if(!this.serial) return;
                this.bPositionLogLoading = true;
                this.positionLogs = [];
                $.get("/api/v1/device/positionlog", {
                    serial: this.serial,
                    code: this.code,
                    limit: this.limit,
                }).then(ret => {
                    if(ret) {
                        this.positionLogs = ret.LogList || [];
                        this.positionDays = ret.LogReserveDays || 0;
                    }
                }).always(() => {
                    this.$nextTick(() => {
                        this.bPositionLogLoading = false;
                    })
                })
            },
            getStreamLogs() {
                if(!this.serial) return;
                this.bStreamLogLoading = true;
                this.streamLogs.rows = [];
                this.streamLogs.sumInBytes = 0;
                this.streamLogs.sumOutBytes = 0;
                $.get("/api/v1/device/streamlog", {
                    serial: this.serial,
                    code: this.code,
                    type: this.streamLogType,
                }).then(ret => {
                    if(ret) {
                        for(var v of ret.List) {
                            this.streamLogs.sumInBytes += v.InBytes;
                            this.streamLogs.sumOutBytes += v.OutBytes;
                        }
                        this.streamLogs.rows = ret.List || [];
                    }
                }).always(() => {
                    this.$nextTick(() => {
                        this.bStreamLogLoading = false;
                    })
                })
            },
            statusTimeLineType(v) {
                var ret = "primary";
                if(!v) return ret;
                switch(v.Status) {
                    case "ON":
                        ret = "primary";
                        break;
                    case "OFF":
                        ret = "warning";
                        break;
                    case "DEL":
                        ret = "danger";
                        break;
                    default:
                        ret = "info";
                        break;
                }
                return ret;
            },
            positionTimeLineType(v) {
                var ret = "primary";
                if(!v) return ret;
                switch(v.Method) {
                    case "移动位置上报":
                    case "通道通知":
                    case "通道检索":
                        ret = "primary";
                        break;
                    case "接口设置":
                        ret = "warning";
                        break;
                    case "报警位置上报":
                        ret = "danger";
                        break;
                    default:
                        ret = "info";
                        break;
                }
                return ret;
            },
            tabClick(tab) {
                if(tab.name == 'stream') {
                    this.$nextTick(() => {
                        this.$refs["streamChart"].resize();
                    })
                }
            },
            changeStreamLogType() {
                this.getStreamLogs();
            },
            reset() {
                this.title = '状态记录';
                this.serial = '';
                this.code = '';

                this.statusLogs = [];
                this.statusDays = 0;

                this.positionLogs = [];
                this.positionDays = 0;

                this.streamLogs.rows = [];
                this.streamLogs.sumInBytes = 0;
                this.streamLogs.sumOutBytes = 0;
                this.streamLogType = "today";
                // this.tabName = "status";
                this.limit = 20;
            },
            show(title, serial, code, limit) {
                this.title = title || this.title;
                this.serial = serial || '';
                this.code = code || '';
                this.limit = limit || 20;
                $(this.$el).modal("show");
                this.getStatusLogs();
                this.getPositionLogs();
                this.getStreamLogs();
            },
            showStatusLog(title, serial, code, limit) {
                this.tabName = "status";
                this.title = title || this.title;
                this.serial = serial || '';
                this.code = code || '';
                this.limit = limit || 20;
                $(this.$el).modal("show");
                this.getStatusLogs();
                this.getPositionLogs();
                this.getStreamLogs();
            },
            showStreamLog(title, serial, code) {
                this.tabName = "stream";
                this.title = title || this.title;
                this.serial = serial || '';
                this.code = code || '';
                $(this.$el).modal("show");
                this.getStatusLogs();
                this.getPositionLogs();
                this.getStreamLogs();
                this.$nextTick(() => {
                    this.$refs["streamChart"].resize();
                })
            },
            hide() {
                $(this.$el).modal("hide");
            }
        }
    }
</script>

<style lang="less" scoped>
    label.el-switch {
        margin-bottom: -10px;
    }

    .modal-content {
        overflow: hidden;
    }

    @media screen and(min-width: 992px){
        .modal-dialog.modal-lgg {
            width: 90%;
        }
    }

    @media screen and(min-width: 1200px){
        .modal-dialog.modal-lgg {
            width: 1200px;
        }
    }
</style>



