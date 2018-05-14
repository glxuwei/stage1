const successLog = (option, response) => {
    console.info(
        '[HotDog] 接口请求成功',
        '请求地址:', option.serviceType,
        '请求参数:', option,
        '接口返回的结果:', response
    );
};

const failLog = (option, response) => {
    console.info(
        '[HotDog] 接口请求失败（后端数据不对）',
        '请求地址:', option.serviceType,
        '请求参数:', option,
        '接口返回的结果:', response
    );
};

const errorLog = (option, err) => {
    console.warn(
        '[HotDog] 接口请求失败（网络错误）',
        '请求地址:', option.serviceType,
        '请求参数:', option,
        '错误信息:', err
    );
};

export { successLog, failLog, errorLog };
