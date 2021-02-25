<template>
  <view class="page">
    <swiper
      :indicator-dots="true"
      :autoplay="true"
      class="swiper"
      :interval="3000"
      :duration="1000"
      circular="true"
    >
      <swiper-item v-for="(item, index) in swiperList" :key="index">
        <image :src="item.imageUrl" class="swiper-image" mode=""></image>
      </swiper-item>
    </swiper>
    <scroll-view scroll-y="true" class="recommend-content">
      <!-- 推荐歌单区域 -->
      <aui-scroll-view title="推荐歌单" :list="recommendList"></aui-scroll-view>
      <!-- 推荐歌曲区域 -->
      <view class="text">推荐歌曲</view>
      <view>
        <view
          class="item"
          v-for="(item, index) in recommendMusic"
          :key="item.id"
        >
          <view class="icon" @click="goPlayMusic(recommendMusic, index)">
            <image :src="item.song.album.picUrl"></image>
          </view>
          <view class="desc">{{ item.name }}</view>
          <view class="desc">{{ item.song.artists[0].name }}</view>
        </view>
      </view>
    </scroll-view>
    <!-- 背景 -->
    <view
      class="bg"
      style="
        background: url('http://lcxcw.club/music/static/picture/index.jpg') center;
        background-size: 100%;
      "
    ></view>
  </view>
</template>
<script>
import auiScrollView from "@/components/aui-scroll-view/aui-scroll-view.vue";
import { mapMutations, mapState } from "vuex";

export default {
  components: {
    auiScrollView,
  },
  data() {
    return {
      swiperList: [],
      recommendList: [],
      recommendMusic: [],
    };
  },
  async onLoad() {
    this.getBanner();
    this.getList();
    this.getSongs();
  },
  methods: {
    ...mapMutations(["getIndex", "getPlayList", "getIsBtn"]),
    async getBanner() {
      const res = await this.$http({
        url: `banner`,
      });
      if (res.data.code === 200) {
        this.swiperList = res.data.banners.splice(0, 4);
      }
    },
    async getList() {
      const res = await this.$http({
        url: `personalized`,
      });
      if (res.data.code === 200) {
        this.recommendList = res.data.result.splice(0, 6);
      }
    },
    async getSongs() {
      const res = await this.$http({
        url: `personalized/newsong`,
      });
      if (res.data.code === 200) {
        let list = res.data.result.splice(0, 9);
        list.forEach(async (item, index) => {
          item.singerName = this.$music.isArtists(item.song.artists);
          item.picUrl = await this.$music.getSongInfo(item.id, this);
          item.url = await this.$music.getSongUrl(item.id, this);
        });
        this.recommendMusic = list;
        // console.log(this.recommendMusic);
      }
    },
    // 去歌曲页面
    goPlayMusic(list, i) {
      if (this.recommendMusic[i].url == null) {
        uni.showToast({
          icon: "none",
          title: "暂时无法播放，换一首吧",
          duration: 1000,
        });
        return;
      }
      this.getIndex(i);
      this.getPlayList(list);
      if (!this.isBtn && this.$audio.src) {
        this.$audio.play();
      }
      uni.navigateTo({
        url: `/pages/musicPage/musicPage`,
      });
      this.getIsBtn(true);
    },
    // 处理歌手名字
    isArtists(data) {
      // console.log(data);
      let artists = data.map((item) => {
        return item.name + "/";
      });
      artists = artists.join("");
      artists = artists.slice(0, artists.length - 1);
      return artists;
    },
  },
  computed: {
    ...mapState(["isBtn", "playList", "subscript"]),
  },
  watch: {
    // 监听subscript变化更改url
    subscript() {
      this.$audio.src = this.playList[this.subscript].url;
    },
  },
};
</script>

<style lang="scss">

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
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=10, MakeShadow=false); /* IE6~IE9 */
  z-index: -1;
}
.swiper {
  width: 100%;
  height: 280rpx;
  margin-top: 2rpx;
  text-align: center;
}
.swiper-image {
  width: 95%;
  height: 98%;
  border-radius: 20rpx;
}
.recommend-content {
  display: flex;
  padding: 0 10rpx;
  box-sizing: border-box;
}
.text {
  padding-left: 30rpx;
  font-weight: bold;
  font-size: 35rpx;
  margin: 40rpx 0;
  color: #eee;
}
.item {
  flex: 1;
  width: 33%;
  height: 330rpx;
  display: inline-block;
  padding: 0 1%;
  box-sizing: border-box;
  overflow: hidden;
}
.icon {
  width: 100%;
  height: 220rpx;
  margin-bottom: 10rpx;
}
image {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-shadow: 1px 1px 10px #888;
}
.desc {
  font-size: 30rpx;
  color: #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>