<template>

    <div>
        <el-form :model="config" label-width="150px" size="mini" style="width: 550px;margin-top: -20px">
            <el-form-item label="Adb路径：">
                <el-input v-model="config.adbPath" autocomplete="off" placeholder="请输入Adb路径"></el-input>
            </el-form-item>
            <el-form-item label="Adb连接命令：">
                <el-input v-model="config.adbConnect" autocomplete="off" placeholder="请输入Adb连接命令"></el-input>
            </el-form-item>
            <el-form-item label="Adb安装命令：">
                <el-input v-model="config.adbInstall" autocomplete="off" placeholder="请输入Adb安装命令"></el-input>
            </el-form-item>
        </el-form>


        <div>版本：1.0.1</div>
        <div>项目地址：</div>

        <div slot="footer" style="text-align: right">
            <el-button size="small" @click="cancel">取 消</el-button>
            <el-button size="small" type="primary" @click="sure">确 定</el-button>
        </div>
    </div>

</template>

<script>


const constants = require('../utils/constants')

export default {


    data() {
        return {
            config: {
                adbPath: "",
                adbConnect: "",
                adbInstall: ""
            },
        }
    },

    created() {
        let configJson = localStorage.getItem(constants.ADB_CONFIG)
        if (configJson) {
            this.config = JSON.parse(configJson);
        }
    },


    methods: {
        cancel() {
            this.$emit("onCancelDialog")
        },
        sure() {
            this.$emit("onSureDialog", this.config);
        }
    }
}
</script>

<style scoped>


</style>
