<template>
  <view class="songlist">
    <view>
      <!-- //背景 -->
      <helangBlur :params="params"></helangBlur>
      <view :class="{ nav: true }">
        <!-- 返回+歌单 -->
        <image
          src="../../static/picture/return.png"
          mode="aspectFit"
          @click="goback"
        ></image>
        <text>歌单</text>
      </view>
      <!-- 图片 -->
      <view v-if="songlist.length !== 0">
        <image
          :src="userDetail.coverImgUrl"
          mode="aspectFit"
          class="bookmark"
        ></image>
        <text class="iconfont icon-play Counttext">{{
          getCount(userDetail.playCount)
        }}</text>
        <!-- 歌单名字 -->
        <view class="listdetail">
          <view class="listname">
            {{ userDetail.name }}
          </view>
          <!-- 用户 -->
          <image
            :src="userDetail.creator.avatarUrl"
            mode="aspectFit"
            class="userimg"
          ></image>
          <view class="username">
            <text>{{ userDetail.creator.nickname }}</text>
          </view>
          <!-- 歌单描述 -->
          <view class="remark">
            <text class="describe">
              {{ userDetail.description ? userDetail.description : "编辑信息" }}
            </text>
            <text
              class="iconfont icon-like"
              style="margin-left: 30rpx"
              :style="{ color: color }"
              @click="like()"
            ></text>
          </view>
        </view>
      </view>

      <view class="myscroll" v-if="songlist.length !== 0">
        <view class="listnav">
          <text class="iconfont icon-play"></text>
          <text class="list">歌单列表</text>
          <text class="listnum">（共{{ songlist.length }}首）</text>
        </view>
        <scroll-view scroll-y="true" :style="{ height: mainHeight + 'px' }">
          <view
            class="songItem"
            v-for="(item, index) in songlist"
            :key="item.id"
            @click="toThesong(item.fee, index, songlist)"
          >
            <view class="index">
              <text class="indexnum">{{ index + 1 }}</text>
            </view>
            <view class="songdetail">
              <view class="songtitle">
                <text class="songname">{{ item.name }}</text>
                <text
                  class="songsubname"
                  v-if="item.tns || item.alia.length !== 0"
                  >（{{ item.tns ? item.tns[0] : item.alia[0] }})</text
                >
              </view>
              <view class="singer">
                <text v-if="item.fee === 1" class="vip">vip</text>
                <text v-for="(item1, index1) in item.ar" :key="item1.id">{{
                  index1 === 0 ? item1.name : "/" + item1.name
                }}</text>
                <text>-{{ item.al.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import helangBlur from "@/components/helang-blur/helang-blur.vue";
import { mapMutations, mapState } from "vuex";
export default {
  components: {
    helangBlur,
  },
  data() {
    return {
      // 歌单id
      id: "",
      // 爱心颜色
      color: "#fff",
      // 列表高度
      mainHeight: 500,
      // 歌单用户信息
      userDetail: "",
      // 歌单信息
      songlist: [],
      // 水雾组件数据
      params: {
        width: "300rpx",
        height: "400rpx",
        image: "../../static/picture/bg.jpg",
        blur: "xl",
      },
    };
  },
  methods: {
    ...mapMutations(["getIndex", "getPlayList", "getIsBtn"]),
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
    getLike() {
      let _this = this;
      if (this.isShow) {
        wx.showLoading({title: '请稍等'});
        this.$ajax(
          `http://php.lcxcw.club/index/collect/getLike?id=${_this.id}`
        ).then((res) => {
          if (res.data) {
            _this.color = "#FF5E52";
            wx.hideLoading()
          }
        });
      }
    },
    delLike() {
      let _this = this;
      this.$ajax(
        `http://php.lcxcw.club/index/collect/delLike?id=${_this.id}`
      ).then((res) => {
        console.log(res.data);
        if (res.data == true) {
          _this.color = "#fff";
          uni.showToast({
            icon: "none",
            title: "删除成功",
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
    addLike() {
      let _this = this;
      this.$ajax(
        `http://php.lcxcw.club/index/collect/addLike?listid=${_this.id}&name=${_this.userDetail.name}&picUrl=${_this.userDetail.coverImgUrl}`
      ).then((res) => {
        console.log(res.data);
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
    toThesong(e, i, list) {
      if (e === 1) {
        uni.showToast({
          icon: "none",
          title: "vip受限，无法播放",
          duration: 1000,
        });
        return console.log("版权受限");
      } else {
        this.modifyInfo(list, i);
        uni.navigateTo({
          url: `/pages/musicPage/musicPage`,
        });
      }
    },
    getCount(num) {
      if (num >= 100000 && num < 100000000) {
        return parseInt(num / 10000) + "万";
      } else if (num >= 100000000) {
        return parseInt(num / 10000000) / 10 + "亿";
      } else {
        return num;
      }
    },
    goback() {
      uni.navigateBack();
    },
    async getPlayListDetail(e) {
      if (e == null) return;
      const res = await this.$http({
        url: "playlist/detail",
        data: {
          id: e,
        },
      });
      this.userDetail = res.data.playlist || [];
      let urls = "";
      res.data.playlist.trackIds.forEach((item, index) => {
        if (index === 0) {
          urls = item.id;
        } else {
          urls = urls + "," + item.id;
        }
      });
      const res1 = await this.$http({
        url: "song/detail",
        data: {
          ids: urls,
        },
      });
      this.songlist = res1.data.songs;
      this.getSongDetail(this.songlist, urls);
      this.params.image = this.userDetail.coverImgUrl;
      wx.hideLoading();
    },
    // 获取音乐详情
    getSongDetail(list, urls) {
      this.playsList = list;
      this.playsList.map((item, index) => {
        item.singerName = this.isArtists(item.ar);
        item.picUrl = item.al.picUrl || [];
        return;
      });
      this.getSongUrl(urls);
    },
    // 获取音乐链接
    async getSongUrl(urls) {
      const res = await this.$http({
        url: "song/url",
        data: {
          id: urls,
        },
      });
      this.playsList.forEach((item) => {
        res.data.data.forEach((i) => {
          if (item.id === i.id) {
            return (item.url = i.url) || [];
          }
        });
      });
    },
    // 获得要播放音乐的索引
    modifyInfo(list, index) {
      this.getIndex(index);
      this.getPlayList(list);
      if (this.$audio.src === this.playList[index].url) {
        uni.navigateTo({
          url: `../../musicPage/musicPage`,
        });
      }
      this.getIsBtn(true);
    },
    // 处理歌手名字
    isArtists(data) {
      let artists = data.map((item) => {
        return item.name + "/";
      });
      artists = artists.join("");
      artists = artists.slice(0, artists.length - 1);
      return artists;
    },
  },
  computed: {
    ...mapState(["isShow", "isBtn", "playList", "subscript"]),
  },
  onLoad(e) {
    wx.showLoading({title: '加载中', icon: 'loading', duration: 10000});
    this.id = e.id;
    if (this.isShow) {
      this.getLike(e.id);
    }
    const Magnification = uni.getSystemInfoSync().windowWidth / 750;
    this.mainHeight =
      uni.getSystemInfoSync().windowHeight - 550 * Magnification;
    this.params.height = uni.getSystemInfoSync().windowHeight + "px";
    this.params.width = uni.getSystemInfoSync().windowWidth + "px";
    this.getPlayListDetail(e.id);
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
.vip {
  display: inline-block;
  color: #ec4141 !important;
  border: 1px solid #ec4141;
  transform: scale(0.7);
}

.listdetail {
  position: absolute;
  top: 150rpx;
  z-index: 1;
  left: 315rpx;

  .userimg {
    margin-top: 10rpx;
    margin-bottom: 10rpx;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    vertical-align: middle;
  }

  .listname {
    font-size: 35rpx;
    color: #ffffff;
    max-width: 400rpx;
    margin-bottom: 10rpx;
  }

  .username {
    margin-top: 10rpx;
    margin-bottom: 10rpx;
    padding-left: 20rpx;
    max-width: 250rpx;
    display: inline-block;
    vertical-align: middle;
    font-size: 25rpx;
    color: #efefef;

    .iconfont {
      font-size: 25rpx;
    }
  }

  .remark {
    font-size: 20rpx;
    color: #efefef;

    .describe {
      display: inline-block;
      margin-left: 80rpx;
      max-width: 250rpx;
      max-height: 105rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
  }
}

.bookmark {
  position: absolute;
  top: 150rpx;
  left: 30rpx;
  height: 250rpx;
  width: 250rpx;
  z-index: 1;
  border-radius: 20rpx;
  filter: brightness(75%);
  -webkit-filter: brightness(75%);
}

.Counttext {
  top: 160rpx;
  right: 490rpx;
  display: block;
  font-size: 25rpx;
  color: #ffffff;
  position: absolute;
  z-index: 2;
}

.nav {
  width: 100%;
  position: absolute;
  top: 50rpx;
  z-index: 999;

  image {
    width: 80rpx;
    height: 80rpx;
    margin-left: 10rpx;
    vertical-align: middle;
  }

  text {
    vertical-align: middle;
    padding-left: 20rpx;
    font-size: 40rpx;
  }

  color: #ffffff;
}

.myscroll {
  position: absolute;
  width: 100%;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  top: 450rpx;
  background-color: #ffffff;
  z-index: 1;

  .listnav {
    padding-left: 30rpx;
    margin-top: 20rpx;
    height: 80rpx;

    .iconfont {
      font-size: 50rpx;
      vertical-align: middle;
    }

    .list {
      font-size: 30rpx;
      vertical-align: middle;
      padding-left: 15rpx;
    }

    .listnum {
      font-size: 25rpx;
      vertical-align: middle;
      color: #808080;
    }
  }

  .songItem {
    margin-left: 30rpx;
    height: 100rpx;

    .songdetail {
      display: inline-block;
      width: 500rpx;
      vertical-align: middle;

      .songtitle {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .songname {
        font-size: 30rpx;
      }

      .songsubname {
        font-size: 30rpx;
        color: #909090;
      }

      .singer {
        font-size: 25rpx;
        color: #909090;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .index {
      display: inline-block;
      height: 100rpx;
      line-height: 100rpx;
      width: 50rpx;
      padding-right: 30rpx;
      vertical-align: middle;
      text-align: center;

      .iconfont {
        color: #ec4141;
        font-size: 50rpx;
      }

      text {
        display: inline-block;
        color: #909090;
        font-size: 35rpx;
      }
    }
  }
}
</style>
