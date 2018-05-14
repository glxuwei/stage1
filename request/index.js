/**
 * @file
 * @author zdying
 * @providesModule request
 */
import { QHotDogNetWork } from 'qunar-react-native';
import Version from 'Version';

import { REQUEST_STATUS } from 'Constants';
import { successLog, failLog, errorLog } from './logger';
import RequestQueue from 'RequestQueue';

// 测试接口返回的结果是否成功，默认判断bstatus.code === 0
const defaultSuccess = json => {
    const {bstatus, data} = json;
    return bstatus && bstatus.code === 0 && !!data;
};

/**
 * 使用QHotDogNetWork发起网络请求
 * @param option
 * @param version 版本号
 * @returns {Promise}
 */

const request = (option, version) => new Promise((resolve, reject) => {

    const { useCache, cacheKey, timeout, serviceType, testSuccess = defaultSuccess, param } = option;
    const { queryId } = param || {};

    //超时timeout
    let timer = null;
    //每次请求返回的唯一标识，用于取消该请求
    let requestId = '';

    if(useCache === true || cacheKey){
        console.warn('request不使用缓存，如果要使用缓存请使用QHotDogNetWork原生API');
    }

    //请求参数带上版本号
    Object.assign(param, version);

    const requestParam = {
        ...option,
        param,
        useCache: false,
        cacheKey: '',
        successCallback:(response={})=>{

            clearTimeout(timer);

            //当前请求未被废弃, 触发回调
            if (!RequestQueue.isAborted(requestId)) {
                //请求成功，清除之前保存的对象
                 RequestQueue.dequeue(requestId);
                if(testSuccess(response)){
                    successLog({...option, param}, response);
                    resolve(response);
                }else{
                    failLog(option, response);
                    reject(response);
                }
            }
        },
        cacheCallback:(response)=>{},
        failCallback:(err)=>{

            clearTimeout(timer);
            //当前请求未被废弃, 触发回调
            if (!RequestQueue.isAborted(requestId)) {
                //请求失败，清除之前保存的对象
                RequestQueue.dequeue(requestId);
                errorLog(option, err);
                reject(err || {
                    bstatus: {
                        des: '',
                        code: REQUEST_STATUS.ERROR
                    }
                });
            }
        }
    };

    if (+queryId === -1) {
        //queryId为-1时，取消之前该serviceType下的所有请求
        RequestQueue.abort(serviceType);
    }

    requestId = QHotDogNetWork.postRequest(requestParam);

    //超时处理
    if (timeout) {
        timer = setTimeout(() => {
            reject({
                bstatus: {
                    des: REQUEST_STATUS.TIMEOUT_CN,
                    code: REQUEST_STATUS.TIMEOUT
                }
            });
            //置空存储的请求abort方法
            RequestQueue.dequeue(requestId);
            //取消掉当前发送的请求
            QHotDogNetWork.cancelNetWorkTask(requestId);
        }, timeout);
    }

    //存储请求
    RequestQueue.enqueue({reject, requestId, timer, serviceType });
});

// Version.getVersion()为获取版本号方法
// 以便在每一次请求中增加qp版本号和batom
export default option => Version.getAllVersion().then(version => request(option, version));


