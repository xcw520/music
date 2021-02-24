<template>
  <view class="musicPage">
    <!-- 歌曲信息 -->
    <view class="pageHead">
      <text
        class="iconfont icon-left"
        style="margin: 0 26rpx; color: #f1f1f1; font-size: 60rpx"
        @click="backPage"
      ></text>
      <view class="info">
        <view class="name">{{ playList[subscript].name }}</view>
        <view class="singer">
          {{ playList[subscript].singerName }}
          <u-icon name="arrow-right" color="#DFDFDF" size="26"></u-icon>
        </view>
      </view>
    </view>
    <!--歌词及唱片机 -->
    <view class="pageMain" @click.self="isLyrics = !isLyrics">
      <view class="recordPlayer" v-if="isLyrics">
        <swiper
          class="pageSwiper"
          :duration="duration"
          :circular="circular"
          :current="subscript"
          @change="getCurrent"
          @transition="pageTransition"
          @animationfinish="pageAnimationfinish"
        >
          <swiper-item
            v-for="(item, i) in playList"
            :key="item.id"
            @click="isLyrics = !isLyrics"
          >
            <view
              class="imgBox"
              :class="[
                isBtn && i === subscript && isSpin ? 'spin' : 'noSpin',
                i === subscript ? '' : 'rotate',
              ]"
            >
              <image
                style="width: 540rpx; height: 540rpx"
                src="../../static/image/play_disc.png"
              ></image>
              <image
                class="songImg"
                style="width: 320rpx; height: 320rpx; border-radius: 50%"
                :src="item.picUrl"
              ></image>
            </view>
          </swiper-item>
        </swiper>
        <image
          class="pointer"
          :class="isBtn && isSpin ? 'angle' : ''"
          src="../../static/image/play_needle.png"
        ></image>
      </view>
      <!-- 歌词 -->
      <view class="lyricsBox" v-else>
        <!-- 歌词滚动区 -->
        <view class="lyrics" @click="isLyrics = !isLyrics">
          <bingLyric
            :lyrics="lyrics.data.lrc.lyric"
            :curTime="currentTime"
            :areaStyle="areaStyle"
            :centerStyle="centerStyle"
          ></bingLyric>
        </view>
      </view>
    </view>
    <!-- 进度条及功能区 -->
    <view class="pageFeatures">
      <!-- 播放进度条 -->
      <view class="progress-bar">
        <text>{{ nowPlayTime }}</text>
        <view class="linBox">
          <text class="line" ref="linRef"></text>
          <view class="activityLine">
            <view class="activityLineItem" :style="isWidth"
              ><text class="iconfont icon-dots"></text
            ></view>
          </view>
        </view>
        <text>{{ theendtime }}</text>
      </view>
      <!-- 音量调节 -->
      <view class="volume" v-if="isVolume == true">
        <u-slider
          class="slider"
          v-model="volumes"
          block-width="20"
          step="1"
          height="4"
          active-color="#f1f1f1"
          inactive-color="rgba(255,255,255,.5)"
          @moving="setVolume"
        >
          <!-- 这里外面需要多一层view，否则".badge-button"样式可能不生效 -->
          <view class="">
            <view class="badge-button">
              {{ volumes }}
            </view>
          </view>
        </u-slider>
      </view>
      <!-- 按钮功能区 -->
      <view class="play-btn">
        <text
          class="iconfont icon-like"
          :style="{ color: color }"
          @click="like()"
        ></text>
        <text
          class="iconfont"
          :class="playStyle[key]"
          @click="changeStyle(key)"
        ></text>
        <text class="iconfont icon-top-music" @click="topMusic"></text>
        <!-- 播放与暂停 -->
        <view class="playPause">
          <text class="iconfont icon-pause" v-if="isBtn" @click="pause"></text>
          <text class="iconfont icon-play" v-else @click="play"></text>
        </view>
        <text class="iconfont icon-next-music" @click="nextMusic"></text>
        <text
          class="iconfont"
          :class="classVolume"
          @click="function () {this.isVolume = !this.isVolume;}"
        ></text>
        <view class="comments" @click="goCommentPage">
          <text class="iconfont icon-comment"></text>
          <text class="total">{{ total }}</text>
        </view>
      </view>
    </view>
    <!-- 背景 -->
    <view class="bg" :style="isBg"></view>
  </view>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import bingLyric from "@/components/bing-lyric/bing-lyric.vue";

export default {
  data() {
    return {
      // 音量/静音切换
      classVolume: ".icon-guangbo",
      // 播放模式
      playStyle: ["icon-lbxh", "icon-loop", "icon-suijibofang"],
      // 播放模式索引
      key: 0,
      theendtime: '',
      // 爱心颜色
      color: "#fff",
      // 显示音量调节
      isVolume: false,
      // 动画时间
      duration: 0,
      // 判断动画是否暂停
      isSpin: true,
      // 判断是否采取循环
      circular: true,
      // 播放进度条宽度
      offsetWidth: 0,
      // 每秒前进的宽度
      Swidth: 0,
      // 当前进度条长度
      activeWidth: 0,
      isLyrics: true,
      // 歌词
      lyrics: "",
      // 歌词背景设置
      areaStyle: {
        background: "0",
      },
      centerStyle: {
        btnImg: "../../static/image/btn.png",
      },
      // 音量
      volume: 100,
      // 总评论数
      total: "",
    };
  },
  components: {
    bingLyric,
  },
  onLoad() {
    this.getTime();
    wx.showLoading({ title: "加载中", icon: "loading", duration: 10000 });
    if (this.isShow && this.playList[this.subscript].id) {
      this.getLike(this.playList[this.subscript].id);
      this.addHistory(this.playList[this.subscript].id);
    }
    this.getLyrics();
    this.getComment();
  },
  async onReady() {
    this.getTime();
    // 获取进度条长度
    this.offsetWidth = await this.getLineWidth(".line");
    // 初始化每秒前进的宽度
    this.getSwindth();
    // 初始化当前进度条长度
    this.activeWidth = this.Swidth * parseFloat(this.$audio.currentTime);
    // 初始化定时器
    if (this.isBtn && !this.$setInterval) {
      this.$setInterval = setInterval(() => {
        //   console.log('在走了在走了');
        this.getActiveWidth();
      }, 1000);
    }
    wx.hideLoading();
    if (!this.isBtn && this.$audio.src) {
      this.$audio.play();
    }
  },
  onUnload() {
    clearInterval(this.$setInterval);
  },
  methods: {
    ...mapMutations([
      "getIsBtn",
      "getIsShow",
      "getIndex",
      "addIndex",
      "reduceIndex",
      "getEndTime",
      "getTotalTime",
      "getVolume",
      "getStyle",
      "getnowPlayTime",
      "getCurrentTime",
    ]),
    changeStyle(key) {
      if (this.key + 1 == 3) {
        uni.showToast({
          icon: "none",
          title: "循环播放",
          duration: 1000,
        });
        this.key = 0;
        this.getStyle(this.key);
      } else {
        if (key == 0) {
          uni.showToast({
            icon: "none",
            title: "单曲循环",
            duration: 1000,
          });
          this.key++;
          this.getStyle(this.key);
        } else if (key == 1) {
          uni.showToast({
            icon: "none",
            title: "随机播放",
            duration: 1000,
          });
          this.key++;
          this.getStyle(this.key);
        }
      }
    },
    addHistory() {
      let _this = this;
      let time = new Date().getTime();
      this.$ajax(
        `http://php.lcxcw.club/index/history/add?musicid=${
          _this.playList[_this.subscript].id
        }&name=${_this.playList[_this.subscript].name}&artists=${
          _this.playList[_this.subscript].singerName
        }&time=${time}`
      ).then((res) => {
        if (res.data == true) {
        } else {
          uni.showToast({
            icon: "none",
            title: "自动记录播放历史失败",
            duration: 1000,
          });
        }
      });
    },
    like() {
      if (this.isShow) {
        if (this.color == "#fff") {
          this.addLike();
        }
        if (this.color == "#FF5E52") {
          this.delLike();
        }
      } else {
        uni.showToast({
          icon: "none",
          title: "请登录",
          duration: 1000,
        });
      }
    },
    getLike(id) {
      let _this = this;
      if (this.isShow) {
        this.$ajax(
          `http://php.lcxcw.club/index/hobby/getLike?musicid=${id}`
        ).then((res) => {
          if (res.data) {
            _this.color = "#FF5E52";
          }
        });
      }
    },
    delLike() {
      let _this = this;
      this.$ajax(
        `http://php.lcxcw.club/index/hobby/delLike?musicid=${
          _this.playList[_this.subscript].id
        }`
      ).then((res) => {
        if (res.data) {
          _this.color = "#fff";
          uni.showToast({
            icon: "none",
            title: "删除成功",
            duration: 1000,
          });
        }
      });
    },
    addLike() {
      let _this = this;
      this.$ajax(
        `http://php.lcxcw.club/index/hobby/addLike?musicid=${
          _this.playList[_this.subscript].id
        }&name=${_this.playList[_this.subscript].name}&artists=${
          _this.playList[_this.subscript].singerName
        }`
      ).then((res) => {
        // console.log(res.data);
        if (res.data == true) {
          _this.color = "#FF5E52";
          uni.showToast({
            icon: "none",
            title: "收藏成功",
            duration: 1000,
          });
        } else {
          uni.showToast({
            icon: "none",
            title: res.data,
            duration: 1000,
          });
        }
      });
    },
    // 改变音量
    setVolume() {
      this.$audio.volume = this.volumes / 100;
      // console.log(this.val);
    },
    // 返回上一页
    backPage() {
      uni.navigateBack();
    },
    // 播放与暂停
    play() {
      this.$audio.play();
      this.getIsBtn(true);
    },
    pause() {
      this.$audio.pause();
      this.getIsBtn(false);
    },
    // current值发生改变时触发的事件
    getCurrent(e) {
      if (e.detail.source === "touch") {
        this.getIndex(e.detail.current);
        this.getIsBtn(true);
      }
    },
    // swiper-item位置发生变化时触发的事件
    pageTransition() {
      this.duration = 500;
      this.isSpin = false;
    },
    // 动画结束后触发的事件
    pageAnimationfinish() {
      this.duration = 0;
      this.isSpin = true;
    },
    // 上一首
    topMusic() {
      this.circular = false;
      this.getIsBtn(true);
      this.duration = 1000;
      if (this.subscript === 0) {
        this.circular = true;
        this.getIndex(this.length);
        return;
      }
      if (this.key == 1) {
        this.$audio.seek(0);
        this.getCurrentTime(0);
        this.getnowPlayTime("00:00");
        this.activeWidth = 0;
      } else {
        this.reduceIndex();
        this.getTime();
      }
    },
    // 下一首
    nextMusic() {
      this.getIsBtn(true);
      this.duration = 1000;
      if (this.subscript === this.length) {
        this.circular = true;
        this.getIndex(0);
        return;
      }
      if (this.key == 1) {
        this.$audio.seek(0);
        this.getCurrentTime(0);
        this.getnowPlayTime("00:00");
        this.activeWidth = 0;
      } else {
        this.addIndex();
        this.getTime();
      }
    },
    //获取进度条长度
    getLineWidth(name) {
      return new Promise((res, rej) => {
        uni
          .createSelectorQuery()
          .select(name)
          .fields(
            {
              size: true,
            },
            (data) => {
              res(data.width);
            }
          )
          .exec();
      });
    },
    // 获取每秒前进的宽度
    getSwindth() {
      if (this.offsetWidth > 0) {
        this.Swidth = this.offsetWidth / this.totalTime;
      }
    },
    // 当前进度条长度
    getActiveWidth() {
      this.activeWidth += this.Swidth;
    },

    // 获取初始化评论数据
    async getComment() {
      const res = await this.$http({
        url: `comment/music?id=${this.playList[this.subscript].id}&limit=1`,
      });
      if (res.data.total > 999) {
        return (this.total = "999+");
      } else if (res.data.total > 10000) {
        return (this.total = "1W+");
      } else if (res.data.total > 100000) {
        return (this.total = "10W+");
      } else {
        return (this.total = res.data.total);
      }
    },
    // 获取歌词
    async getLyrics() {
      const res = await this.$http({
        url: "lyric",
        data: {
          id: this.playList[this.subscript].id,
        },
      });
      if (res.data.lrc && res.data.lrc.lyric)
      {
        res.data.lrc.lyric = res.data.lrc.lyric
          .replace(/\[/g, "sb[")
          .split("sb");
      }
      this.lyrics = res || [];
    },
    getTime() {
      let time = (this.playList[this.subscript].song.duration*1)/1000;
      this.getTotalTime(time);
      let m = parseInt(time / 60);
      m = m < 10 ? "0" + m : m;
      let s = parseInt(time % 60);
      s = s < 10 ? "0" + s : s;
      time = m + ":" + s;
      this.getEndTime(time);
      this.theendtime = this.endTime;
    },
    // 跳转评论页面
		goCommentPage() {
			uni.navigateTo({
				url: `songComment/songComment?id=${this.playList[this.subscript].id}`
			});
		},
  },
  computed: {
    ...mapState([
      "playList",
      "subscript",
      "isShow",
      "isBtn",
      "endTime",
      "nowPlayTime",
      "totalTime",
      "currentTime",
    ]),
    ...mapGetters(["length"]),
    isBg() {
      return `background: url(${this.playList[this.subscript].picUrl}) center;`;
    },
    isWidth() {
      // console.log('宽度变了');
      return `width: ${this.activeWidth}px`;
    },
    volumes: {
      set(val) {
        this.getVolume(val);
      },
      get() {
        return this.$store.state.volume;
      },
    },
  },
  watch: {
    // 监听subscript变化更改url
    subscript() {
      this.$audio.src = this.playList[this.subscript].url;
      this.getTime();
      this.getLyrics();
      this.getComment();
      this.activeWidth = 0;
      this.getSwindth();
    },
    // 监听进度条确保不会超过总长度
    activeWidth() {
      if (this.activeWidth > this.offsetWidth) {
        this.activeWidth = 0;
      }
    },
    // 监听总时长的变化重新计算每秒宽度
    totalTime() {
      this.activeWidth = 0;
      this.getSwindth();
    },
    // 监听播放与暂停,判断定时器启用和消除
    isBtn(val) {
      if (!val) {
        clearInterval(this.$setInterval);
      } else {
        this.$setInterval = setInterval(() => {
          this.getActiveWidth();
        }, 1000);
      }
    },
    volumes() {
      this.setVolume();
      if (this.volumes <= 0) {
        this.classVolume = ".icon-jingyin";
      } else {
        this.classVolume = ".icon-guangbo";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bg {
  position: fixed;
  top: 0px;
  left: 0px;
  height: 110%;
  width: 110%;
  margin: -5%;
  background-size: cover;
  -webkit-filter: blur(10px) brightness(0.6);
  -moz-filter: blur(10px) brightness(0.6);
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=10, MakeShadow=false); /* makeshadow=false意为将产生阴影的效果，pixelradius参数是设置模糊效果的作用深度 */
  z-index: -1;
}
.musicPage {
  height: 100%;
  .navbar {
    .u-border-bottom:after {
      border-bottom-width: 0px;
    }
  }
}
.pageHead {
  flex: 1;
  display: flex;
  height: calc(11vh - var(--window-top));
  align-items: center;
  .info {
    width: 70%;
    margin: 0 auto;
    text-align: left;
    .name {
      margin-top: 25rpx;
      font-size: 32rpx;
      color: #f1f1f1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .singer {
      font-size: 26rpx;
      color: #dfdfdf;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
.pageMain {
  flex: 1;
  height: calc(70.5vh - var(--window-top));
  height: calc(70.5vh - var(--window-top));
  overflow: hidden;
  .pageSwiper {
    margin: 200rpx auto 0;
    height: 540rpx;
  }
  .imgBox {
    position: relative;
    margin: 0 auto;
    width: 540rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    .songImg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .pointer {
    position: absolute;
    top: 130rpx;
    left: 44%;
    width: 210rpx;
    height: 330rpx;
    transform: rotate(-30deg);
    transform-origin: 20px 20px;
    transition: transform 0.8s;
  }
}
.volume {
  float: right;
  display: flex;
  height: 40rpx;
  align-items: center;
  margin-right: 80rpx;
  .icon-volume {
    color: #ccc;
    margin: 0 30rpx 0 50rpx;
    font-size: 36rpx;
  }
  .slider {
    width: 200rpx;
    .badge-button {
      padding: 4rpx 6rpx;
      background-color: $u-type-error;
      color: #fff;
      border-radius: 10rpx;
      font-size: 22rpx;
      line-height: 1;
    }
  }
}
.pageFeatures {
  height: calc(18.5vh - var(--window-top));
  height: calc(18.5vh - var(--window-top));
  color: #f1f1f1;
  padding-top: 60rpx;
  padding-top: 10rpx;
  .play-btn {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 40rpx;
    text {
      font-size: 38rpx;
    }
    .playPause {
      text {
        font-size: 80rpx;
      }
    }
    .comments {
      position: relative;
      width: 80rpx;
      .total {
        position: absolute;
        display: inline-block;
        width: 64rpx;
        height: 34rpx;
        font-size: 24rpx;
        right: -8rpx;
        top: -10rpx;
      }
    }
  }
  .progress-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40rpx;
    text {
      font-size: 24rpx;
    }
    .linBox {
      display: flex;
      position: relative;
      margin: 0 30rpx;
    }
    .line {
      width: 500rpx;
      height: 2px;
      background-color: rgba($color: #fff, $alpha: 0.6);
    }
    .activityLine {
      position: absolute;
      left: 0;
      .activityLineItem {
        position: relative;
        height: 2px;
        background-color: #fff;
        .icon-dots {
          position: absolute;
          right: -32rpx;
          top: -38rpx;
          font-size: 60rpx;
        }
      }
    }
  }
}

/* 动画 */
@keyframes rotate-disk {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes rotate-disk1 {
  100% {
    transform: rotate(0deg);
  }
}
.spin {
  animation: rotate-disk 20s infinite normal linear;
  animation-play-state: play;
}
.noSpin {
  animation: rotate-disk 20s infinite normal linear;
  animation-play-state: paused;
}
.rotate {
  animation: rotate-disk1 0s infinite normal linear;
}
.pageMain .angle {
  transform: rotateZ(-2deg);
}
</style>
