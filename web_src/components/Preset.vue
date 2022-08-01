<template>
<div>
    <el-table size="mini" :data="presets" stripe :max-height="235" ref="presetsTable" v-loading="loading" element-loading-text="获取中...">
        <el-table-column prop="PresetID" label="序号" min-width="40" show-overflow-tooltip></el-table-column>
        <el-table-column prop="PresetName" label="备注" min-width="80" show-overflow-tooltip></el-table-column>
        <el-table-column fixed="right" label="操作" width="110">
            <template slot-scope="scope">
                <span title="调用预置位" style="cursor:pointer;color:#00acd6;"
                    @click.prevent="gotoPreet(scope.row)" v-if="scope.row.PresetEnable">
                    调用
                </span>
                <span title="设置预置位" style="cursor:pointer;color:#00acd6;"
                    @click.prevent="setPreset(scope.row)">
                    设置
                </span>
                <span title="删除预置位" :style="scope.row.Confirm ? 'cursor:pointer;color:#e08e0b;':'cursor:pointer;color:#dd4b39;'"
                    @click.prevent="removePreset(scope.row)" v-if="scope.row.PresetEnable">
                    {{scope.row.Confirm ? '确认?' : '删除'}}
                </span>
            </template>
        </el-table-column>
    </el-table>
</div>
</template>

<script>
export default {
    props: {
        serial: {
            type: String,
            default: ''
        },
        code: {
            type: String,
            default: ''
        },
        activeName: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            presets: [],
            loading: false,
        }
    },
    watch: {
        activeName: function (newVal, oldVal) {
            if (newVal == "preset-info") {
                this.getPresets();
            }
        },
    },
    mounted() {},
    methods: {
        getPresets() {
            this.loading = true;
            $.ajax({
                method: "GET", // type: "GET", is also ok, method since jquery 1.9
                url: "/api/v1/device/fetchpreset",
                global: false,
                data: {
                    serial: this.serial,
                    code: this.code,
                    timeout: 3,
                }
            }).then(ret => {
                this.presets = ret.PresetItemList || [];
            }).fail(xhr => {
                if(xhr) {
                    console.log(`fetchpreset[${this.serial}:${this.code}] ajax error: ${xhr.status} ${xhr.responseText}`);
                    if(xhr.status == 401) {
                        this.$nextTick(() => {
                            location.href = `/login?r=${encodeURIComponent(window.location.href)}`;
                        })
                    }
                }
            }).always(() => {
                this.$nextTick(() => {
                    this.loading = false;
                })
            });
        },
        setPreset(row) {
            $.get("/api/v1/control/preset", {
                serial: this.serial,
                code: this.code,
                command: "set",
                preset: row.PresetID,
                name: row.PresetName,
            }).always(() => {
                this.getPresets();
            });
        },
        removePreset(row) {
            if (row.Confirm) {
                $.get("/api/v1/control/preset", {
                    serial: this.serial,
                    code: this.code,
                    command: "remove",
                    preset: row.PresetID,
                }).always(() => {
                    this.$delete(row, "Confirm");
                    this.getPresets();
                });
            } else {
                this.$set(row, "Confirm", true);
                setTimeout(() => {
                    this.$delete(row, "Confirm");
                }, 3000);
            }
        },
        gotoPreet(row) {
            $.get("/api/v1/control/preset", {
                serial: this.serial,
                code: this.code,
                command: "goto",
                preset: row.PresetID,
            });
        },
    }
}
</script>

<style lang="less" scoped>
label.el-switch {
    margin-bottom: -10px;
}
</style>
