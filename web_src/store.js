import Vue from "vue";
import Vuex from "vuex";
import moment from "moment"

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        serverInfo: {},
        userInfo: null,
        menus: [
            {
                path: '/',
                title: "概览",
                icon: 'dashboard',
                roles: ['超级管理员'],
            }, {
                path: "/devices",
                icon: "video-camera",
                title: "国标设备",
                roles: ['管理员','操作员','观众'],
            }, {
                path: '/screen',
                icon: 'th-large',
                title: "分屏展示",
                // roles: ['管理员','操作员','观众'],
            }, {
                path: "/cloudrecord",
                icon: "cloud",
                title: "云端录像",
                notVersionType: "标准版",
                roles: ['管理员','操作员','观众'],
            }, {
                path: "/alarms",
                icon: "bell",
                title: "报警查询",
                roles: ['管理员','操作员'],
            }, {
                path: "/cascade",
                icon: "cloud-upload",
                title: "国标级联",
                notVersionType: "标准版",
                roles: ['超级管理员'],
            }, {
                path: "/user",
                icon: "users",
                title: "用户管理",
                roles: ['管理员'],
            }, {
                path: "/logs",
                icon: "file",
                title: "操作日志",
                roles: ['超级管理员'],
            }, {
                path: "/config",
                icon: "cogs",
                title: "基础配置",
                roles: ['超级管理员'],
            },
            // , {
            //     path: "/about",
            //     icon: "support",
            //     title: "版本信息",
            //     roles: ['超级管理员'],
            // }
        ]
    },
    mutations: {
        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        updateServerInfo(state, serverInfo) {
            state.serverInfo = serverInfo;
        }
    },
    actions: {
        getUserInfo({ commit, state }, payload) {
            return new Promise((resolve, reject) => {
                $.get("/api/v1/userinfo", payload).then(msg => {
                    var userInfo = msg;
                    commit('updateUserInfo', userInfo);
                    resolve(userInfo);
                }).fail(() => {
                    resolve(null);
                })
            })
        },
        logout({ commit, state }) {
            return new Promise((resolve, reject) => {
                $.get("/api/v1/logout").then(data => {
                    commit('updateUserInfo', null);
                    resolve(null);
                }).fail(() => {
                    resolve(null);
                })
            })
        },
        getServerInfo({ commit }) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    method: "GET",
                    global: false,
                    url: "/api/v1/getserverinfo",
                }).then(serverInfo => {
                    try {
                        if (serverInfo.ServerTime) {
                            var stime = moment(serverInfo.ServerTime, "YYYY-MM-DD HH:mm:ss");
                            serverInfo.DiffDuration = moment.duration(stime.diff(moment()));
                        }
                        commit('updateServerInfo', serverInfo);
                        resolve(serverInfo);
                        return
                    } catch (error) {
                        console.log(error);
                    }
                    resolve({});
                }).fail(() => {
                    resolve({});
                })
            })
        }
    }
})

export default store;
