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
                <label>在线状态</label>
                <select class="form-control" v-model.trim="online">
                <option value="">全部</option>
                <option value="true">在线</option>
                <option value="false">离线</option>
                </select>
            </div>
        </div>
        <br>
        <el-table :data="channels" stripe @sort-change="sortChange" :max-height="500" @row-click="rowClick" @row-dblclick="rowDblclick" :row-style="rowStyle"
            ref="channelTable" v-loading="loading" element-loading-text="加载中...">
            <el-table-column prop="DeviceID" label="设备国标编号" min-width="200" show-overflow-tooltip sortable="custom" :fixed="!isMobile()"></el-table-column>
            <el-table-column prop="ID" label="通道国标编号" min-width="200" show-overflow-tooltip sortable="custom" :fixed="!isMobile()"></el-table-column>
            <el-table-column prop="Name" label="通道名称" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
            <el-table-column prop="Status" label="在线状态" min-width="100">
                <template slot-scope="props">
                  <span v-if="props.row.SubCount > 0">-</span>
                  <span v-else-if="(props.row.CustomStatus || props.row.Status) == 'ON'" :class="{'text-success': props.row.Status == 'ON', 'text-orange': !!props.row.CustomStatus}">在线</span>
                  <span v-else :class="{'text-orange': !!props.row.CustomStatus}">离线</span>
                </template>
            </el-table-column>
            <el-table-column prop="SubCount" label="子节点数" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
            <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatManufacturer" show-overflow-tooltip></el-table-column>
        </el-table>
        <el-pagination v-if="total > 0" layout="total,prev,pager,next" :pager-count="isMobile() ? 3 : 5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
        <div class="clearfix"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
      </div>
    </div>
    <!-- /.modal-content -->
  </div>
  <!-- /.modal-dialog -->
</div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import "jquery-ui/ui/widgets/draggable"
import { mapState } from "vuex"

export default {
  props: {
      title: {
          default: ''
      },
      size: {
          type: String,
          default: 'modal-lg'
      },
      fade: {
          type: Boolean,
          default: false
      }
  },
  data() {
    return {
      q: "",
      online: "true",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "",
      order: "",
      loading: false,
      channels: [],
      index: 0,
    };
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"])
  },
  watch: {
    q: function(newVal, oldVal) {
        this.doDelaySearch();
    },
    online: function(newVal, oldVal) {
      this.doDelaySearch();
    },
    currentPage: function(newVal, oldVal) {
        this.doSearch(newVal);
    },
    pageSize: function(newVal, oldVal) {
        this.doSearch();
    }
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
        // this.reset();
        this.$emit("hide");
    })
  },
  methods: {
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getChannels();
    },
    doSearch(page = 1) {
        this.currentPage = page;
        this.getChannels();
    },
    doDelaySearch: _.debounce(function() {
        this.doSearch();
    }, 800),
    formatName(row, col, cell) {
      return row.CustomName || row.Name || "-";
    },
    formatManufacturer(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    getChannels() {
        this.loading = true;
        $.get("/api/v1/device/channellist", {
            q: this.q,
            start: (this.currentPage -1) * this.pageSize,
            limit: this.pageSize,
            channel_type: "device",
            online: this.online,
            sort: this.sort,
            order: this.order
        }).then(ret => {
            this.total = ret.ChannelCount;
            this.channels = ret.ChannelList || [];
        }).always(() => {
            this.$nextTick(() => {
              this.loading = false;
            })
        });
    },
    rowClick(row, event, column) {
      if((row.CustomStatus || row.Status) !== "ON") return;
      if(this.serverInfo.StrictChannelParental && row.Parental == 1) return;
      if(this.serverInfo.StrictChannelCode && row.ID.length != 20) return;
      this.$emit("selected", this.index, row);
      this.hide();
    },
    rowDblclick(row, event, column) {
      // if((row.CustomStatus || row.Status) !== "ON") return;
      if(this.serverInfo.StrictChannelParental && row.Parental == 1) return;
      if(this.serverInfo.StrictChannelCode && row.ID.length != 20) return;
      this.$emit("selected", this.index, row);
      this.hide();
    },
    rowStyle({row, rowIndex}) {
      if((row.CustomStatus || row.Status) === "ON") {
        if(this.serverInfo.StrictChannelParental && row.Parental == 1) return "";
        if(this.serverInfo.StrictChannelCode && row.ID.length != 20) return "";
        return "cursor:pointer";
      }
      return "";
    },
    reset() {
      this.index = 0;
      this.channels = [];
      this.q = "";
      this.currentPage = 1;
      this.pageSize = 10;
    },
    show(index) {
      this.index = index;
      $(this.$el).modal("show");
      this.getChannels();
    },
    hide() {
      $(this.$el).modal("hide");
    },
  }
};
</script>

<style lang="less" scoped>
  label.el-switch {
      margin-bottom: -10px;
  }
</style>
