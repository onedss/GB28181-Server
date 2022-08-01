<template>
  <header class="main-header">
    <router-link class="logo" style="position: relative;" to="/">
        <span class="logo-mini">{{logoMiniText}}</span>
        <span class="logo-lg">{{logoText}}</span>
        <!-- <span class='logo-lg label label-warning' style='position: absolute;top:8px;right: 20px;font-size: 8px;' v-if="versionText">{{versionText}}</span> -->
    </router-link>

    <nav class="navbar navbar-static-top">
      <a class="sidebar-toggle" data-toggle="push-menu" role="button">
        <span class="sr-only">Toggle navigation</span>
      </a>

      <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">
              <li v-if="hasAnyRole(serverInfo, userInfo, '超级管理员')" class="net-show hidden-xs">
                  接收 <i class="glyphicon glyphicon-arrow-up"></i> ：{{parseFloat(recvRate).toFixed(3)}} Mbps <br>
                  发送 <i class="glyphicon glyphicon-arrow-down"></i> ：{{parseFloat(sentRate).toFixed(3)}} Mbps
              </li>
              <li v-if="serverInfo.DemoUser">
                <i class="fa fa-download"></i> 下载使用
              </li>
              <li v-if="serverInfo.DemoUser" class="hidden-xs">
                <a target="_blank" href="/apidoc/"><i class="fa fa-book"></i> 开发接口</a>
              </li>
              <li class="dropdown" v-if="userInfo">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">欢迎, {{userInfo.Name}}</a>
                <ul class="dropdown-menu">
                  <li v-if="!userInfo.Cas && !userInfo.OAuth">
                      <a @click.prevent="$emit('modify-password')" role="button"><i class="fa fa-key"></i> 修改密码</a>
                  </li>
                  <li>
                    <a href="/logout"><i class="fa fa-sign-out"></i> 注 销</a>
                  </li>
                  <!-- <router-link to="/logout" tag="li">
                      <a><i class="fa fa-sign-out"></i> 注 销</a>
                  </router-link> -->
                </ul>
              </li>
              <li v-else>
                <!-- <a href="/login.html"><i class="fa fa-user"></i> 登录</a> -->
                <a href="/login"><i class="fa fa-user"></i> 登录</a>
              </li>
          </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
      return {
          timer: 0,
          sentRate: 0,
          recvRate: 0,
      };
  },
  props: {
    logoText: {
      default: ""
    },
    logoMiniText: {
      default: ""
    },
    versionText: {
      default: ""
    }
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"])
  },
  mounted() {
    if (this.hasAnyRole(this.serverInfo, this.userInfo, '超级管理员')) {
      this.netStats();
      this.timer = setInterval(() => {
        this.netStats();
      }, 3000);
    }
  },
  beforeDestroy() {
      if (this.timer) {
          clearInterval(this.timer);
          this.timer = 0;
      }
  },
  methods: {
    netStats() {
      $.ajax({
          method: "GET", // type: "GET", is also ok, method since jquery 1.9
          url: `/api/v1/dashboard/top/net`,
          global: false,
      }).then(ret => {
          if (ret) {
              this.sentRate = ret.sent;
              this.recvRate = ret.recv;
          }
      }).fail(xhr => {
        if (xhr) {
          console.log(`stats net error: ${xhr.status} ${xhr.responseText}`);
          if (xhr.status == 401 && this.serverInfo.DemoUser) {
            location.href = `/login?r=${encodeURIComponent(window.location.href)}`;
            return false;
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped="true">
.main-header .navbar,
.main-header .logo {
  /* Fix for IE */
  -webkit-transition: none;
  -o-transition: none;
  transition: none;
}

.main-header .logo {
  padding: 0;
}

.main-header .navbar .dropdown-menu li a {
  color: #777;
  &:hover {
    background-color: #e1e3e9;
  }
}

.net-show {
    font-size: 12px;
    text-align: left;
    color: white;
    opacity: 0.5;
    font-weight: 100;
    line-height: 16px;
    padding: 9px;
}
</style>

