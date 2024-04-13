<template>

    <div style="display: flex;flex-direction: column;justify-content: center;align-items: center">

        <div style="width: 100%; display: flex;">
            <div style="flex: 1"></div>
            <i style="font-size: 22px;margin: 20px;cursor: pointer"
               class="el-icon-setting" @click="dialogConfigVisible = true"></i>
        </div>


        <div style="display: flex;align-items: center;margin-top: 100px">
            <div style="color: #666;width: 250px;text-align: right">电视IP地址:</div>
            <el-input size="small" @input="inputChange" style="margin-left: 20px" placeholder="请输入电视IP地址"
                      v-model="config.ipAddress" clearable></el-input>
            <el-popover
                placement="top-start"
                style="cursor: pointer"
                trigger="hover"
                content="保证电视和电脑处于同一网络下，电视ip在 设置- 网络连接 中查看">
                <i slot="reference" style="margin-left: 10px ;font-size: 16px"
                   class="el-icon-warning-outline"></i>
            </el-popover>
            <el-button style="margin-left: 20px" size="small" @click="connect">连接电视</el-button>

        </div>

        <div style="font-size: 13px;margin-top: 10px">
            <div v-if="connectStatus===-1" style="color: #999">等待电视连接</div>
            <div v-if="connectStatus===2" style="color: red;cursor: pointer" @click="dialogErrorVisible=true">
                连接失败，查看错误日志
            </div>
            <div v-if="connectStatus===0" style="color: #4fc08d;">正在连接，请稍后</div>
            <div v-if="connectStatus===1" style="color: #4fc08d;">连接成功</div>

        </div>


        <el-button style="padding: 10px 30px;margin: 10px" size="small" @click="chooseFile">选择apk</el-button>
        <div style="display: flex;font-size: 13px">
            <div style="font-size: 14px">{{ apkPath }}</div>
            <div v-if="installStatus===0" style="margin-left: 20px;color: #4fc08d;">安装中，请稍后...</div>
            <div v-if="installStatus===1" style="margin-left: 20px;color: #4fc08d;">安装成功</div>
            <div v-if="installStatus===2" style="margin-left: 20px;color: red;">安装失败</div>

            <div v-if="installStatus===1 || installStatus===2" style="margin-left: 20px;cursor: pointer"
                 @click="dialogErrorVisible=true">查看日志
            </div>

        </div>

        <el-dialog title="配置" :visible.sync="dialogConfigVisible" width="60%" show-close>
            <config-dialog @onCancelDialog="onCancelDialog" @onSureDialog="onSureDialog"></config-dialog>
        </el-dialog>

        <el-dialog title="日志" :visible.sync="dialogErrorVisible" width="60%" show-close>
            <div style="height: 200px;overflow-y: auto">
                <div v-for="item in cmdLogArr">
                    <div>{{ item }}</div>
                </div>
            </div>
        </el-dialog>

    </div>

</template>

<script>
import ConfigDialog from "./ConfigDialog.vue";
const fs = require('fs');
const unZipper = require('unzipper');
const path = require('path');


const {remote} = require('electron');
const {dialog} = remote;

const utils = require('../utils/utils')
const constants = require('../utils/constants')


export default {
    name: 'tv-helper',
    components: {ConfigDialog},
    data() {
        return {
            initSuccess: false,
            dialogConfigVisible: false,
            dialogErrorVisible: false,
            cmdLogArr: [],
            apkPath: "",
            installStatus: -1,//0-正在安装，1-安装成功，2-安装失败
            connectStatus: -1,//0-正在连接，1-连接成功，2-连接失败
            config: {},
        }
    },

    created() {

        let configJson = localStorage.getItem(constants.ADB_CONFIG)

        if (!configJson) {
            let config = {
                adbPath: "C:\\AdbTemp",
                adbConnect: "adb connect",
                adbInstall: "adb install -r",
                ipAddress: "",
            }
            localStorage.setItem(constants.ADB_CONFIG, JSON.stringify(config))
        }

        this.initAdb();

    },

    methods: {

        initAdb() {
            let that = this
            let configJson = localStorage.getItem(constants.ADB_CONFIG)

            if (!configJson) {
                that.$message.error("配置出错")
                return
            }

            this.config = JSON.parse(configJson)
            const adbPath = this.config.adbPath

            // 生产环境中 zip等静态文件需要放在根目录下的static文件夹中，__dirname 指向打包之后的resources/app.asar  对应项目中的是根目录下的dist/electron
            // 对应 测试环境中 的文件地址 是 ./static/adb.zip
            let zipFilePath = "";
            if (process.env.NODE_ENV === "development") {
                zipFilePath = "./static/adb.zip"
            } else {
                zipFilePath = path.join(__dirname, 'static/adb.zip')
            }

            try {
                fs.createReadStream(zipFilePath)
                    .pipe(unZipper.Extract({path: adbPath}))
                    .on('close', function () {
                        that.initSuccess = true
                    })
                    .on('error', function (err) {
                        that.$message.error("配置出错--> " + err)
                    });

            } catch (e) {

            }

        },

        inputChange(value) {
            this.config.ipAddress = value.replace(/[^0-9:\.]/g, '')
        },

        chooseFile() {
            if (this.connectStatus !== 1) {
                this.$message.error("请先连接电视")
                return
            }

            let that = this;
            this.$electron.remote.dialog
                .showOpenDialog({
                    title: "打开APK文件",
                    properties: ["openFile"],
                    filters: [
                        {name: 'APK Files', extensions: ['apk']}
                    ]
                }, (result) => {
                    that.apkPath = result[0]
                    that.installApk()

                })
        },
        onCancelDialog() {
            this.dialogConfigVisible = false
        },
        onSureDialog(e) {
            localStorage.setItem(constants.ADB_CONFIG, JSON.stringify(e))
            this.dialogConfigVisible = false
            this.initAdb();
        },

        connect() {
            if (!this.initSuccess) {
                this.$message.error("Adb初始化失败")
                return
            }

            if (!this.config.ipAddress) {
                this.$message.error("请输入电视IP地址")
                return;
            }

            localStorage.setItem(constants.ADB_CONFIG, JSON.stringify(this.config))

            this.connectStatus = 0
            this.cmdLogArr = []

            const cmdStr = this.config.adbConnect + " " + this.config.ipAddress

            utils.execCmd(this.config.adbPath, cmdStr, () => {
                this.$message.success("连接成功")
                this.connectStatus = 1;
            }, (logArr) => {
                this.$message.error("连接失败")
                this.cmdLogArr = logArr
                this.connectStatus = 2;
            })
        },

        installApk() {

            if (!this.apkPath) {
                this.$message.error("请选择apk文件")
                return
            }

            this.cmdLogArr = []

            this.installStatus = 0;
            const cmdStr = this.config.adbConnect + " " + this.config.ipAddress + " && " + this.config.adbInstall + " " + this.apkPath

            utils.execCmd(this.config.adbPath, cmdStr, (logArr) => {
                this.$message.success("安装成功")
                this.cmdLogArr = logArr
                this.installStatus = 1;
            }, (logArr) => {
                this.$message.error("安装失败")
                this.cmdLogArr = logArr
                this.installStatus = 2;
            })

        },

    }
}
</script>

<style scoped>

</style>
