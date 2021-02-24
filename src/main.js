import Vue from 'vue'
import App from './App'
import uView from "uview-ui";

import Ajax from './common/ajax'
import url from './common/config'
import Request from './common/request'
import Music from './common/music'
import store from './store/index.js';

Vue.use(uView);
Vue.prototype.$ajax = Ajax;
Vue.prototype.$http = Request;
Vue.prototype.$store = store;
Vue.prototype.$music = Music;
Vue.prototype.serverUrl = url;
Vue.config.productionTip = false;

// 挂载一个可全局访问的音频组件
let audio = uni.createInnerAudioContext();
audio.autoplay = true;
// 音频就绪后触发的回调函数
audio.onCanplay(() => {
	let time = audio.duration;
	store.commit('getTotalTime', time);
	let m = parseInt(time / 60);
	m = m < 10 ? '0' + m : m;
	let s = parseInt(time % 60);
	s = s < 10 ? '0' + s : s;
	time = m + ':' + s;
	store.commit('getEndTime', time);
})
// 音频进度更新后触发的时间
audio.onTimeUpdate(() => {
	let nowTime = audio.currentTime;
	store.commit('getCurrentTime', nowTime);
	let m = parseInt(nowTime / 60);
	m = m < 10 ? '0' + m : m;
	let s = parseInt(nowTime % 60);
	s = s < 10 ? '0' + s : s;
	let t = m + ':' + s;
	store.commit('getnowPlayTime', t);
})
// 音频自然播放结束后触发的事件
audio.onEnded(() => {
	if (store.state.style !=1 ) {
		if (store.state.subscript < store.getters.length) {
			store.commit('addIndex');
		} else {
			store.commit('getIndex', 0);
		}
	} else {
		audio.stop();
        store.commit('getCurrentTime', 0);
		store.commit('getnowPlayTime', '00:00');
		audio.play();
	}
})
Vue.prototype.$audio = audio;

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
