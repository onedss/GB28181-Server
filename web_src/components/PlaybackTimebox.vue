<template>
    <div class="">
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">设备录像时间轴({{devid}}-{{channel}})</h4>
          </div>
          <div class="box-body">
            <div class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                <button type="button" class="btn btn-sm btn-primary" @click.prevent="$router.go(-1)" v-if="$getQueryString('menu') != 'no'">
                  <i class="fa fa-chevron-left"></i> 返回
                </button>
              </div>
              <div class="form-group pull-right">
                  <div class="input-group input-group-sm">
                      <DatePicker class="form-control" @update:day="updateDay" :day="day" ref="datePicker"></DatePicker>
                      <div class="input-group-btn">
                          <button type="button" class="btn btn-sm btn-default" @click.prevent="showDatePicker">
                            <i class="fa fa-calendar"></i>
                          </button>
                          <button @click.prevent="toListView" class="btn btn-default btn-sm">
                              <i class="fa fa-hand-o-right"></i> 列表视图
                          </button>
                      </div>
                  </div>
              </div>
            </div>
            <br>
            <div class="clearfix"></div>
            <LivePlayer live muted :videoUrl="videoUrl" :currentTime="currentTime" @ended="onVideoEnd" @error="onVideoError" @timeupdate="onVideoTimeUpdate" :hideBigPlayButton="!!serverInfo.HideBigPlayButton"
              :loading.sync="videoLoading" v-loading="videoLoading" element-loading-text="加载中" element-loading-background="#000"
              style="margin:0 auto; max-width:700px;">
            </LivePlayer>
            <div class="text-center text-gray" v-if="isDemoUser(serverInfo, userInfo)">
              <br>
              提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请联系管理员
            </div>
            <br>
            <br>
            <TimeRule :videos="videos" @timeChange="onTimeChange" ref="timeRule" v-loading="loading"></TimeRule>
            <div class="clearfix"></div>
            <br>
          </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import DatePicker from "components/DatePicker.vue"
import TimeRule from 'components/TimeRule.vue'
import LivePlayer from '@liveqing/liveplayer'
import { mapState } from "vuex";

export default {
  props: {
    devid: {
      type: String,
      default: ""
    },
    channel: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: "timebox"
    },
    day: {
      type: String,
      default: () => moment().format("YYYYMMDD")
    }
  },
  data() {
    return {
      timerange: [
        moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
        moment(this.day, "YYYYMMDD").startOf('hour').toDate()
      ],
      videoLoading: false,
      loading: false,
      center: "",
      indistinct: "",
      records: [],
      currentTime: null,
      videos: [],
      video: null,
      videoUrl: "",
      streamID: "",
      touchTimer: 0,
      switchTimer: 0,
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  components: {
    DatePicker, LivePlayer, TimeRule
  },
  methods: {
    ready(){
      this.$watch('day', function(newVal, oldVal) {
        this.timerange = [
          moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
          moment(this.day, "YYYYMMDD").startOf('hour').toDate()
        ]
      });
      this.$watch('center', function(newVal, oldVal) {
        this.timerange = [
          moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
          moment(this.day, "YYYYMMDD").startOf('hour').toDate()
        ]
      });
      this.$watch('indistinct', function(newVal, oldVal) {
        this.timerange = [
          moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
          moment(this.day, "YYYYMMDD").startOf('hour').toDate()
        ]
      });
      this.$watch('video', function(newVal, oldVal) {
        if(newVal && newVal != oldVal) {
          this.startPlayback();
        } else {
          this.stopPlayback();
        }
      });

      let mmt = moment();
      let n = mmt.diff(mmt.clone().startOf('day'), 'minutes');
      n -= 10;
      if(n < 0) n = 0;
      this.$refs.timeRule.clickMinute(n);
      console.log(this.devid, this.channel, this.day)
      this.getRecords(true);
      $(window).on("beforeunload", this.beforeUnload);
    },
    keyDown(e) {
      if(e.keyCode == 27) {
        this.$el.querySelector('.fa-chevron-left').click();
      }
    },
    isMobile() {
      return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    },
    showDatePicker() {
      $(this.$refs.datePicker.$el).focus();
    },
    updateDay(day) {
      this.$nextTick(() => {
        this.$router.replace({
          path: `/devices/playback/${this.mode}/${this.devid}/${this.channel}/${day}`,
          query: Object.assign({}, this.$route.query, { center: this.center, indistinct: this.indistinct}),
        });
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
    getRecords(refresh) {
      if(refresh) {
        this.loading = true;
        this.records = [];
      }
      if(!this.nextTimeRange()){
        this.videos = this.records;
        this.$nextTick(() => {
          this.loading = false;
        })
        return
      }
      $.ajax({
        method: "GET",
        url: "/api/v1/playback/recordlist",
        global: false,
        data: {
          timeout: this.serverInfo.RecordListTimeout || 5,
          serial: this.devid,
          code: this.channel,
          center: this.center,
          indistinct: this.indistinct,
          starttime: moment(this.timerange[0]).format("YYYY-MM-DDTHH:mm:ss"),
          endtime: moment(this.timerange[1]).format("YYYY-MM-DDTHH:mm:ss")
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
          this.getRecords(false);
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
          if(this.touchTimer) {
            clearInterval(this.touchTimer);
            this.touchTimer = 0;
          }
          if(!this.streamID) {
            resolve();
            return
          }
          $.ajax({
            method: "GET",
            url: "/api/v1/playback/stop",
            global: false,
            data: {
              streamid: this.streamID
            }
          }).always(() => {
            resolve();
          })
          this.streamID = "";
      })
    },
    beforeUnload(event) {
      this.stopPlayback();
      event.preventDefault();
      event.returnValue = '';
    },
    async startPlayback() {
      await this.stopPlayback();
      if(!this.video) return;
      this.videoLoading = true;
      $.get("/api/v1/playback/start", {
        serial: this.devid,
        code: this.channel,
        starttime: this.video.StartTime,
        endtime: this.video.EndTime
      }).then(streamInfo => {
        var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
        if(this.flvSupported()) {
          videoUrl = this.isIE() ? streamInfo.WS_FLV : streamInfo.FLV;
        }
        switch(String(this.serverInfo.PreferStreamFmt).toUpperCase()) {
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
          this.videoLoading = false;
        })
      });
    },
    touchPlayback() {
      if(!this.streamID) return;
      $.get("/api/v1/playback/touch",{
        streamid: this.streamID
      })
    },
    toListView() {
      this.$router.replace({
        path: `/devices/playback/list/${this.devid}/${this.channel}/${this.day}`,
        query: Object.assign({}, this.$route.query, { center: this.center, indistinct: this.indistinct }),
      });
    },
    onTimeChange(video) {
      this.video = video;
    },
    onVideoEnd() {

    },
    onVideoError(e) {
      if(!this.video) return;
      var endTime = moment(this.video.EndTime, "YYYY-MM-DDTHH:mm:ss");
      endTime.add(5, 'minutes');
      var n = endTime.diff(endTime.clone().startOf('day'), 'minutes');
      this.$refs['timeRule'].clickMinute(n);
    },
    onVideoTimeUpdate(t) {
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
    }
  },
  mounted() {
    // let mmt = moment();
    // let n = mmt.diff(mmt.clone().startOf('day'), 'minutes');
    // n -= 10;
    // if(n < 0) n = 0;
    // this.$refs.timeRule.clickMinute(n);
    // console.log(this.devid, this.channel, this.day)
    // this.getRecords(true);
    // $(window).on("beforeunload", this.beforeUnload);
  },
  beforeDestroy() {
    $(window).off("beforeunload", this.beforeUnload);
    this.stopPlayback();
  },
  beforeRouteLeave(to, from, next) {
    this.stopPlayback();
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.center = to.query.center;
      vm.indistinct = to.query.indistinct;
      vm.ready();
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.center = to.query.center;
    this.indistinct = to.query.indistinct;
    this.stopPlayback();
    next();
    this.$nextTick(() => {
      if(!this.loading) {
        console.log(this.devid, this.channel, this.day)
        this.getRecords(true);
      }
    })
  }
};
</script>

