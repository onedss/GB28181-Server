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
                <div class="form-inline" autocomplete="off" spellcheck="false">
                    <div class="form-group form-group-sm">
                        <label>搜索</label>
                        <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
                    </div>
                    <span class="hidden-xs">&nbsp;&nbsp;</span>
                    <div class="form-group form-group-sm">
                        <div class="checkbox">
                            <el-checkbox style="margin-top:-5px;padding-left:0;" size="small" v-model.trim="related" name="Related">
                                只看已选({{relateCnt}})
                            </el-checkbox>
                        </div>
                    </div>
                </div>
                <br>
                <el-table :data="channels" stripe @sort-change="sortChange" @select="select" @select-all="selectAll" :max-height="500" ref="channelTable" v-loading="loading" element-loading-text="加载中...">
                    <el-table-column type="selection" width="55" fixed :selectable="selectable"></el-table-column>
                    <el-table-column prop="DeviceID" label="设备国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                    <el-table-column prop="ID" label="通道国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                    <el-table-column prop="Name" label="通道名称" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatManufacturer" show-overflow-tooltip></el-table-column>
                </el-table>
                <el-pagination v-if="total > 0" layout="total,prev,pager,next,sizes" :pager-count="isMobile() ? 3 : 5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
                <div class="clearfix"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import 'jquery-ui/ui/widgets/draggable';
import $ from 'jquery';
import _ from "lodash";
import { mapState } from "vuex";

export default {
    props: {
        title: {
            default: ''
        },
        size: {
            type: String,
            default: ''
        },
        fade: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            q: "",
            total: 0,
            relateCnt: 0,
            pageSize: 10,
            currentPage: 1,
            sort: "",
            order: "",
            related: false,
            loading: false,
            channels: [],
            selection: [],
            id: '', //外部关联id
        }
    },
    watch: {
        q: function (newVal, oldVal) {
            this.doDelaySearch();
        },
        related: function (newVal, oldVal) {
            this.doSearch();
        },
        currentPage: function (newVal, oldVal) {
            this.doSearch(newVal);
        },
        pageSize: function (newVal, oldVal) {
            this.doSearch();
        }
    },
    computed: {
        ...mapState(['userInfo', 'serverInfo']),
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
            this.errors.clear();
            this.reset();
            this.$emit("hide");
        })
    },
    directives: {
        focus: {
            inserted: function (el) {
                el.focus();
                el.select();
            }
        }
    },
    methods: {
        sortChange(data) {
            this.sort = data.prop;
            this.order = data.order == "ascending" ? "asc" : "desc";
            this.getChannels();
        },
        select(selection, row) {
            var idx = selection.indexOf(row);
            if (idx >= 0) {
                $.get("/api/v1/cloudrecord/plan/savechannels", {
                    id: this.id,
                    channels: [`${row.DeviceID}:${row.ID}`]
                }).always(() => {
                    this.getChannels();
                })
            } else {
                $.get("/api/v1/cloudrecord/plan/removechannels", {
                    id: this.id,
                    channels: [`${row.DeviceID}:${row.ID}`]
                }).always(() => {
                    this.getChannels();
                })
            }
        },
        selectAll(selection) {
            var keys = [];
            if (selection.length) {
                for (var row of selection) {
                    var idx = this.selection.indexOf(row);
                    if (idx < 0) {
                        keys.push(`${row.DeviceID}:${row.ID}`)
                    }
                }
                $.get("/api/v1/cloudrecord/plan/savechannels", {
                    id: this.id,
                    channels: keys,
                }).always(() => {
                    this.getChannels();
                })
            } else {
                for (var row of this.selection) {
                    keys.push(`${row.DeviceID}:${row.ID}`)
                }
                $.get("/api/v1/cloudrecord/plan/removechannels", {
                    id: this.id,
                    channels: keys,
                }).always(() => {
                    this.getChannels();
                })
            }
        },
        doSearch(page = 1) {
            this.currentPage = page;
            this.getChannels();
        },
        doDelaySearch: _.debounce(function () {
            this.doSearch();
        }, 800),
        formatName(row, col, cell) {
            return row.CustomName || row.Name || "-";
        },
        formatManufacturer(row, col, cell) {
            if (cell) return cell;
            return "-";
        },
        selectable(row, index) {
            return true;
        },
        getChannels() {
            if (!this.id) return;
            this.loading = true;
            $.get("/api/v1/cloudrecord/plan/channellist", {
                id: this.id,
                q: this.q,
                start: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize,
                related: this.related,
                sort: this.sort,
                order: this.order
            }).then(ret => {
                this.$refs["channelTable"].clearSelection();
                this.total = ret.ChannelCount;
                this.relateCnt = ret.ChannelRelateCount;
                this.channels = ret.ChannelList || [];
                this.selection = [];
                this.$nextTick(() => {
                    this.channels.forEach(row => {
                        var sel = row.PlanID != "";
                        this.$refs["channelTable"].toggleRowSelection(row, sel);
                        if (sel) {
                            this.selection.push(row);
                        }
                    })
                })
            }).always(() => {
                this.$nextTick(() => {
                    this.loading = false;
                })
            });
        },
        reset() {
            this.id = '';
            this.$refs["channelTable"].clearSelection();
            this.channels = [];
            this.selection = [];
            this.q = "";
            this.related = false;
            this.currentPage = 1;
            this.pageSize = 10;
        },
        show(id) {
            this.id = id;
            $(this.$el).modal("show");
            this.getChannels();
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
</style>
