<template>
    <div :class="['modal', { fade: fade }]" data-keyboard="true" data-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title text-primary text-center"><span>{{videoTitle}}</span></h4>
                </div>
                <div class="modal-body">
                    <LivePlayer v-if="bShow" :videoUrl="videoUrl" :snapUrl="snapUrl" :live="live" muted :hideBigPlayButton="!!serverInfo.HideBigPlayButton"
                      @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中" element-loading-background="#000"></LivePlayer>
                    <div class="text-center text-gray" v-if="isDemoUser(serverInfo, userInfo)">
                      <br>
                      提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请联系管理员
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click.prevent="scale(1)">x1</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(2)">x2</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(4)">x4</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import "jquery-ui/ui/widgets/draggable";
import LivePlayer from "@liveqing/liveplayer";
import { mapState } from "vuex";

export default {
  data() {
    return {
      videoUrl: "",
      videoTitle: "",
      snapUrl: "",
      serial: "",
      code: "",
      streamID: "",
      timer: 0,
      bShow: false,
      bLoading: false
    };
  },
  props: {
    live: {
      type: Boolean,
      default: false
    },
    fade: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  beforeDestroy() {
    $(window).off("beforeunload", this.beforeUnload);
    this.stop();
  },
  mounted() {
    $(this.$el).find(".modal-content").draggable({
      handle: ".modal-header",
      cancel: ".modal-title span",
      addClasses: false,
      containment: "document",
      delay: 100,
      opacity: 0.5
    });
    $(this.$el).on("hide.bs.modal", () => {
      this.bShow = false;
      this.stop();
    }).on("show.bs.modal", () => {
      this.bShow = true;
      // no need since v1.2
      // if (this.streamID) {
      //   this.timer = setInterval(() => {
      //     $.get("/api/v1/playback/streaminfo", {
      //       streamid: this.streamID,
      //       touch: true,
      //     });
      //   }, 15000);
      // }
    });
    $(window).on("beforeunload", this.beforeUnload);
  },
  components: { LivePlayer },
  methods: {
    play(src, title, snap, serial, code, streamID) {
      this.serial = serial || "";
      this.code = code || "";
      this.streamID = streamID || "";
      this.videoTitle = title || "";
      this.snapUrl = snap || "";
      this.videoUrl = src || ""; // no need in next tick since player@2.6.9
      $(this.$el).modal("show");
    },
    stop() {
      this.snapUrl = "";
      this.videoUrl = "";
      if(this.timer) {
          clearInterval(this.timer);
          this.timer = 0;
      }
      if(this.streamID) {
        $.get("/api/v1/playback/stop", {
          streamid: this.streamID
        });
        this.streamID = "";
      }
    },
    scale(speed = 1) {
      $.get("/api/v1/playback/control", {
        streamid: this.streamID,
        command: "scale",
        scale: speed
      })
    },
    beforeUnload(event) {
      this.stop();
      event.preventDefault();
      event.returnValue = '';
    }
  }
};
</script>

<style lang="less" scoped>
.modal-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>






