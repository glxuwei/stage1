/**
 * @author will.xu
 * @providesModule RequestQueue
 */
// import { QHotDogNetWork } from 'qunar-react-native';
import { REQUEST_STATUS } from 'Constants';
import { noop } from 'utils';
/*
 * 存储所有request请求，用于abort
 * 结构:
 * [{id: [requestId], type: [serviceType], abort: [abort]}, {...}, ...]
 * */
const defaultServiceType = 'not_hotdog_t_value';
let requestQueue = [];

/**
* @description 请求入队
* @param {Object} 请求参数
* @return
* @example
*/
const enqueue = ({requestId, serviceType = defaultServiceType, timer, reject = noop}) => {

    requestQueue.push({id: requestId, type: serviceType, abort: () => {
        reject({
            bstatus: {
                des: REQUEST_STATUS.ABORTED_CN,
                code: REQUEST_STATUS.ABORTED
            }
        });
        // QHotDogNetWork.cancelNetWorkTask(requestId);
        //取消超时设置
        clearTimeout(timer);
    }});
};

/**
* @description 取消请求
* @param {String} hotdog T值 serviceType
* @return
* @example
* 取消某些serviceType下的请求, 并删除requestQueue中该请求的存储对象: abort('f_flight_flightlist', '...');
* 取消所有存储的请求，并置空requetQueue: abort();
*
*/
const abort = (...args) => {

    //如果存在参数，则取消该参数匹配的请求对象，如果不存在则取消所有请求
    requestQueue = args.length ? requestQueue.reduce((prev, item) => {
        //当前type存在于abort的参数中，则取消当前请求对象,否则存储到新的队列中
        args.includes(item.type) ? item.abort() : prev.push(item);
        return prev;
    }, []) : requestQueue.reduce((prev, item) => {
        item.abort();
        return prev;
    }, []);
};

//出队操作，清除存储的请求对象{id, type, abort: fn};
const dequeue = requestId => {
    requestQueue = requestQueue.filter(item => item.id !== requestId);
};

//判断当前请求是否已被废弃
const isAborted = requestId => requestQueue.every(item => item.id !== requestId);

export default {
    enqueue,
    dequeue,
    abort,
    isAborted
};

