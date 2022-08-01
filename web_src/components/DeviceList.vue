<template>
  <div>
    <div class="box box-primary">
      <div class="box-header">
        <h4 class="text-primary text-center">设备列表</h4>
      </div>
      <div class="box-body">
        <div class="form-inline" autocomplete="off" spellcheck="false">
          <div class="form-group form-group-sm">
            <label>搜索</label>
            <div class="input-group input-group-sm" v-if="!isMobile() && hasAnyRole(serverInfo, userInfo, '超级管理员')">
                <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
                <div class="input-group-btn">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="download" title="导出设备列表"><i class="fa fa-download"></i></button>
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="$refs['uploadDlg'].show()" title="导入设备列表"><i class="fa fa-upload"></i></button>
                </div>
            </div>
            <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q" v-else>
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
          <!-- <div class="form-group pull-right">
            <router-link :to="`/devices/tree`" class="btn btn-default btn-sm">
                <i class="fa fa-sitemap"></i> 树视图
            </router-link>
          </div> -->
        </div>
        <br>
        <div class="clearfix"></div>
        <el-table :data="devices" stripe :default-sort="{prop: 'ID', order: 'ascending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
          <el-table-column prop="ID" label="设备国标编号" min-width="200" sortable="custom" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" :min-width="hasAnyRole(serverInfo, userInfo, '管理员') ? 240 : 120" :fixed="isMobile() ? false : 'right'">
            <template slot-scope="props">
                <div class="btn-group btn-group-xs">
                    <router-link class="btn btn-info" :to="`/devices/channels/${props.row.ID}/1`">
                       <i class="fa fa-info"></i> 查看通道
                    </router-link>
                    <button type="button" class="btn btn-primary" @click.prevent="fetchCatalog(props.row)" v-if="props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-refresh"></i> 更新通道
                    </button>
                    <button type="button" class="btn btn-warning" @click.prevent="editDevice(props.row)" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-edit"></i> 编辑
                    </button>
                    <button type="button" class="btn btn-danger" @click.prevent="removeDevice(props.row)" v-if="!props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-remove"></i> 删除
                    </button>
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="Name" label="名称" min-width="140" :formatter="formatName" show-overflow-tooltip></el-table-column>
          <el-table-column prop="CommandTransport" label="信令传输" min-width="120" :formatter="formatName" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="MediaTransport" label="流传输模式" min-width="140" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
            <template slot-scope="props">
              <el-dropdown size="small" trigger="click" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" @command="setMediaTransport">
                <span class="el-dropdown-link">
                  {{formatTransport(props.row)}} <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'UDP', MediaTransportMode: 'passive'}">UDP</el-dropdown-item>
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'TCP', MediaTransportMode: 'passive'}">TCP 被动</el-dropdown-item>
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'TCP', MediaTransportMode: 'active'}">TCP 主动</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <span v-else>{{formatTransport(props.row)}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ChannelCount" label="通道数" min-width="100" sortable="custom" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" show-overflow-tooltip>
            <template slot-scope="props">
              <span class="text-red" v-if="props.row.ChannelOverLoad">
                {{props.row.ChannelCount}} (授权满)
              </span>
              <span v-else>{{props.row.ChannelCount}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Online" label="在线状态" min-width="100">
            <template slot-scope="props">
              <span v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                <a href="javascript:;" @click.prevent="showStatusLog(props.row)"
                  :class="[{'text-success': props.row.Online, 'text-gray': !props.row.Online}]" title="点击查看设备状态记录">
                  {{props.row.Online ? "在线" : "离线"}}
                </a>
                <a href="javascript:;" @click.prevent="showStreamLog(props.row)"
                  :class="[{'text-success': props.row.Online, 'text-gray': !props.row.Online}]" title="点击查看设备流量统计">
                  <i class="fa fa-bar-chart"></i>
                </a>
              </span>
              <span v-else-if="props.row.Online" class="text-success">
                在线
              </span>
              <span v-else class="text-gray">
                离线
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="RemoteIP" label="出口IP" min-width="140" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="RemotePort" label="端口" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')"></el-table-column>
          <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
          <el-table-column prop="LastKeepaliveAt" label="最近心跳" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="LastRegisterAt" label="最近注册" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="CreatedAt" label="创建时间" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
        </el-table>
      </div>
      <div class="box-footer" v-if="total > 0">
        <el-pagination layout="total,prev,pager,next" :pager-count="isMobile() ? 3 : 5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
      </div>
    </div>
    <div class="alert text-center" v-if="serverInfo.DemoUser">
      <small>
          <strong><i class="fa fa-info-circle"></i> 提示 : </strong>
          可向 Redis 订阅 device 消息以获取设备实时状态 > SUBSCRIBE device; 消息内容为 "设备国标编号 ON/OFF"
      </small>
    </div>
    <UploadDlg ref="uploadDlg" title="上传设备列表" url="/api/v1/device/import" @uploaded="uploaded"></UploadDlg>
    <DeviceEditDlg ref="deviceEditDlg" @submit="getDeviceList" :useSeparateDevicePassword="serverInfo.UseSeparateDevicePassword === true"></DeviceEditDlg>
    <DeviceLogDlg ref="deviceLogDlg"></DeviceLogDlg>
    <el-dialog title="提示" :visible.sync="removeDlg">
      <p>确认删除 {{removeName || removeID}} ?</p>
      <br>
      <div class="checkbox">
        <el-checkbox style="margin-left:-19px;margin-top:-5px;" v-model.trim="removeUACheck">
            批量删除 <strong>{{removeUA}}</strong>
        </el-checkbox>
        <br><br>
        <el-checkbox style="margin-left:-19px;margin-top:-5px;" v-model.trim="forbidUACheck" v-show="removeUACheck">
            禁止 <strong>{{removeUA}}</strong> 接入
        </el-checkbox>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="removeDlg = false" size="small">取 消</el-button>
        <el-button type="primary" @click="removeBatch" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import UploadDlg from "components/UploadDlg.vue";
import DeviceEditDlg from 'components/DeviceEditDlg.vue'
import DeviceLogDlg from "components/DeviceLogDlg";
import { mapState } from "vuex"
export default {
  props: {},
  data() {
    return {
      q: "",
      online: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "ID",
      order: "asc",
      devices: [],
      loading: false,
      timer: 0,
      statusLogs:[],
      bStatusLogLoading: false,
      removeDlg: false,
      removeUACheck: false,
      forbidUACheck: false,
      removeID: "",
      removeName: "",
      removeUA: "",
    };
  },
  components: {
    UploadDlg, DeviceEditDlg, DeviceLogDlg
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"])
  },
  mounted() {
    // this.$refs["q"].focus();
    // this.getDeviceList();
    // this.timer = setInterval(() => {
    //     this.getDeviceList();
    // }, 3000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  methods: {
    ready() {
      this.$watch('q', function(newVal, oldVal) {
        this.doDelaySearch();
      });
      this.$watch('online', function(newVal, oldVal) {
        this.doSearch();
      });
      this.$watch('currentPage', function(newVal, oldVal) {
        this.doSearch(newVal);
      });
      // this.getDeviceList();
      this.timer = setInterval(() => {
        this.getDeviceList(false);
      }, 3000);
    },
    isMobile() {
      return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    },
    doSearch(page = 1) {
      var query = {};
      if (this.q) query["q"] = this.q;
      if (this.online) query["online"] = this.online;
      this.$router.replace({
        path: `/devices/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 800),
    getDeviceList(global = true) {
      if(global) {
        this.loading = true;
      }
      $.ajax({
        method: "GET",
        url: "/api/v1/device/list",
        global: global,
        data: {
          q: this.q,
          start: (this.currentPage -1) * this.pageSize,
          limit: this.pageSize,
          online: this.online,
          sort: this.sort,
          order: this.order
        }
      }).then(ret => {
        this.total = ret["DeviceCount"];
        this.devices = ret["DeviceList"];
      }).always(() => {
        if(global) {
          this.$nextTick(() => {
            this.loading = false;
          })
        }
      });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getDeviceList();
    },
    fetchCatalog(row) {
      $.ajax({
        method: "GET", // type: "GET", is also ok, method since jquery 1.9
        url: "/api/v1/device/fetchcatalog",
        global: false,
        data: {
          serial: row.ID
        }
      }).then(() => {
        this.$message({
          type: "success",
          message: "更新通道信息成功"
        })
      }).fail(xhr => {
        xhr && console.log(`fetch catalog ajax error: ${xhr.status} ${xhr.responseText}`);
      })
    },
    download() {
      window.open(`/api/v1/device/export`);
    },
    uploaded() {
        this.$message({
            type: 'success',
            message: "上传成功！"
        })
        this.getDeviceList();
        this.$refs['uploadDlg'].hide();
    },
    removeBatch(){
      this.removeDlg = false;
      var data = {
        serial: this.removeID,
      };
      if (this.removeUACheck) {
        data["ua"] = this.removeUA;
        if (this.forbidUACheck) {
          data["forbid"] = true;
        }
      }
      $.get("/api/v1/device/remove", data).always(() => {
        this.getDeviceList();
      })
    },
    removeDevice(row) {
      if (!row.Online && !row.ChannelCount && row.LastKeepaliveAt === "0001-01-01 00:00:00" && row.Manufacturer && row.ID && row.ID.length < 10) {
      // if (!row.Online && !row.ChannelCount && row.LastKeepaliveAt === "0001-01-01 00:00:00" && row.Manufacturer && row.ID) {
        this.removeID = row.ID;
        this.removeName = row.Name;
        this.removeUA = row.Manufacturer;
        this.removeUACheck = false;
        this.forbidUACheck = false;
        this.removeDlg = true;
        return
      }
      this.$confirm(`确认删除 ${row.Name || row.ID} ?`, "提示").then(() => {
        $.get("/api/v1/device/remove", {
          serial: row.ID
        }).always(() => {
          this.getDeviceList();
        });
      }).catch(() => {});
    },
    editDevice(row) {
      this.$refs["deviceEditDlg"].show({
        serial: row.ID,
        name: row.Name,
        media_transport: row.MediaTransport,
        media_transport_mode: row.MediaTransportMode,
        stream_mode: row.StreamMode,
        recv_stream_ip: row.RecvStreamIP,
        contact_ip: row.ContactIP,
        sms_id: row.SMSID,
        sms_group_id: row.SMSGroupID,
        charset: row.Charset,
        catalog_interval: row.CatalogInterval,
        subscribe_interval: row.SubscribeInterval,
        catalog_subscribe: row.CatalogSubscribe,
        alarm_subscribe: row.AlarmSubscribe,
        position_subscribe: row.PositionSubscribe,
        password: row.Password,
        record_center: row.RecordCenter,
        record_indistinct: row.RecordIndistinct,
        civil_code_first: row.CivilCodeFirst,
        drop_channel_type: row.DropChannelType,
        longitude: row.Longitude,
        latitude: row.Latitude,
      });
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    formatTransport(row, col, cell) {
      var ret = String(row.MediaTransport).toUpperCase();
      if(ret == "TCP") {
        ret += row.MediaTransportMode == 'active' ? " 主动" : " 被动";
      }
      return ret;
    },
    setMediaTransport(cmd) {
      var transport = cmd.MediaTransport || cmd.row.MediaTransport;
      var transportMode = cmd.MediaTransportMode || cmd.row.MediaTransportMode;
      $.get("/api/v1/device/setmediatransport", {
        serial: cmd.row.ID,
        media_transport: transport,
        media_transport_mode: transportMode,
      }).then(() => {
        this.$set(cmd.row, "MediaTransport", transport);
        this.$set(cmd.row, "MediaTransportMode", transportMode);
      })
    },
    showDeviceLog(row) {
      this.$refs["deviceLogDlg"].show(`设备(${row.ID})`, row.ID);
    },
    showStatusLog(row) {
      this.$refs["deviceLogDlg"].showStatusLog(`设备(${row.ID})`, row.ID);
    },
    showStreamLog(row) {
      this.$refs["deviceLogDlg"].showStreamLog(`设备(${row.ID})`, row.ID);
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.online = to.query.online || "";
      vm.currentPage = parseInt(to.params.page) || 1;
      vm.ready();
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    next();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.online = to.query.online || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.devices = [];
      this.total = 0;
      this.getDeviceList();
    });
  }
};
</script>

