<script>
	export default {
		onLaunch: function() {
			if (!wx.getStorageSync('token')) {
				wx.login({
                    success(res) {
                        if (res.code) {
							console.log(res.code);
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
										console.log(ress.data.data);
										wx.setStorageSync('token', ress.data.data);
									}
                                }
                            })
                        } else {
                        }
                    },
                });
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
 	@import "uview-ui/index.scss";
	@import './common/common.css';
</style>
