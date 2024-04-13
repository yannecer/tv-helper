import {spawn} from "child_process";
import {decode} from "iconv-lite";

function execCmd(adbPath, cmdStr, success, error) {

    let logArr = []


    const cmdStrAll = `cd ` + adbPath + ` && ` + cmdStr

    console.log("cmdStrAll:::" + cmdStrAll)

    // 要执行的CMD命令和参数
    const cmd = 'cmd.exe';
    const execCmd = ['/c', cmdStrAll];

    // 创建子进程
    const child = spawn(cmd, execCmd);

    // 监听子进程的输出
    child.stdout.on('data', (data) => {
        console.log("data::11:" + data)
        logArr.push(data)
    });

    //监听错误
    child.stderr.on('data', (data) => {
        console.log("data::222:" + (data))
        logArr.push(data)
    });

    // 监听子进程的关闭事件，这表示CMD命令已经执行完毕
    child.on('close', (code) => {

        console.log("data::333:")
        let logs = logArr.join("");
        if (logs.includes("connected") || logs.includes("Success")) {
            success(logArr)
        } else {
            error(logArr)
        }

    });
}


export {execCmd};
