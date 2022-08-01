<template>
<div>
  <br><br class="hidden-xs">
  <div class="row hidden-xs">
    <!-- <div style="width: 510px; margin:0 auto;"> -->
    <div class="text-center">
      <el-button-group class="player-btn-group">
        <el-button type="primary" size="medium" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
        <el-button type="primary" size="medium" v-if="!isIE() && playerLength>1" class="hidden-xs" @click.prevent="loopPlaying ? stopLoopPlay():showLoopPlayListDlg()" :title="loopPlaying ? '停止轮巡播放':'选择轮巡播放通道'">
          <i  v-if="loopPlaying" style="color:#dd4b39;" class="fa fa-stop"></i>
          <span v-else>轮播</span>
        </el-button>
        <el-button type="primary" size="medium" v-if="!isMobile()" id="full-btn-medium" @click.prevent="fullscreen" title="全屏显示"><i class="fa fa-arrows-alt"></i></el-button>
        <el-button type="primary" size="medium" v-if="!loopPlaying && hasLocalData()" @click.prevent="loadLocalData(true)" title="点击加载上次记录"><i class="fa fa-database"></i></el-button>
      </el-button-group>
    </div>
  </div>
  <div class="row visible-xs text-center">
    <el-button-group class="player-btn-group">
      <el-button type="primary" size="mini" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
    </el-button-group>
  </div>
  <br><br class="hidden-xs">
  <div class="view-list row">
    <div class="col-md-3" id="dev-tree-left">
      <div autocomplete="off" spellcheck="false">
          <div class="form-group form-group-sm">
              <!-- <label>搜索</label> -->
              <input type="text" class="form-control" placeholder="搜索" v-model="q" @keydown.enter.prevent ref="q">
          </div>
      </div>
      <ul class="nav nav-tabs">
        <li class="active" @click="switchTab('dev')"><a href="#dev-tree-wrapper" data-toggle="tab">设备树</a></li>
        <li @click="switchTab('group')"><a href="#group-tree-wrapper" data-toggle="tab">分 组</a></li>
      </ul>
      <div class="tab-content" style="margin: 10px 0;" id="tab-tree-wrapper">
        <div class="tab-pane active" ref="devTreeWrapper" id="dev-tree-wrapper">
          <el-tree ref="queryDevTree" id="query-dev-tree" node-key="key" v-if="showQueryDevTree" :data="queryDevTreeDataList"
            :props="treeProps" :load="queryDevTreeLoad" lazy :empty-text="queryDevTreeEmptyText"
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': treeLeaf(data) && data.status === 'ON'}">
                <i :class="['fa', {
                  'fa-sitemap' : !treeLeaf(data),
                  'fa-camera': treeLeaf(data)
                }]"></i>
                <span class="ellipsis" style="user-select:none;" :title="node.label">{{node.label}}</span>
              </span>
            </span>
          </el-tree>
          <el-tree ref="devTree" id="dev-tree" node-key="key" v-if="showTree" v-show="!showQueryDevTree"
            :props="treeProps" :load="treeLoad" :filter-node-method="devTreeFilter" lazy :empty-text="treeEmptyText" :default-expanded-keys="defExpandDevs"
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': treeLeaf(data) && data.status === 'ON'}">
                <i :class="['fa', {
                  'fa-sitemap' : !treeLeaf(data),
                  'fa-camera': treeLeaf(data)
                }]"></i>
                <span class="ellipsis" style="user-select:none;" :title="node.label">{{node.label}}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="tab-pane" ref="groupTreeWrapper" id="group-tree-wrapper">
          <el-tree ref="queryGroupTree" id="query-group-tree" node-key="key" v-if="showQueryGroupTree" :data="queryGroupTreeDataList"
            :props="treeProps" :load="queryGroupTreeLoad" lazy :empty-text="queryGroupTreeEmptyText"
            :draggable="hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')" :allow-drag="allowDrag" :allow-drop="allowDrop" @node-drop="handleDrop"
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': treeLeaf(data) && data.status === 'ON'}">
                <i :class="['fa', {
                  'fa-sitemap' : !treeLeaf(data),
                  'fa-camera': treeLeaf(data)
                }]"></i>
                <span class="ellipsis" style="user-select:none;" :title="node.label">{{node.label}}</span>
              </span>
            </span>
          </el-tree>
          <el-tree ref="groupTree" id="group-tree" node-key="key" v-if="showGroupTree" v-show="!showQueryGroupTree"
            :props="treeProps" :load="groupTreeLoad" :filter-node-method="groupTreeFilter" lazy :empty-text="groupTreeEmptyText" :default-expanded-keys="defExpandGroups"
            :draggable="hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')" :allow-drag="allowDrag" :allow-drop="allowDrop" @node-drop="handleDrop"
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': treeLeaf(data) && data.status === 'ON'}">
                <i :class="['fa', {
                  'fa-home': !data.code,
                  'fa-sitemap' : data.code && !treeLeaf(data),
                  'fa-camera': treeLeaf(data)
                }]"></i>
                <span v-if="node.level > 1 || data.subCount > 0 || q || isMobile() || !hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')"
                  class="ellipsis" style="user-select:none;" :title="node.label">
                  {{node.label}}
                </span>
                <el-tooltip v-else content="右键创建分组" placement="right" manual :value="showTip">
                  <span class="ellipsis" style="user-select:none;" :title="node.label">{{node.label}}</span>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
    </div> <!-- dev-tree-left -->
    <VueContextMenu class="right-menu" :target="contextMenuTarget" :show="contextMenuVisible" @update:show="(show) => contextMenuVisible = show">
      <a role="button" @click="treeNodeRefresh(pnode)" v-show="contextMenuNodeData">
        <i class="fa fa-refresh"></i> 刷新节点
      </a>
      <a role="button" @click="showNodeAddDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-plus"></i> 新建分组
      </a>
      <a role="button" @click="showNodeAddDlg" v-show="contextMenuNodeData && !contextMenuNodeData.custom && contextMenuNodeData.manufacturer === 'virtual' && contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '超级管理员')">
        <i class="fa fa-plus"></i> 新建节点
      </a>
      <a role="button" @click="showNodeImportDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-arrow-right"></i> 导入设备
      </a>
      <a role="button" @click="exportGroup" v-show="contextMenuNodeData && contextMenuNodeData.custom && !contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '超级管理员')">
        <i class="fa fa-download"></i> 导出分组
      </a>
      <a role="button" @click="importGroup" v-show="contextMenuNodeData && contextMenuNodeData.custom && !contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '超级管理员')">
        <i class="fa fa-upload"></i> 导入分组
      </a>
      <a role="button" @click="showCustomListDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom && contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-check"></i> 选择通道
      </a>
      <a role="button" @click="showNodeEditDlg" v-show="contextMenuNodeData && !(contextMenuNodeData.custom && !contextMenuNodeData.code) && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-edit"></i> 编辑名称
      </a>
      <a role="button" @click="showNodeShareDlg" v-show="contextMenuNodeData && contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '超级管理员')">
        <i class="fa fa-share"></i> 共享节点
      </a>
      <a role="button" @click="removeCustomNode" v-show="contextMenuNodeData && contextMenuNodeData.custom && contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-remove"></i> 删除分组
      </a>
      <a role="button" @click="removeCustomNode" v-show="contextMenuNodeData && !contextMenuNodeData.custom && contextMenuNodeData.code && pnode && pnode.data && pnode.data.custom && hasAnyRole(serverInfo, userInfo, '管理员', '超级管理员')">
        <i class="fa fa-remove"></i> 移出分组
      </a>
      <a role="button" @click="removeVirtualNode" v-show="contextMenuNodeData && !contextMenuNodeData.custom && contextMenuNodeData.manufacturer === 'virtual' && contextMenuNodeData.code && hasAnyRole(serverInfo, userInfo, '超级管理员')">
        <i class="fa fa-remove"></i> 删除节点
      </a>
    </VueContextMenu>
    <div id="dev-tree-right" class="row col-md-9" data-sticky-wrap data-sticky-for="1000" data-sticky-class="sticky">
      <div class="video-show col-md-9 col-lg-10">
        <div>
          <div v-for="(player,index) in players" :key="index" class="no-margin no-padding video"
            @mousemove="resetCloseTimer(player)" @touchstart="resetCloseTimer(player)" @click="clickPlayer(player, index, $event)" @touchend="clickPlayer(player, index, $event)"
            :class="{'active': index == playerIdx, 'col-sm-12': playerLength == 1,'col-sm-6': playerLength == 4,'col-sm-4': playerLength == 9,'col-sm-3': playerLength == 16}">
            <LivePlayer :hideBigPlayButton="!!serverInfo.HideBigPlayButton || loopPlaying" :videoUrl="player.url"
              :smart="player.bSmart" :poster="player.poster" :controls="player.bControls && !loopPlaying" live muted stretch
              @fullscreen="onFullscreenChange(player, index, $event)" @message="$message"
              v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" :loading.sync="player.bLoading">
              <div class="ptz-block ptz-block-fs" v-show="!isMobile() && player.bFullscreen && player.bControls">
                <div class="ptz-cell ptz-up" @mousedown.prevent="ptzControl" command="up" title="上">
                  <i class="fa fa-chevron-up"></i>
                </div>
                <div class="ptz-cell ptz-left" @mousedown.prevent="ptzControl" command="left" title="左">
                  <i class="fa fa-chevron-left"></i>
                </div>
                <div class="ptz-center" title="云台控制">
                  <i class="fa fa-arrows"></i>
                </div>
                <div class="ptz-cell ptz-right" @mousedown.prevent="ptzControl" command="right" title="右">
                  <i class="fa fa-chevron-right"></i>
                </div>
                <div class="ptz-cell ptz-down" @mousedown.prevent="ptzControl" command="down" title="下">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="ptz-cell ptz-zoomin" @mousedown.prevent="ptzControl" command="zoomin" title="放大">
                  <i class="fa fa-plus-circle"></i>
                </div>
                <div class="ptz-cell ptz-talk" v-if="canTalk() && serverInfo.VersionType != '标准版'">
                  <i class="fa fa-microphone" @mousedown.prevent="talkStart"></i>
                </div>
                <div class="ptz-cell ptz-zoomout" @mousedown.prevent="ptzControl" command="zoomout" title="缩小">
                  <i class="fa fa-minus-circle"></i>
                </div>
              </div>
            </LivePlayer>
            <div class="video-title" v-if="bVideoTitle && player.title" :title="player.title">{{player.title}}</div>
            <div class="video-close" v-show="player.url && player.bCloseShow && !loopPlaying" v-on:click="closeVideo(index, true)">关闭</div>
            <div class="video-close channel-selector" v-show="!player.url && player.bCloseShow && !loopPlaying" v-on:click="selectChannel(index, player)">选择通道</div>
          </div>
          <ScreenChannelListDlg ref="channelListFullscreenDlg" @selected="play" :title="channelListDlgTitle"></ScreenChannelListDlg>
        </div>
        <div class="clearfix"></div>
        <div class="text-center" v-if="isDemoUser(serverInfo, userInfo)">
          <br>
          提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
        </div>
      </div>
      <div class="col-md-3 col-lg-2" id="dev-tree-ptz" v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员')">
        <div class="ptz-block">
            <el-progress class="mic-level-bar" :percentage="level" :text-inside="true" v-if="ws"></el-progress>
            <div class="ptz-cell ptz-up" :class="{'readonly': !playing || loopPlaying }" command="up" title="上" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-up"></i>
            </div>
            <div class="ptz-cell ptz-left" :class="{'readonly': !playing || loopPlaying }" command="left" title="左" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="ptz-cell ptz-center" title="云台控制">
                <i class="fa fa-microphone" :class="{'readonly': !playing || loopPlaying }" title="按住喊话" @mousedown.prevent="talkStart"  @touchstart.prevent="talkStart" v-if="canTalk() && serverInfo.VersionType != '标准版'"></i>
                <i class="fa fa-microphone-slash" :class="{'readonly': !playing || loopPlaying }" title="由于浏览器安全策略, 非 HTTPS 或 localhost 访问, 对讲不可用" v-if="!canTalk() && serverInfo.VersionType != '标准版'"></i>
            </div>
            <div class="ptz-cell ptz-right" :class="{'readonly': !playing || loopPlaying }" command="right" title="右" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-right"></i>
            </div>
            <div class="ptz-cell ptz-down" :class="{'readonly': !playing || loopPlaying }" command="down" title="下" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-down"></i>
            </div>
            <div class="ptz-cell ptz-zoomin" :class="{'readonly': !playing || loopPlaying }" command="zoomin" title="放大" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-plus"></i>
            </div>
            <div class="ptz-cell ptz-zoomout" :class="{'readonly': !playing || loopPlaying }" command="zoomout" title="缩小" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-minus"></i>
            </div>
        </div>
        <div class="settings-block">
          <el-checkbox v-model.trim="bVideoTitle" name="bVideoTitle">
            显示名称
          </el-checkbox>
          <br>
          <el-checkbox v-model.trim="bSmartStream" name="bSmartStream" v-if="playerLength > 1">
            智能码流
          </el-checkbox>
        </div>
      </div> <!-- dev-tree-ptz -->
    </div> <!-- dev-tree-right -->
  </div> <!-- view-list -->
  <UploadDlg ref="uploadDlg" title="上传分组列表" url="/api/v1/channel/group/import" @uploaded="uploaded"></UploadDlg>
  <ScreenChannelListDlg ref="channelListDlg" @selected="play" :title="channelListDlgTitle"></ScreenChannelListDlg>
  <ScreenLoopPlayListDlg ref="loopPlayListDlg" @loopPlay="startLoopPlay"></ScreenLoopPlayListDlg>
  <DeviceTreeNodeEditDlg ref="nodeEditDlg" @submit="treeNodeRefresh(pnode)"></DeviceTreeNodeEditDlg>
  <DeviceTreeNodeShareDlg ref="nodeShareDlg"></DeviceTreeNodeShareDlg>
  <ChannelCustomListDlg ref="customListDlg" @hide="treeNodeRefresh(pnode)" size="modal-lg" :title="customListDlgTitle"></ChannelCustomListDlg>
</div>
</template>

<script>
import Sticky from "sticky-js";
import "jquery-ui/ui/widgets/draggable";
import UploadDlg from "components/UploadDlg.vue";
import ScreenChannelListDlg from "components/ScreenChannelListDlg.vue";
import ScreenLoopPlayListDlg from "components/ScreenLoopPlayListDlg.vue";
import LivePlayer from "@liveqing/liveplayer";
import _ from 'lodash';
import { mapState } from "vuex";
import { component as VueContextMenu } from '@xunlei/vue-context-menu';
import DeviceTreeNodeEditDlg from 'components/DeviceTreeNodeEditDlg.vue';
import DeviceTreeNodeShareDlg from 'components/DeviceTreeNodeShareDlg.vue';
import ChannelCustomListDlg from 'components/ChannelCustomListDlg.vue';

export default {
  components: {
    LivePlayer, VueContextMenu,
    UploadDlg, ScreenChannelListDlg, DeviceTreeNodeEditDlg, DeviceTreeNodeShareDlg, ChannelCustomListDlg, ScreenLoopPlayListDlg
  },
  data() {
    return {
      q: "",
      players: [],
      playerIdx: 0,
      playerLength: 4,
      loadedData: false,
      localData: {
          num1: {},
          num4: {},
          num9: {},
          num16: {}
      },
      channelListDlgTitle: "",
      protocol: "",
      showTree: true,
      showGroupTree: true,
      showTip: false,
      treeLoading: false,
      groupTreeLoading: false,
      queryDevTreeLoading: false,
      queryGroupTreeLoading: false,
      defExpandDevs: [],
      defExpandGroups: [],
      devLevelFilter: false,
      groupLevelFilter: false,
      fullscreenFlag: false,
      pnode: null,
      contextMenuTarget: null,
      contextMenuVisible: false,
      contextMenuNodeData: null,
      treeProps: {
        label: (data, node) => {
          node.serial = data.serial;
          node.code = data.code;
          var label = (data.customName || data.name || data.code || data.id);
          if(data.custom && !data.code && !this.hasAllChannel(this.serverInfo, this.userInfo)) {
            return label;
          }
          if(!this.treeLeaf(data) && data.subCountDevice > 0) {
            label += ` [${data.onlineSubCount}/${data.subCountDevice}]`;
          }
          return label;
        },
        isLeaf: (data, node) => {
          return this.treeLeaf(data);
        },
        disabled: (data, node) => {
          return this.treeLeaf(data) && data.status != "ON";
        }
      },
      customListDlgTitle: "选择通道",
      sticky: null,
      bSmartStream: false,
      bVideoTitle: false,
      ws: null,
      level: 0,
      loopChannelIndex: 0,
      loopPlayerIndex: 0,
      loopPlaying: false,
      loopChannels: [],
      loopInterval: 10,
      loopTimer: 0,
      bPlayerFullscreen: false, // any player is fullscreen
      queryDevTreeDataList: [],
      queryGroupTreeDataList: [],
      activeTab: "dev",
    };
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"]),
    playerBtnGroup() {
      var list = [{
        num: 1,
        name: "单屏"
      }, {
        num: 4,
        name: "四分屏"
      }, {
        num: 9,
        name: "九分屏"
      }];
      if(!this.isIE() && !this.isMobile()) {
        list.push({
          num: 16,
          name: "十六分屏"
        })
      }
      return list;
    },
    playing() {
      var player = this.players[this.playerIdx]||{};
      return !!player.url;
    },
    canPTZ() {
      var player = this.players[this.playerIdx]||{};
      return !!player.url && (player.ptzType === 0 || player.ptzType === 1);
    },
    treeEmptyText() {
      return this.treeLoading ? "加载中..." : "暂无数据";
    },
    groupTreeEmptyText() {
      return this.groupTreeLoading ? "加载中..." : "暂无数据";
    },
    queryDevTreeEmptyText() {
      return this.queryDevTreeLoading ? "搜索中..." : "暂无搜索结果";
    },
    queryGroupTreeEmptyText() {
      return this.queryGroupTreeLoading ? "搜索中..." : "暂无搜索结果";
    },
    showQueryDevTree() {
      if (!this.q) return false;
      if (this.activeTab == 'dev' && this.devLevelFilter) {
        this.queryDevTreeLoading = true;
        return true;
      }
      return false;
    },
    showQueryGroupTree() {
      if (!this.q) return false;
      if (this.activeTab == 'group' && this.groupLevelFilter) {
        this.queryGroupTreeLoading = true;
        return true;
      }
      return false;
    }
  },
  mounted() {
    if(this.isMobile()) {
      this.playerLength = 1;
    }
    this.setPlayerLength(this.playerLength);
    this.protocol = this.getQueryString("protocol", this.serverInfo.PreferStreamFmt||"");
    this.loadLocalData(false);
    this.contextMenuTarget = document.querySelector('#tab-tree-wrapper');
    $(document).on("mouseup touchend", this.mouseUp);
    $(document).on('expanded.pushMenu collapsed.pushMenu', this.updateSticky);
    this.sticky = new Sticky("#dev-tree-right");
    $('a[href="#group-tree-wrapper"').on('shown.bs.tab', e => {
      this.showTip = true;
    }).on('hidden.bs.tab', e => {
      this.showTip = false;
    });
  },
  beforeDestroy() {
    this.ctrlStop();
    $('a[href="#group-tree-wrapper"').off('shown.bs.tab').off('hidden.bs.tab');
    $(document).off("mouseup touchend", this.mouseUp);
    $(document).off('expanded.pushMenu collapsed.pushMenu', this.updateSticky);
    this.clearVideos();
    if (this.sticky) {
        this.sticky.destroy();
        this.sticky = null;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.protocol = vm.getQueryString("protocol", vm.serverInfo.PreferStreamFmt||"");
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.clearVideos();
    this.protocol = this.getQueryString("protocol", this.serverInfo.PreferStreamFmt||"");
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.clearVideos();
    next();
  },
  watch: {
    q: function(newVal, oldVal) {
      if (!newVal) {
        this.treeRefresh();
        return
      }
      if (this.showQueryDevTree) {
        this.doDelayQueryDevSearch();
      } else if (this.showQueryGroupTree) {
        this.doDelayQueryGroupSearch();
      } else {
        this.doDelaySearch();
      }
    },
    bSmartStream: function(newVal, oldVal) {
      for (let idx in this.players) {
        let player = this.players[idx];
        if (!player) continue;
        let _url = player.url;
        if (!_url) continue;
        player.url = "";
        player.bSmart = newVal;
        this.$nextTick(() => {
          player.url = _url;
        })
      }
    }
  },
  methods: {
    doDelaySearch: _.debounce(function() {
      if (this.activeTab == "dev" && !this.devLevelFilter) {
        this.$refs['devTree'].filter(this.q);
      }
      if (this.activeTab == "group" && !this.groupLevelFilter) {
        this.$refs['groupTree'].filter(this.q);
      }
    }, 800),
    doDelayQueryDevSearch: _.debounce(function() {
      this.queryDevTreeData();
    }, 800),
    doDelayQueryGroupSearch: _.debounce(function() {
      this.queryGroupTreeData();
    }, 800),
    hasLocalData() {
        if (localStorage['livegbs_screen']) {
            for (let index = 0; index < this.playerLength; index++) {
                if (this.localData["num" + this.playerLength]["c" + index]) {
                    return !this.loadedData;
                }
            }
            this.loadedData = true;
        }
        return false;
    },
    setLocalData() {
      this.loadedData = true;
      localStorage['livegbs_screen'] = JSON.stringify(this.localData);
    },
    loadLocalData(update) {
        if (localStorage['livegbs_screen']) {
          this.localData = JSON.parse(localStorage['livegbs_screen']);
        }
        if (update) {
          if(this.isDemoUser(this.serverInfo, this.userInfo) && this.playerLength > 4) {
              this.$message({
                  type: "error",
                  message: "演示系统请在四分屏体验, 或下载使用"
              })
              return
          }
          this.loadedData = true;
          for (let index = 0; index < this.playerLength; index++) {
              if (this.localData["num" + this.playerLength]["c" + index]) {
                  var c = JSON.parse(this.localData["num" + this.playerLength]["c" + index])
                  this.play(index, c, false)
              }
          }
        }
    },
    getQueryString(name, defVal = "") {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      }
      return defVal;
    },
    clearVideos() {
      if(this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = 0;
      }
      this.loopChannelIndex = 0;
      this.loopPlayerIndex = 0;
      this.loopPlaying = false;
      this.loopChannels = [];
      this.loopInterval = 10;
      for (var idx in this.players) {
        this.closeVideo(idx);
      }
    },
    selectChannel(index) {
      this.showTip = false;
      this.channelListDlgTitle = `为第 ${index+1} 屏选择通道`;
      if(this.fullscreenFlag) {
        this.$refs["channelListFullscreenDlg"].show(index);
      } else {
        this.$refs["channelListDlg"].show(index);
      }
    },
    play(index, channel, next) {
      var i = 0;
      var player = null;
      for (var _player of this.players) {
        if (index == i) {
          player = _player;
          break;
        }
        i++
      }
      if (!player) {
        this.$message({
          type: "error",
          message: "当前播放窗口已被占满！"
        });
        return
      }
      if (player.bLoading) {
        return
      }
      player.bLoading = true;
      if (next) {
        this.setPlayerIdx(index + 1);
      }
      $.get("/api/v1/stream/start", {
        serial: channel.DeviceID,
        code: channel.ID,
      }).then(stream => {
        var videoUrl = this.isMobile() ? stream.HLS : stream.RTMP;
        var protocol = this.isMobile() ? "HLS" : "RTMP";
        if(this.flvSupported()) {
          if(stream.WS_FLV) {
            videoUrl = stream.WS_FLV;
            protocol = "WS_FLV";
          } else if(stream.FLV) {
            videoUrl = stream.FLV;
            protocol = "FLV";
          }
        }
        // if(this.isIE() && i > 0) {
        //   videoUrl = stream.HLS;
        //   protocol = "HLS";
        // }
        var _protocol = String(this.protocol).toUpperCase();
        switch (_protocol) {
          case "WEBRTC":
            if(this.rtcSupported()) {
              videoUrl = stream.WEBRTC || "";
              protocol = "WEBRTC";
            }
            break;
          case "RTMP":
            videoUrl = stream.RTMP || "";
            protocol = "RTMP";
            break;
          case "HLS":
            videoUrl = stream.HLS || "";
            protocol = "HLS";
            break;
          case "FLV":
            if(this.flvSupported() && !this.isIE()) {
              videoUrl = stream.FLV || "";
              protocol = "FLV";
            }
            break;
          case "WS_FLV":
          case "WS-FLV":
            if(this.flvSupported()) {
              videoUrl = stream.WS_FLV || "";
              protocol = "WS_FLV";
            }
            break;
        }
        player.serial = channel.DeviceID;
        player.code = channel.ID;
        player.ptzType = channel.PTZType;
        player.protocol = protocol;
        player.poster = protocol == "RTMP" ? "" : stream.SnapURL;
        player.title = channel.CustomName || channel.Name || stream.ChannelName || channel.ID || "";
        player.bSmart = this.playerLength > 1 && this.bSmartStream;
        player.url = videoUrl; // no need in next tick since player@2.6.9
        this.resetCloseTimer(player);
        if (!this.loadedData) {
          this.localData["num" + this.playerLength] = {}
        }
        this.localData["num" + this.playerLength]["c" + index] = JSON.stringify(channel)
        this.setLocalData();
      }).fail(() => {
        this.$nextTick(() => {
          player.bLoading = false;
        })
      });
    },
    closeVideo(idx, manual = false) {
      var player = this.players[idx];
      if (!player) {
        return;
      }
      if (player.closeTimer) {
        clearTimeout(player.closeTimer);
        player.closeTimer = 0;
      }
      player.bCloseShow = false;
      player.bControls = false;
      player.bLoading = false;
      player.bSmart = false;
      player.bFullscreen = false;
      player.poster = "";
      player.title = "";
      player.url = "";
      player.ptzType = 0;
      player.serial = "";
      player.code = "";
      if (manual) {
          delete this.localData["num" + this.playerLength]["c" + idx];
          this.setLocalData();
      }
    },
    setPlayerLength(len) {
      if(len == this.players.length) {
        return
      }
      this.ctrlStop();
      this.clearVideos();
      this.players = [];
      this.playerLength = len;
      this.loadedData = false;
      this.playerIdx = 0;
      for(var i=0; i < len; i++) {
        this.players.push({
          serial: "",
          code: "",
          url: "",
          protocol: "",
          poster: "",
          title: "",
          bLoading: false,
          bCloseShow: false,
          bControls: false,
          bSmart: false,
          bFullscreen: false,
          closeTimer: 0
        })
      }
    },
    setPlayerIdx(idx) {
      var newIdx = idx % this.players.length;
      if(newIdx != this.playerIdx) {
        this.ctrlStop();
      }
      this.playerIdx = newIdx;
    },
    clickPlayer(player, idx, event) {
      if(!$(event.target).hasClass("video-close")) {
        this.setPlayerIdx(idx);
      }
    },
    onFullscreenChange(player, idx, bFullscreen) {
      if(player) {
        player.bFullscreen = bFullscreen;
        this.bPlayerFullscreen = bFullscreen;
        if(bFullscreen) {
          $(`#dev-tree-right .video-show .video:eq(${idx}) .ptz-block-fs`).draggable({
            handle: '.ptz-center',
            cancel: '.ptz-cell',
            containment: `#dev-tree-right .video-show .video:eq(${idx}) .video-js`,
            delay: 100,
          });
        } else {
          $(`#dev-tree-right .video-show .video:eq(${idx}) .ptz-block-fs`).draggable('destroy');
        }
      }
    },
    fullscreen() {
      if (this.isMobile()) {
        this.$message({
          type: "error",
          message: "请在电脑浏览器上使用该功能"
        });
        return;
      }
      this.$fullscreen.enter(this.$el.querySelector(`.video-show > div`), {
        wrap: false,
        callback: f => {
          this.fullscreenFlag = f;
        }
      });
    },
    resetCloseTimer(player) {
      player.bCloseShow = true;
      player.bControls = true;
      if (player.closeTimer) {
        clearTimeout(player.closeTimer)
      }
      player.closeTimer = setTimeout(() => {
        player.bCloseShow = false;
        if ($(this.$el).find(".ptz-cell.active").length == 0) {
          player.bControls = false;
        }
      }, 2000);
    },
    // tree
    treeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
      this.treeLoading = true;
      $.get("/api/v1/device/channeltree", {
        serial: serial,
        pcode: pcode
      }).then(ret => {
        resolve((ret || []).map((v, idx, arr) => {
          if(!node.level && !this.devLevelFilter) {
            if(arr.length > 100) {
              this.devLevelFilter = true;
            } else if(v.subCount > 1000) {
              this.devLevelFilter = true;
            }
          }
          return Object.assign(v, {
            key: v.id,
          })
        }));
        if(this.q && !node.matched) {
          this.$refs['devTree'].filter(this.q);
        }
      }).always(() => {
        this.$nextTick(() => {
          this.treeLoading = false;
        })
        if(this.q && !this.q.endsWith(" ") && this.q.split(/\s+/).length === node.level && this.devLevelFilter) {
          this.q += " ";
          this.$refs["q"].focus();
        }
      })
    },
    queryDevTreeData() {
      this.queryDevTreeLoading = true;
      this.queryDevTreeDataList = [];
      $.get("/api/v1/device/channellist", {
          q: this.q,
          start: 0,
          limit: 50,
          channel_type: "list",
      }).then(ret => {
          this.queryDevTreeDataList = (ret || []).map((v, idx, arr) => {
            return Object.assign(v, {
              key: v.id,
            })
          });
      }).always(() => {
          this.$nextTick(() => {
            this.queryDevTreeLoading = false;
          })
      });
    },
    queryGroupTreeData() {
      this.queryGroupTreeLoading = true;
      this.queryGroupTreeDataList = [];
      $.get("/api/v1/device/channellist", {
          q: this.q,
          start: 0,
          limit: 50,
          channel_type: "list",
          custom: true,
      }).then(ret => {
          this.queryGroupTreeDataList = (ret || []).map((v, idx, arr) => {
            return Object.assign(v, {
              key: v.id,
            })
          });
      }).always(() => {
          this.$nextTick(() => {
            this.queryGroupTreeLoading = false;
          })
      });
    },
    queryDevTreeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
      if (!serial && !pcode) return;
      this.queryDevTreeLoading = true;
      $.get("/api/v1/device/channeltree", {
        serial: serial,
        pcode: pcode,
      }).then(ret => {
        resolve((ret || []).map((v, idx, arr) => {
          return Object.assign(v, {
            key: v.id,
          })
        }));
      }).always(() => {
        this.$nextTick(() => {
          this.queryDevTreeLoading = false;
        })
      })
    },
    queryGroupTreeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
      if (!serial && !pcode) return;
      this.queryGroupTreeLoading = true;
      $.get("/api/v1/device/grouptree", {
        serial: serial,
        pcode: pcode,
      }).then(ret => {
        resolve((ret || []).map((v, idx, arr) => {
          return Object.assign(v, {
            key: v.id,
          })
        }));
      }).always(() => {
        this.$nextTick(() => {
          this.queryGroupTreeLoading = false;
        })
      })
    },
    groupTreeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
      this.groupTreeLoading = true;
      $.get("/api/v1/device/grouptree", {
        serial: serial,
        pcode: pcode
      }).then(ret => {
        resolve((ret||[]).map((v, idx, arr) => {
          if(!node.level && v.id && this.defExpandGroups.indexOf(v.id) < 0) {
            this.defExpandGroups.push(v.id);
          }
          if(!node.level && !this.groupLevelFilter) {
            if(arr.length > 100) {
              this.groupLevelFilter = true;
            } else if(v.subCount > 1000) {
              this.groupLevelFilter = true;
            }
          }
          return Object.assign(v, {
            key: v.id,
          })
        }));
        if(this.q && !node.matched) {
          this.$refs['groupTree'].filter(this.q);
        }
      }).always(() => {
        this.$nextTick(() => {
          this.groupTreeLoading = false;
        })
        if(this.q && !this.q.endsWith(" ") && this.q.split(/\s+/).length === (node.level - 1) && this.groupLevelFilter) {
          this.q += " ";
          this.$refs["q"].focus();
        }
      })
    },
    devTreeFilter(value, data, node) {
      if (!value) return true;
      if(this.devLevelFilter) {
        var vals = value.trim().split(/\s+/);
        // if(vals.length == 1 && !value.endsWith(" ")) {
        //   return ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(value) >= 0;
        // }
        if(node.level <= 0 || node.level > vals.length) return true;
        var v = vals[node.level - 1];
        if (!v || !data) return true;
        return ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(v) >= 0;
      } else {
        var v = value.trim();
        if (!v) return true;
        if (node.parent && node.parent.matched) {
          node.matched = true;
          return node.matched;
        }
        node.matched = ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(v) >= 0;
        !node.matched && !node.isLeaf && node.expand();
        return node.matched;
      }
    },
    groupTreeFilter(value, data, node) {
      if(!value) return true;
      if(this.groupLevelFilter) {
        var vals = value.trim().split(/\s+/);
        // if(vals.length == 1 && !value.endsWith(" ")) {
        //   return ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(value) >= 0;
        // }
        if((node.level - 1) <= 0 || (node.level - 1) > vals.length) return true;
        var v = vals[node.level - 2];
        if (!v || !data) return true;
        return ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(v) >= 0;
      } else {
        var v = value.trim();
        if (!v) return true;
        if (node.parent && node.parent.matched) {
          node.matched = true;
          return node.matched;
        }
        node.matched = ("" + (data.name||"") + " " + (data.customName||"") + " " + (data.id||"")).indexOf(v) >= 0;
        !node.matched && !node.isLeaf && node.expand();
        return node.matched;
      }
    },
    treeNodeRefresh(node) {
      if(!node || !node.level) {
        this.treeRefresh();
        return
      }
      this.contextMenuVisible = false;
      node.loaded = false;
      node.expand();
    },
    treeNodeRightClick(event, data, node, c) {
      // if(!this.hasAnyRole(this.serverInfo, this.userInfo, '管理员')) return;
      this.showTip = false;
      this.contextMenuNodeData = data;
      this.pnode = node.parent;
      var new_event;
      if(typeof(MouseEvent) === 'function') {
          new_event = new MouseEvent(event.type, event);
      } else {
          new_event = document.createEvent('MouseEvents');
          new_event.initMouseEvent(event.type, true, true, event.view, event.detail,
              event.screenX, event.screenY, event.clientX, event.clientY,
              event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event);
      }
      this.contextMenuTarget.dispatchEvent(new_event);
    },
    treeNodeClick(data, node, c) {
      this.contextMenuNodeData = null;
      if(this.treeLeaf(data)) {
        if (node.timer) {
          clearTimeout(node.timer);
        }
        if (!node.clickCnt || node.clickCnt > 1) {
          node.clickCnt = 1;
        } else {
          node.clickCnt++;
        }
        node.timer = setTimeout(() => {
          node.clickCnt = 0;
          node.timer = 0;
        }, 500);
        if (data.status === "ON" || node.clickCnt == 2) {
          var player = this.players[this.playerIdx]||{};
          if(player.bLoading) return;
          this.closeVideo(this.playerIdx);
          this.$nextTick(() => {
            this.play(this.playerIdx, {
              DeviceID: data.serial,
              ID: data.code,
              PTZType: data.ptzType,
              Name: node.label,
            }, true);
          })
        }
      }
    },
    showNodeEditDlg() {
      this.showTip = false;
      this.contextMenuVisible = false;
      var data = Object.assign({}, this.contextMenuNodeData, { parent: this.getParentData(), add: false});
      this.$refs['nodeEditDlg'].show(data);
    },
    showNodeShareDlg() {
      this.showTip = false;
      this.contextMenuVisible = false;
      this.$refs['nodeShareDlg'].show(this.contextMenuNodeData);
    },
    showNodeAddDlg() {
      this.showTip = false;
      this.contextMenuVisible = false;
      var data = Object.assign({
        serial: this.contextMenuNodeData.serial||'',
        code: '',
        name: '',
        customName: '',
      }, { parent: this.contextMenuNodeData, add: true});
      this.$refs['nodeEditDlg'].show(data, true);
    },
    exportGroup() {
      this.contextMenuVisible = false;
      window.open(`/api/v1/channel/group/export`);
    },
    importGroup() {
      this.contextMenuVisible = false;
      this.$refs['uploadDlg'].show();
    },
    uploaded() {
        this.$message({
            type: 'success',
            message: "上传成功！"
        })
        this.treeRefresh();
        this.$refs['uploadDlg'].hide();
    },
    showNodeImportDlg() {
      this.showTip = false;
      this.contextMenuVisible = false;
      var data = Object.assign({
        serial: this.contextMenuNodeData.serial||'',
        code: '',
        name: '',
        customName: '',
      }, { parent: this.contextMenuNodeData, add:true, import: true});
      this.$refs['nodeEditDlg'].show(data);
    },
    showCustomListDlg() {
      this.showTip = false;
      this.contextMenuVisible = false;
      this.customListDlgTitle = `选择通道(${this.contextMenuNodeData.customName || this.contextMenuNodeData.name || this.contextMenuNodeData.code})`;
      this.$refs['customListDlg'].show(this.contextMenuNodeData.code);
    },
    removeCustomNode() {
      this.showTip = false;
      this.contextMenuVisible = false;
      if(!this.contextMenuNodeData) return;
      var name = this.contextMenuNodeData.customName || this.contextMenuNodeData.name || this.contextMenuNodeData.id;
      var action = this.contextMenuNodeData.custom ? "删除" : "移出";
      this.$confirm(`确认${action} ${name} ?`, "提示").then(() => {
        $.get("/api/v1/channel/remove", {
          serial: this.contextMenuNodeData.serial,
          code: this.contextMenuNodeData.code,
        }).always(() => {
          if(!this.contextMenuNodeData.custom && this.pnode) {
            this.treeNodeRefresh(this.pnode.parent);
            return
          }
          this.treeNodeRefresh(this.pnode);
        });
      }).catch(() => {});
    },
    removeVirtualNode() {
      this.showTip = false;
      this.contextMenuVisible = false;
      if(!this.contextMenuNodeData) return;
      var name = this.contextMenuNodeData.customName || this.contextMenuNodeData.name || this.contextMenuNodeData.id;
      this.$confirm(`确认删除虚拟通道 ${name} ?`, "提示").then(() => {
        $.get("/api/v1/channel/virtual/remove", {
          serial: this.contextMenuNodeData.serial,
          code: this.contextMenuNodeData.code,
        }).always(() => {
          this.treeNodeRefresh(this.pnode);
        })
      }).catch(() => {});
    },
    treeRefresh() {
      this.showTip = false;
      this.contextMenuVisible = false;
      if(this.showQueryDevTree) {
        this.queryDevTreeData();
      } else if(this.showQueryGroupTree) {
        this.queryGroupTreeData();
      } else if(this.activeTab == 'dev') {
        this.showTree = false;
        this.$nextTick(() => {
          this.showTree = true;
        })
      } else if(this.activeTab == 'group') {
        this.showGroupTree = false;
        this.$nextTick(() => {
          this.showGroupTree = true;
        })
      }
    },
    treeLeaf(data) {
      if (data && data.subCount == 0 && data.serial && data.code && !data.custom) {
        if (this.serverInfo.StrictChannelParental && data.parental) return false;
        if (this.serverInfo.StrictChannelCode && data.code.length != 20) return false;
        if (!data.parental || data.manufacturer != 'LiveQing') {
          // if (data.code.length != 20 || (data.code.substring(10, 13) != "216" && data.code.substring(10, 13) != "215" && data.code.substring(10, 13) != "200")) {
          if (data.code.length != 20 || (data.code.substring(10, 13) != "216" && data.code.substring(10, 13) != "215")) {
            return true;
          }
        }
      }
      return false;
    },
    getParentData() {
      if(!this.contextMenuNodeData) return null;
      var ref = "devTree";
      if (this.activeTab == 'group') {
        ref = "groupTree";
      }
      if (this.showQueryDevTree) {
        ref = "queryDevTree";
      }
      if (this.showQueryGroupTree) {
        ref = "queryGroupTree";
      }
      if(!this.$refs[ref]) return null;
      var pNode = this.$refs[ref].getNode(this.contextMenuNodeData);
      if(!pNode) return null;
      if(!pNode.parent) return null;
      return pNode.parent.data;
    },
    // control
    ptzControl(e) {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return;
      var $target = $(e.currentTarget);
      // $.get("/api/v1/control/ptz", {
      //   serial: player.serial,
      //   code: player.code,
      //   command: $target.attr("command")
      // });
      var cmd = $target.attr("command");
      $.ajax({
        method: "GET", // type: "GET", is also ok, method since jquery 1.9
        url: "/api/v1/control/ptz",
        global: false,
        data: {
          serial: player.serial,
          code: player.code,
          command: cmd,
        }
      }).fail(xhr => {
        if(xhr) {
          console.log(`ptz ${cmd} ajax error: ${xhr.status} ${xhr.responseText}`);
          if(xhr.status == 401) {
            this.$nextTick(() => {
              location.href = `/login?r=${encodeURIComponent(window.location.href)}`;
            })
          }
        }
      })
      $target.addClass("active");
    },
    ptzStop() {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return;
      if ($(this.$el).find(".ptz-cell.active").length > 0) {
        // $.get("/api/v1/control/ptz", {
        //   serial: player.serial,
        //   code: player.code,
        //   command: "stop"
        // });
        $.ajax({
          method: "GET", // type: "GET", is also ok, method since jquery 1.9
          url: "/api/v1/control/ptz",
          global: false,
          data: {
            serial: player.serial,
            code: player.code,
            command: "stop",
          }
        }).fail(xhr => {
          if(xhr) {
            console.log(`ptz stop ajax error: ${xhr.status} ${xhr.responseText}`);
            if(xhr.status == 401) {
              this.$nextTick(() => {
                location.href = `/login?r=${encodeURIComponent(window.location.href)}`;
              })
            }
          }
        })
        $(this.$el).find(".ptz-cell.active").removeClass("active");
      }
    },
    talkStart(e) {
      if(!this.ws) {
        var talkURL = this.wsTalkURL();
        if(!talkURL) return;
        this.ws = new WebSocket(talkURL);
        this.ws.onopen = evt => {
          console.log("ws talk open");
        }
        this.ws.onclose = evt => {
          console.log("ws talk close");
        }
        this.ws.onerror = evt => {
          console.log("ws talk error", evt);
        }
      } else if (this.serverInfo.TalkHold) {
        this.talkStop();
        return;
      }
      var $target = $(e.currentTarget);
      if(this.recorder) {
        $target.addClass("active");
        this.recorder.start();
        return;
      }
      LiveRecorder.get((rec, err) => {
        if(err) {
          alert(err);
          this.talkStop();
          return
        }
        // this.$refs["player"].setMuted(true);
        $target.addClass("active");
        this.recorder = rec;
        this.recorder.start();
      }, {
        sampleBits: 16,
        sampleRate: 8000,
        pcmCallback: (pcm, level) => {
          // binary to base64 string
          var reader = new window.FileReader();
          reader.onloadend = () => {
            var base64 = reader.result;
            var base64 = base64.split(',')[1];
            if(this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(base64);
              this.level = level;
            }
          }
          reader.readAsDataURL(pcm);
        }
      })
    },
    talkStop() {
      if(this.recorder) {
        this.recorder.stop();
        // this.recorder = null;
        $(this.$el).find(".fa-microphone.active").removeClass("active");
        // this.$refs["player"].setMuted(false);
      }
      if(this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.level = 0;
    },
    ctrlStop() {
      this.talkStop();
      this.ptzStop();
    },
    mouseUp() {
      if(!this.serverInfo.TalkHold) {
        this.talkStop();
      }
      this.ptzStop();
    },
    wsTalkURL() {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return '';
      var protocal = "ws:";
      if(location.protocol.startsWith("https")) {
        protocal = "wss:";
      }
      //url query param "format=pcm|g711a"
      return `${protocal}//${location.host}/api/v1/control/ws-talk/${player.serial}/${player.code}?format=pcm`;
    },
    updateSticky() {
        this.sticky && this.sticky.update();
    },
    startLoopPlay(channels, interval) {
        this.clearVideos();
        if(this.isDemoUser(this.serverInfo, this.userInfo) && this.playerLength > 4) {
            this.$message({
                type: "error",
                message: "演示系统请在四分屏体验, 或下载使用"
            })
            return
        }
        this.loopChannelIndex = 0;
        this.loopPlayerIndex = 0;
        this.loopPlaying = true;
        this.loopChannels = channels;
        this.loopInterval = interval;
        this.loopPlay();
    },
    stopLoopPlay() {
        this.clearVideos();
    },
    async loopPlay() {
        if (!this.loopPlaying) {
            return
        }
        if (!this.loopChannels || !this.loopChannels.length) {
            this.$message({
                type: "error",
                message: "没有可轮播资源"
            });
            return
        }
        let channelIdx = this.loopChannelIndex % this.loopChannels.length;
        let playerIdx = this.loopPlayerIndex % this.players.length;
        if (playerIdx == 0 && this.loopPlayerIndex > 0) { // 播放器复始
            this.loopPlayerIndex = 0;
            if (channelIdx > 0 || this.loopChannelIndex == 0) { // 点位没有复始
                this.loopTimer = setTimeout(() => {
                    this.loopPlay();
                }, this.loopInterval * 1000)
                return
            }
        }
        if (channelIdx == 0 && this.loopChannelIndex > 0 && this.loopPlayerIndex == 0) { // 点位 & 播放器 复始
            this.loopChannelIndex = 0;
            this.loopTimer = setTimeout(() => {
                this.loopPlay();
            }, this.loopInterval * 1000)
            return
        }
        if(this.bPlayerFullscreen) {
            this.loopTimer = setTimeout(() => {
                this.loopPlay();
            }, this.loopInterval * 1000);
            return
        }
        let nextChannel = this.loopChannels[channelIdx];
        let nextPlayer = this.players[playerIdx];
        if(!nextPlayer || nextPlayer.bFullscreen) {
          this.loopPlayerIndex++; // skip this player
          this.loopPlay();
          return;
        }
        let result = await this.loopPlayChannel(nextChannel, nextPlayer);
        if (result) {
          this.loopChannelIndex++;
          this.loopPlayerIndex++;
        } else {
          // this.loopChannels.splice(this.loopChannelIndex, 1);
          this.loopChannelIndex++; // skip this channel
        }
        this.loopPlay();
    },
    async loopPlayChannel(channel, player) {
        if (!this.loopPlaying) {
          return false;
        }
        if (!channel) {
          return false;
        }

        let stream = await this.loopStreamStart(channel);
        if (!stream) {
            return false;
        }
        if (player) {
          var videoUrl = this.isMobile() ? stream.HLS : stream.RTMP;
          var protocol = this.isMobile() ? "HLS" : "RTMP";
          if(this.flvSupported()) {
            if(stream.WS_FLV) {
              videoUrl = stream.WS_FLV;
              protocol = "WS_FLV";
            } else if(stream.FLV) {
              videoUrl = stream.FLV;
              protocol = "FLV";
            }
          }
          // if(this.isIE() && i > 0) {
          //   videoUrl = stream.HLS;
          //   protocol = "HLS";
          // }
          var _protocol = String(this.protocol).toUpperCase();
          switch (_protocol) {
            case "WEBRTC":
              if(this.rtcSupported()) {
                videoUrl = stream.WEBRTC || "";
                protocol = "WEBRTC";
              }
              break;
            case "RTMP":
              videoUrl = stream.RTMP || "";
              protocol = "RTMP";
              break;
            case "HLS":
              videoUrl = stream.HLS || "";
              protocol = "HLS";
              break;
            case "FLV":
              if(this.flvSupported() && !this.isIE()) {
                videoUrl = stream.FLV || "";
                protocol = "FLV";
              }
              break;
            case "WS_FLV":
            case "WS-FLV":
              if(this.flvSupported()) {
                videoUrl = stream.WS_FLV || "";
                protocol = "WS_FLV";
              }
              break;
          }
          player.serial = channel.DeviceID;
          player.code = channel.ID;
          player.ptzType = channel.PTZType;
          player.protocol = protocol;
          player.poster = protocol == "RTMP" ? "" : stream.SnapURL;
          player.title = channel.CustomName || channel.Name || stream.ChannelName || channel.ID || "";
          player.bSmart = this.playerLength > 1 && this.bSmartStream;
          player.url = videoUrl; // no need in next tick since player@2.6.9
        }
        return true;
    },
    loopStreamStart(channel) {
        return new Promise((resolve, reject) => {
            var param = {
                serial: channel.DeviceID,
                code: channel.ID,
            }
            $.ajax({
              method: "GET",
              url: "/api/v1/stream/start",
              global: false,
              data: param,
            }).then(data => {
                if(!this.loopPlaying) {
                    resolve(null);
                    return
                }
                resolve(data);
            }).fail(xhr => {
              if(xhr) {
                console.log(`stream start in loop play error: ${xhr.status} ${xhr.responseText}`);
                if(xhr.status == 401) {
                  this.$nextTick(() => {
                    location.href = `/login?r=${encodeURIComponent(window.location.href)}`;
                  })
                }
              }
              resolve(null);
            })
        });
    },
    showLoopPlayListDlg(){
      this.showTip = false;
      this.$refs['loopPlayListDlg'].show();
    },
    switchTab(tab) {
      if (this.activeTab != tab) {
        this.q = "";
        this.$nextTick(() => {
          this.activeTab = tab;
        })
      }
    },
    allowDrag(draggingNode) {
      if(draggingNode.level < 2) return false;
      if(!draggingNode.data || !draggingNode.data.code) return false;
      if(!draggingNode.parent || !draggingNode.parent.data) return false;
      if(draggingNode.data.custom || draggingNode.parent.data.custom) {
        this.pnode = draggingNode.parent;
        return true;
      }
      return false;
    },
    allowDrop(draggingNode, dropNode, type) { // type=prev, inner, next
      if(draggingNode.level < 2) return false;
      if(dropNode.level < 1) return false;
      if(!draggingNode.parent || !draggingNode.data || !draggingNode.data.code) return false;
      if(!dropNode.data || !dropNode.data.custom) return false;
      if(!draggingNode.data.custom && !dropNode.data.code) return false;
      if(!dropNode.data.code && !this.hasAnyRole(this.serverInfo, this.userInfo, '超级管理员')) return false;
      if(type == "inner") {
        return true;
      }
      return false;
    },
    handleDrop(draggingNode, dropNode, dropType, event) { // dropType=before, inner, after
      if(dropType != "inner") return;
      $.get("/api/v1/channel/move", {
        serial: draggingNode.data.serial,
        code: draggingNode.data.code,
        pcode: dropNode.data.code,
      }).always(() => {
        if(this.pnode && (!this.pnode.parent || !this.pnode.parent.level)) {
          this.treeRefresh();
          return
        }
        if(!dropNode.parent || !dropNode.parent.level) {
          this.treeRefresh();
          return
        }
        this.treeNodeRefresh(dropNode.parent);
        if(this.pnode && dropNode.parent != this.pnode.parent) {
          this.treeNodeRefresh(this.pnode.parent);
        }
      });
    }
  }, //-- methods
};
</script>



<style lang="less" scoped>
@import url(~assets/styles/variables.less);

.right-menu {
  position: fixed;
  background: #fff;
  border: solid 1px rgba(0, 0, 0, .2);
  border-radius: 3px;
  z-index: 999;
  display: none;
}
.right-menu a {
  width: 100px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  display: block;
  color: #1a1a1a;
}
.right-menu a:hover {
  background: #eee;
  color: #fff;
}
.right-menu {
    border: 1px solid #eee;
    box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
    border-radius: 1px;
}
a {
    text-decoration: none;
}
.right-menu a {
    padding: 2px;
}
.right-menu a:hover {
    background: @base;
}

.view-list {

  .nav.nav-tabs > li {
    a {
      background-color: transparent;
    }
    &.active {
      a {
        background-color: darken(#ecf0f5, 5%);
      }
    }
  }

  .video-show {
    .video {
      border: 1px solid #fff;
    }
    .col-sm-12 {
      &:nth-child(1) {
        border: 0;
      }
    }

    .col-sm-6 {
      &:nth-child(1),
      &:nth-child(2) {
        border-top-color: transparent;
      }

      &:nth-child(2),
      &:nth-child(4) {
        border-right-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(3) {
        border-left-color: transparent;
      }

      &:nth-child(3),
      &:nth-child(4) {
        border-bottom-color: transparent;
      }
    }

    .col-sm-4 {
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        border-top-color: transparent;
      }

      &:nth-child(3),
      &:nth-child(6),
      &:nth-child(9) {
        border-right-color: transparent;
      }

      &:nth-child(7),
      &:nth-child(8),
      &:nth-child(9) {
        border-bottom-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(4),
      &:nth-child(7) {
        border-left-color: transparent;
      }
    }

    .col-sm-3 {
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        border-top-color: transparent;
      }

      &:nth-child(4),
      &:nth-child(8),
      &:nth-child(12),
      &:nth-child(16) {
        border-right-color: transparent;
      }

      &:nth-child(13),
      &:nth-child(14),
      &:nth-child(15),
      &:nth-child(16) {
        border-bottom-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(5),
      &:nth-child(9),
      &:nth-child(13) {
        border-left-color: transparent;
      }
    }
  }
}

.fullscreen {
  width: 100% !important;
}

.video-close {
  position: absolute;
  top: 5px;
  right: 5px;
  color: white;
  font-size: 12px;
  background-color: fade(gray, 50%);
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 2px;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.video-title {
  position: absolute;
  top: 5px;
  left: 5px;
  color: white;
  font-size: 14px;
  background-color: fade(gray, 50%);
  padding: 2px 5px;
  border-radius: 2px;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.player-btn-group {
  margin: 5px 0;

  .el-button--primary {
    color: @base;
    background: #ffffff;
    border: 1px solid #dcdfe6 !important;
  }

  .active {
    background-color: @base-active;
    color: #ffffff;
  }
}

#dev-tree, #group-tree {
  min-height: 200px;
  overflow: auto;
  background-color: transparent;

  @media screen and (max-width: 992px) {
    max-height:200px;
  }
}

#query-dev-tree, #query-group-tree {
  min-height: 200px;
  overflow: auto;
  @media screen and (max-width: 992px) {
    max-height:200px;
  }
}

.el-tree-node.is-drop-inner > .el-tree-node__content .custom-tree-node {
  background-color: @base;
  color: #fff;
}
</style>

<!-- ptz style -->
<style lang="less" scoped>
.settings-block {
  margin: 30px auto;
  text-align: center;
}
.ptz-block {
  width: 150px;
  height: 180px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  font-size: 24px;

  .ptz-cell {
    width: 50px;
    height: 50px;
    line-height: 50px;
    position: absolute;
  }

  .ptz-cell.active {
    color: #ccc;
    font-size: 26px;
  }
  .ptz-cell.readonly {
    color: #ddd;
  }
  .fa-microphone, .fa-microphone-slash {
    padding: 10px 13px;
    border-radius: 25px;
  }
  .fa-microphone.active {
    color: #FFF;
  }
  .fa-microphone.readonly {
    color: #ddd;
  }
  .fa-microphone-slash.readonly {
    color: #ddd;
  }
  .mic-level-bar {
    position: absolute;
    transform: rotate(-90deg);
    width: 100%;
    top: 70px;
    left: -80px;
  }

  .ptz-center {
    width: 50px;
    height: 50px;
    top: 50px;
    left: 50px;
    line-height: 50px;
    border-radius: 25px;
    background-color: #ccc;
  }

  .ptz-up {
    top: 0;
    left: 50px;
  }

  .ptz-left {
    top: 50px;
    left: 0;
  }

  .ptz-right {
    top: 50px;
    left: 100px;
  }

  .ptz-down {
    top: 100px;
    left: 50px;
  }

  .ptz-zoomin {
    top: 150px;
    left: 20px;
  }

  .ptz-zoomout {
    top: 150px;
    left: 80px;
  }

  .ptz-talk {
    top: 150px;
    left: 50px;
  }

  .ptz-up,
  .ptz-left,
  .ptz-right,
  .ptz-down,
  .ptz-center > .fa-microphone,
  .ptz-zoomin,
  .ptz-talk > .fa-microphone,
  .ptz-zoomout {
    cursor: pointer;

    &.readonly {
      cursor: auto;
    }
  }
}

.ptz-block-fs {
  position: fixed;
  margin: 0;
  margin-bottom: 50px;
  top: 0;
  right: 0;
  height: 200px;
  // border-radius: 16px;
  // background: fade(#eee, 20%);
  .ptz-center {
    cursor: move;
    position: absolute;
  }
  .fa-microphone.active {
    color: #ccc;
  }
  .ptz-zoomin {
    left: 15px;
  }
  .ptz-zoomout {
    left: 85px;
  }
}
</style>

<style lang="less">
.ptz-block {
  .mic-level-bar {
    .el-progress-bar__outer {
      background-color: #ddd !important;
    }
  }
}

.view-list {
    .video-show {
        :not(:fullscreen) {
            .video.active .video-inner {
                border: 2px solid red;
            }
        }
    }
}

.fullscreen {
    & > .video {
        &.col-sm-12 {
            height: 100%;
        }
        &.col-sm-6 {
            height: 50%;
        }
        &.col-sm-4 {
            height: 33.33%;
        }
        &.col-sm-3 {
            height: 25%;
        }
        & > .player-wrapper {
            height: 100%;
            .video-wrapper {
                padding-bottom: 0 !important;
                height: 100%;
            }
        }
    }
}
</style>