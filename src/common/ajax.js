function ajax(url, method = 'GET', data = {}) {
    return new Promise(function (resolve, reject) {
        let token = wx.getStorageSync('token');
        function getTokey() {
            return new Promise((resolve) => {
                wx.login({
                    success(res) {
                        if (res.code) {
                            //发起网络请求
                            wx.request({
                                url: 'http://php.lcxcw.club/index/index/getToken',
                                data: {
                                    codeID: res.code
                                },
                                header: {
                                },
                                success(ress) {
                                    if (ress.data.code == 200) {
                                        wx.setStorageSync('token', ress.data.data);
                                        resolve('ok');
                                    }
                                }
                            })
                        } else {
                            reject('can not get codeID');
                        }
                    },
                });
            })
        }
        if (!token) {
            getTokey();
        }
        wx.request({
            url: url,
            data: data,
            method: method,
            header: {
                'Authorization': token
            },
            async success(res) {
                    if (res.data.code && res.data.code == 401) {
                        wx.setStorageSync('token', '');
                        return;
                    }
                    if (res.data.code && res.data.code == 402) {
                        await getTokey();
                        ajax(url, method, data)
                            .then(
                                result => {
                                    resolve(result);
                                }
                            )
                    } else {
                        resolve(res.data);
                    }
            }
        })
            
    })
}

export default ajax;