<template>
<div class="wrapper">
  <div class="content-wrapper">
    <section class="content">
        <h4 class="text-primary text-center" v-if="name">{{name}}</h4>
        <div class="form-inline" autocomplete="off" spellcheck="false" v-if="calendar">
            <div class="form-group pull-right">
                <div class="input-group input-group-sm" v-if="serial && code && type == 'cloud'">
                    <CloudRecordDatePicker class="form-control" ref="datePicker"
                      :day="day" @update:day="updateDay" :serial="serial" :code="code" :token="token">
                    </CloudRecordDatePicker>
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-sm btn-default" @click.prevent="showDatePicker">
                          <i class="fa fa-calendar"></i>
                        </button>
                    </div>
                </div>
                <div class="input-group input-group-sm" v-if="type == 'device'">
                    <DatePicker class="form-control" ref="datePicker"
                      @update:day="updateDay" :day="day">
                    </DatePicker>
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-sm btn-default" @click.prevent="showDatePicker">
                          <i class="fa fa-calendar"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="clearfix"></div>
        <br>
        <LivePlayer :videoUrl="videoUrl" v-if="type == 'cloud'"
          :muted="muted" :controls="controls" :stretch="stretch" :autoplay="autoplay" :alt="alt" :debug="debug"
          :hideBigPlayButton="!!serverInfo.HideBigPlayButton"
          :currentTime="currentTime" @ended="onVideoEnd" @timeupdate="onVideoTimeUpdate"
          :loading.sync="loading" v-loading="loading" element-loading-text="加载中" element-loading-background="#000"
          style="margin:0 auto; max-width:700px;">
        </LivePlayer>
        <LivePlayer live :videoUrl="videoUrl" v-if="type == 'device'"
          :muted="muted" :controls="controls" :stretch="stretch" :autoplay="autoplay" :alt="alt" :debug="debug"
          :hideBigPlayButton="!!serverInfo.HideBigPlayButton"
          :currentTime="currentTime" @ended="onDeviceVideoEnd" @error="onDeviceVideoError" @timeupdate="onDeviceVideoTimeUpdate"
          :loading.sync="loading" v-loading="loading" element-loading-text="加载中" element-loading-background="#000"
          style="margin:0 auto; max-width:700px;">
        </LivePlayer>
        <div class="text-center" v-if="isDemoUser(serverInfo, userInfo)">
            <br>
            提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请联系管理员
        </div>
        <br>
        <br>
        <CloudRecordTimeRule ref="timeRule" v-if="type == 'cloud'"
          :videos="videos" :start="start" :end="end" :minutesPerUnit="minutesPerUnit" @timeChange="onTimeChange"  v-loading="loadingRecords">
        </CloudRecordTimeRule>
        <TimeRule ref="timeRule" v-if="type == 'device'"
          :videos="videos" :start="start" :end="end" :minutesPerUnit="minutesPerUnit" @timeChange="onTimeChange" v-loading="loadingRecords">
        </TimeRule>
        <br>
    </section>
  </div>
  <resize-observer @notify="handleResize"/>
</div>
</template>

<script>
import "font-awesome/css/font-awesome.css"
import "bootstrap/dist/css/bootstrap.css"
import "admin-lte/dist/css/skins/_all-skins.css"
import 'vue-resize/dist/vue-resize.css'
import "assets/styles/AdminLTE-custom.less"
import "assets/styles/custom.less"

import "bootstrap/dist/js/bootstrap.js"
import "admin-lte/dist/js/adminlte.js"

import 'assets/bootstrap-datepicker-1.7.1/css/bootstrap-datepicker3.less'
import 'assets/bootstrap-datepicker-1.7.1/js/bootstrap-datepicker.js'
import 'assets/bootstrap-datepicker-1.7.1/locales/bootstrap-datepicker.zh-CN.min.js'

import {
  mapState,
  mapActions
} from "vuex"
import Vue from "vue"
import moment from "moment"

import ElementUI from "element-ui"
import "assets/styles/element-custom.scss"
Vue.use(ElementUI);

import VueResize from 'vue-resize'
Vue.use(VueResize);

Vue.prototype.$updateQueryString = (uri, key, value) => {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  } else {
    return uri + separator + key + "=" + value;
  }
}
Vue.prototype.$getQueryString = (name, defVal = "") => {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return defVal;
}
Vue.prototype.$iframe = (link, w, h) => {
  var _link = Vue.prototype.$updateQueryString(link, "aspect", "fullscreen")
  return `<iframe src="${_link}" width="${w}" height="${h}" allowfullscreen allow="autoplay; fullscreen"></iframe>`
}
Vue.prototype.isMobile = () => {
  return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
}
Vue.prototype.isIE = () => {
  return !!videojs.browser.IE_VERSION;
}
Vue.prototype.flvSupported = () => {
  return videojs.browser.IE_VERSION || (flvjs.getFeatureList() && flvjs.getFeatureList().mseLiveFlvPlayback);
}
Vue.prototype.rtcSupported = () => {
    return !!window.RTCPeerConnection;
}
Vue.prototype.hasAnyRole = (serverInfo, userInfo, ...roles) => {
    // toggle share on, no need login
    // if (serverInfo && serverInfo.APIAuth === false && !userInfo) {
    if (!userInfo) {
        return true;
    }
    var userRoles = [];
    if (userInfo) {
        userRoles = userInfo.Roles || [];
    }
    var checked = false;
    for(var role of (roles||[])) {
        if (!role || userRoles.some(ur => (ur == role || ur == '超级管理员'))) {
            checked = true;
            break;
        }
    }
    return checked;
}
Vue.prototype.isDemoUser = (serverInfo, userInfo) => {
  if (serverInfo && userInfo && userInfo.Name === serverInfo.DemoUser) return true;
  return false;
}

import CloudRecordDatePicker from 'components/CloudRecordDatePicker.vue'
import CloudRecordTimeRule from 'components/CloudRecordTimeRule.vue'
import DatePicker from 'components/DatePicker.vue'
import TimeRule from 'components/TimeRule.vue'
import LivePlayer from '@liveqing/liveplayer'
import $ from "jquery"
import "@penggy/jquery.nicescroll"
$.ajaxSetup({ cache: false });
export default {
  components: {
    LivePlayer,
    CloudRecordDatePicker,
    CloudRecordTimeRule,
    DatePicker,
    TimeRule,
  },
  data() {
    return {
      name: "",
      videoUrl: "",
      loading: false,
      loadingRecords: false,
      title: "",
      serial: "",
      code: "",
      type: "",
      protocol: "",
      alt: "无信号",
      stretch: false,
      autoplay: true,
      controls: true,
      debug: false,
      calendar: true,
      token: "",
      muted: true,
      otherParams: "",
      nice: null,
      day: moment().format('YYYYMMDD'),
      timerange: [
        moment(moment().format('YYYYMMDD'), "YYYYMMDD").startOf('hour').toDate(),
        moment(moment().format('YYYYMMDD'), "YYYYMMDD").startOf('hour').toDate()
      ],
      currentTime: 0,
      minutes: 0,
      videos: [],
      video: null,
      streamID: "",
      records: [],
      recordListTimeout: 0,
      center: "",
      indistinct: "",
      switchTimer: 0,
      minutesPerUnit: 5,
      start: 0,
      end: 0,
    };
  },
  beforeDestroy() {
    this.videoUrl = "";
  },
  created(){
    this.token = this.$getQueryString("token","");
    this.alt = this.$getQueryString("alt", "无信号");
  },
  async mounted() {
    var serverInfo = await this.getServerInfo();
    if (serverInfo) {
      document.title = serverInfo.LogoText || "OneGBS";
    }
    var payload = {};
    if(this.token) {
      payload["token"] = this.token;
    }
    await this.getUserInfo(payload);
    this.calendar = this.$getQueryString("calendar", "yes") == "yes";
    this.autoplay = this.$getQueryString("autoplay", "yes") == "yes";
    this.controls = this.$getQueryString("controls", "yes") == "yes";
    this.stretch = this.$getQueryString("stretch", "no") == "yes";
    this.serial = this.$getQueryString("serial", "");
    this.code = this.$getQueryString("code", "");
    this.center = this.$getQueryString("center", "");
    this.indistinct = this.$getQueryString("indistinct", "");
    this.protocol = this.$getQueryString("protocol", serverInfo.PreferStreamFmt||"");
    this.debug = this.$getQueryString("debug") == "yes";
    this.token = this.$getQueryString("token", "");
    this.muted = this.$getQueryString("muted", "yes") == "yes";
    this.name = this.$getQueryString("name", "");
    var day = this.$getQueryString("day", moment().format('YYYYMMDD'));
    if(day) {
      if(moment(day, 'YYYYMMDD').isValid()) {
        this.day = day;
      } else {
        console.log(`invalid day[${day}]`);
      }
    }
    var minutes = this.$getQueryString("minutes", "");
    if(minutes) {
      this.minutes = parseInt(minutes) || 0;
      if(this.minutes < 0) {
        this.minutes = 0;
      }
      if(this.minutes > 1439) {
        this.minutes = 1439;
      }
    }
    var start = this.$getQueryString("start", "0");
    if(start) {
      this.start = parseInt(start) || 0;
      if(this.start < 0) {
        this.start = 0;
      }
      if(this.start > 1439) {
        this.start = 1439;
      }
      if(this.minutes < this.start) {
        this.minutes = this.start;
      }
    }
    var end = this.$getQueryString("end", "0");
    if(end) {
      this.end = parseInt(end) || 0;
      if(this.end < 0) {
        this.end = 0;
      }
      if(this.end > 1439) {
        this.end = 1439;
      }
      if(this.end && this.minutes > this.end) {
        this.minutes = this.end;
      }
    }
    var unit = this.$getQueryString("unit", this.$getQueryString("minutesPerUnit", "5"));
    if(unit) {
      this.minutesPerUnit = parseInt(unit) || 5;
      if (this.minutesPerUnit < 1 || this.minutesPerUnit > 60) {
        this.minutesPerUnit = 5;
      }
    }
    var recordListTimeout = this.$getQueryString("record_list_timeout", "")
    if(recordListTimeout) {
      this.recordListTimeout = parseInt(recordListTimeout) || 0;
      if(this.recordListTimeout < 0) {
        this.recordListTimeout = 0;
      }
    }
    this.type = this.$getQueryString("type", "device");
    this.otherParams = this.getOtherParams(["calendar", "minutes", "start", "end", "unit", "minutesPerUnit", "record_list_timeout", "autoplay", "controls", "stretch", "alt", "type", "serial", "code", "center", "indistinct", "protocol", "muted", "debug"]);
    $(document).ajaxError((evt, xhr, opts, ex) => {
      if (xhr.status == 401) {
        if (this.serverInfo.DemoUser) {
          location.href = `/login?r=${encodeURIComponent(location.href)}`;
        } else {
          console.log("登录认证过期");
        }
        return false;
      } else if (xhr.status) {
        let msg = xhr.responseText || "网络请求失败";
        if (xhr.status == 404) {
          msg = "请求服务不存在或已停止";
        } else if (xhr.status == 504) {
          msg = "Gateway Timeout";
        }
        try {
          msg = JSON.parse(msg)
        } catch (error) {}
        console.log(msg);
      } else if(xhr) {
        console.log(`ajax error: ${xhr.status} ${xhr.responseText}`);
      }
    }).ready(() => {
      this.$nextTick(() => {
        $("body").layout("fix");
        this.fixHover();
        this.initNiceScroll();
      })
    }).on('shown.bs.modal', () => {
        this.removeNiceScroll();
    }).on('hidden.bs.modal', () => {
        this.initNiceScroll();
    });
    if(!this.minutes) {
      let mmt = moment();
      this.minutes = mmt.diff(mmt.clone().startOf('day'), 'minutes');
      this.minutes -= 10;
    }
    if (this.minutes < 0) this.minutes = 0;
    this.$nextTick(() => {
      var timeRule = this.$refs['timeRule'];
      timeRule && timeRule.clickMinute(this.minutes);
      if(this.type == 'cloud') {
        this.loadCloudVideos();
      } else if(this.type == 'device' && !this.calendar) {
        this.timerange[0] = moment(this.day, "YYYYMMDD").startOf('hour').toDate();
        this.timerange[1] = moment(this.day, "YYYYMMDD").startOf('hour').toDate();
        this.getDeviceRecords(true);
      }
    })
  },
  computed: {
    ...mapState(["serverInfo", "userInfo"]),
    videoUrls() {
        return this.videos.map((val, index, array) => {
            return (val || {}).hls;
        });
    }
  },
  methods: {
    ...mapActions(["getServerInfo", "getUserInfo"]),
    initNiceScroll() {
        if(!this.isIE() && !this.isMobile() && !this.nice) {
            this.nice = $('body').niceScroll({
                zindex: 999999,
                cursorwidth: "10px",
                cursoropacitymax: 0.5,
                preservenativescrolling: false,
                enablekeyboard: false,
            });
        }
    },
    removeNiceScroll() {
        if (this.nice) {
            this.nice.remove();
            this.nice = null;
        }
    },
    fixHover() {
      if (videojs.browser.IS_IOS || videojs.browser.IS_ANDROID) {
        for (var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
          var sheet = document.styleSheets[sheetI];
          if (sheet.cssRules) {
            for (var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
              var rule = sheet.cssRules[ruleI];
              if (rule.selectorText) {
                rule.selectorText = rule.selectorText.replace(":hover", ":active");
                rule.selectorText = rule.selectorText.replace(":focus", ":active");
              }
            }
          }
        }
      }
    },
    thisYear() {
      return moment().format("YYYY");
    },
    getOtherParams(without) {
      var url = location.search;
      var theRequest = "";
      if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          if (without.indexOf(strs[i].split("=")[0]) == -1) {
            if (theRequest == "") {
              theRequest = strs[i]
            } else {
              theRequest += "&" + strs[i]
            }
          }
        }
      }
      return theRequest;
    },
    handleResize() {
      this.nice && this.nice.resize();
    },
    updateDay(day) {
      // console.log(`update day[${day}] type[${this.type}]`);
      if(!moment(day, "YYYYMMDD").isValid()) return;
      this.day = day;
      if(this.type == 'cloud') {
        this.loadCloudVideos();
      } else if(this.type == 'device') {
        this.timerange[0] = moment(this.day, "YYYYMMDD").startOf('hour').toDate();
        this.timerange[1] = moment(this.day, "YYYYMMDD").startOf('hour').toDate();
        this.getDeviceRecords(true);
      }
    },
    showDatePicker() {
      $(this.$refs['datePicker'].$el).focus();
    },
    loadCloudVideos() {
      if(!this.serial || !this.code || this.type != 'cloud') return;
        this.loadingRecords = true;
        $.get("/api/v1/cloudrecord/querydaily", {
            serial: this.serial,
            code: this.code,
            period: this.day,
            token: this.token,
        }).then(data => {
            // this.name = data.name || `${this.serial}:${this.code}`;
            this.videos = data.list;
        }).always(() => {
            this.loadingRecords = false;
        })
    },
    nextTimeRange() {
      var end = moment(this.day, "YYYYMMDD").endOf('day');
      var now = moment().startOf("second");
      if(end.isAfter(now, "second")) {
        end = now;
      }
      var r1 = moment(this.timerange[1]);
      if(r1.isSameOrAfter(end, "second")){
        return false;
      }
      var r2 = moment(this.timerange[1]).add(6, 'hours');
      if(r2.isAfter(end)) {
        r2 = end;
      }
      if(r2.clone().startOf("minute").isSameOrBefore(r1.clone().startOf("minute"), "second")) {
        return false;
      }
      console.log(r1.format("YY-MM-DD HH:mm:ss"), "~", r2.format("YY-MM-DD HH:mm:ss"), "loading...");
      this.timerange = [r1.toDate(), r2.toDate()];
      return true;
    },
    getDeviceRecords(refresh) {
      if(!this.serial || !this.code) return;
      if(refresh) {
        this.loadingRecords = true;
        this.records = [];
      }
      if(!this.nextTimeRange()){
        this.videos = this.records;
        this.loadingRecords = false;
        return
      }
      $.ajax({
        method: "GET",
        url: "/api/v1/playback/recordlist",
        global: false,
        data: {
          timeout: this.recordListTimeout || this.serverInfo.RecordListTimeout || 5,
          serial: this.serial,
          code: this.code,
          center: this.center,
          indistinct: this.indistinct,
          starttime: moment(this.timerange[0]).format("YYYY-MM-DDTHH:mm:ss"),
          endtime: moment(this.timerange[1]).format("YYYY-MM-DDTHH:mm:ss"),
          token: this.token,
        }
      }).then(ret => {
        var items = ret.RecordList || [];
        this.records = this.records.concat(items.filter(item => {
          if(!item || !item.StartTime || !item.EndTime) {
            return false;
          }
          if(this.records.some(v => (v.StartTime === item.StartTime && v.EndTime === item.EndTime))) {
            console.log("repeat", item.StartTime, "~", item.EndTime);
            return false;
          }
          return true;
        }));
      }).always(() => {
        this.$nextTick(() => {
          this.getDeviceRecords(false);
        })
      });
    },
    async startPlayback() {
      await this.stopPlayback();
      if(!this.video) return;
      this.loading = true;
      $.get("/api/v1/playback/start", {
        serial: this.serial,
        code: this.code,
        starttime: this.video.StartTime,
        endtime: this.video.EndTime,
        token: this.token,
      }).then(streamInfo => {
        var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
        if(this.flvSupported()) {
          videoUrl = this.isIE() ? streamInfo.WS_FLV : streamInfo.FLV;
        }
        switch(String(this.protocol).toUpperCase()) {
          case "WEBRTC":
            if(this.rtcSupported()) {
              videoUrl = streamInfo.WEBRTC;
            }
            break;
          case "FLV":
            if(this.flvSupported() && !this.isIE()) {
                videoUrl = streamInfo.FLV;
            }
            break;
          case "WS_FLV":
          case "WS-FLV":
            if(this.flvSupported()) {
              videoUrl = streamInfo.WS_FLV;
            }
            break;
          case "HLS":
            videoUrl = streamInfo.HLS;
            break;
          case "RTMP":
            videoUrl = streamInfo.RTMP;
            break;
        }
        this.streamID = streamInfo.StreamID;
        this.videoUrl = videoUrl;
        // no need since v1.2
        // this.touchTimer = setInterval(() => {
        //   this.touchPlayback()
        // }, 15000);
      }).fail(() => {
        this.$nextTick(() => {
          this.loading = false;
        })
      });
    },
    stopPlayback() {
      return new Promise((resolve, reject) => {
          if(this.switchTimer) {
            clearTimeout(this.switchTimer);
            this.switchTimer = 0;
          }
          this.videoUrl = "";
          if(!this.streamID) {
            resolve();
            return
          }
          $.ajax({
            method: "GET",
            url: "/api/v1/playback/stop",
            global: false,
            data: {
              streamid: this.streamID,
              token: this.token,
            }
          }).always(() => {
            this.streamID = "";
            resolve();
          })
      })
    },
    onTimeChange(video) {
        if(this.type == 'cloud') {
          this.videoUrl = ((video || {}).hls || "");
          this.currentTime = (video || {}).currentTime || 0;
        } else if(this.type == 'device') {
          var _video = this.video;
          this.video = video;
          if(video && _video != video) {
            this.startPlayback();
          } else {
            this.stopPlayback();
          }
        }
    },
    onDeviceVideoEnd() {

    },
    onDeviceVideoError(e) {
      if(!this.video) return;
      var endTime = moment(this.video.EndTime, "YYYY-MM-DDTHH:mm:ss");
      endTime.add(5, 'minutes');
      var n = endTime.diff(endTime.clone().startOf('day'), 'minutes');
      this.$refs['timeRule'].clickMinute(n);
    },
    onDeviceVideoTimeUpdate(t) {
      if(!this.video) return;
      var startTime = moment(this.video.StartTime, 'YYYY-MM-DDTHH:mm:ss');
      startTime.add(t, 'seconds');
      var n = startTime.diff(startTime.clone().startOf('day'), 'minutes');
      this.$refs['timeRule'].clickMinute(n, false);
      var endTime = moment(this.video.EndTime, "YYYY-MM-DDTHH:mm:ss");
      var d = endTime.diff(startTime, 'seconds');
      if(d - t < 3 && !this.switchTimer) {
        this.switchTimer = setTimeout(() => {
          endTime.add(5, 'minutes');
          var n = endTime.diff(endTime.clone().startOf('day'), 'minutes');
          this.$refs['timeRule'].clickMinute(n);
        }, 3000);
      }
    },
    onVideoEnd() {
        var idx = this.videoUrls.indexOf(this.videoUrl);
        if (idx >= 0 && idx < this.videos.length - 1) {
            var nextVideo = this.videos[idx + 1];
            if (!nextVideo) return;
            var startTime = moment(nextVideo.startAt, 'YYYYMMDDHHmmss');
            var n = startTime.diff(startTime.clone().startOf('day'), 'minutes');
            this.$refs['timeRule'].clickMinute(n);
        }
    },
    onVideoTimeUpdate(currentTime) {
        var idx = this.videoUrls.indexOf(this.videoUrl);
        if (idx >= 0 && idx < this.videos.length) {
            var video = this.videos[idx];
            var startTime = moment(video.startAt, 'YYYYMMDDHHmmss');
            startTime.add(currentTime, 'seconds');
            var n = startTime.diff(startTime.clone().startOf('day'), 'minutes');
            this.$refs['timeRule'].clickMinute(n, false);
        }
    }
  }
};
</script>

<style lang="less" scoped>
.main-header .navbar {
  /* Fix for IE */
  -webkit-transition: none;
  -o-transition: none;
  transition: none;
}
</style>
