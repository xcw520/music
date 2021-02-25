<template name="Mine">
  <view class="mine">
    <!-- user info -->
    <view class="mine-user">
      <view v-if="!isShow" class="user-info">
        <view class="user-ico">
          <image src="http://lcxcw.club/music/static/icon/attar.png"  style="width:100rpx; height:100rpx;">
        </view>
        <view class="user-msg">登录立享全部体验</view>
        <button
          class="user-login"
          style="font-size: 24rpx; padding: 6rpx"
          open-type="getUserInfo"
          @click="login()"
        >
          立即登录
        </button>
      </view>
      <view v-else class="user-info">
        <view class="user-ico">
          <image class="img" :src="attar"></image>
        </view>
        <view class="user-msg2">{{ nickname }}</view>
      </view>
    </view>
    <!-- user category -->
    <view class="user-category">
      <view class="cate-class">
        <image src="http://lcxcw.club/music/static/icon/history.png"  style="width:80rpx;height:80rpx;" @click="goto(0)">
        <view class="cate-name">历史歌曲</view>
      </view>
      <view class="cate-class">
        <image src="http://lcxcw.club/music/static/icon/hobby.png"  style="width:80rpx;height:80rpx;" @click="goto(1)">
        <view class="cate-name">我的收藏</view>
      </view>
      <view class="cate-class">
        <image src="http://lcxcw.club/music/static/icon/more.png"  style="width:80rpx;height:80rpx;" @click="goto(2)">
        <view class="cate-name">发现更多</view>
      </view>
    </view>
    <view class="user-new-title">
      <view class="new-title">收藏歌单</view>
    </view>
    <view class="collectList" v-if="isShow">
      <view class="item" v-for="item in list" :key="item.listid">
        <view class="icon" @click="tosonglist(item.listid)">
          <image :src="item.picUrl"></image>
        </view>
        <view class="desc">{{ item.name }}</view>
      </view>
    </view>
    <!-- last -->
    <view class="last">到底啦&nbsp;~</view>
    <!-- 背景 -->
    <view
      class="bg"
      style="
        background: url('http://lcxcw.club/music/static/picture/bg.jpg') center;
        background-size: 100%;
      "
    ></view>
  </view>
</template>

<script>
import { mapMutations, mapState } from "vuex";
export default {
  name: "Mine",
  data() {
    return {
      attar: "",
      nickname: "",
      list: [],
      show: false
    };
  },
  onShow() {
    this.getList();
  },
  methods: {
    ...mapMutations(["getIsShow"]),
    getList() {
      if (this.isShow) {
        this.$ajax("http://php.lcxcw.club/index/collect/getcollect").then(
          (res) => {
            this.list = res.data;
          }
        );
      }
    },
    login() {
      let _this = this;
      wx.getUserInfo({
        success: function (res) {
          _this.attar = res.userInfo.avatarUrl;
          _this.nickname = res.userInfo.nickName;
          _this.getIsShow(true);
          _this.getList();
        },
      });
    },
    tosonglist(e) {
      uni.navigateTo({
        url: "../songlist/songlist?id=" + e,
      });
    },
    goto(id) {
      if (id == 2) {
        wx.switchTab({
          url: "../search/index",
        });
      } else {
        if (this.isShow) {
          if (id == 0) {
            uni.navigateTo({
              url: `/pages/history/index`,
            });
          }
          if (id == 1) {
            uni.navigateTo({
              url: `/pages/hobby/index`,
            });
          }
        } else {
          uni.showToast({
            icon: "none",
            title: "请登录",
            duration: 1000,
          });
        }
      }
    },
  },
  computed: {
    isShow: {
      get() {
        return this.$store.state.isShow;
      },
      set(val) {
        this.getIsShow(val);
      },
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
.mine {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  .mine-user {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
    .user-ico {
      margin-left: 45rpx;
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: #c0c0c0;
      text-align: center;
      line-height: 110rpx;
      .img {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 1px solid #888;
      }
    }
    .user-msg {
      margin-left: 25rpx;
      font-size: 12px;
    }
    .user-msg2 {
      margin-left: 50rpx;
      font-size: 50rpx;
      font-weight: 700;
    }
    .user-info {
      display: flex;
      height: 200rpx;
      align-items: center;
      justify-content: center;
      .user-icon {
        font-size: 36px;
        color: #666;
      }
    }
    .user-login {
      margin: 35rpx;
      margin-left: 200rpx;
      border: 1px solid #c0c0c0;
      border-radius: 10px;
    }
  }
}
.user-category {
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 0 25rpx;
  .cate-class {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .cate-name {
      font-size: 13px;
      text-align: center;
      font-weight: 300;
      margin-top: 10rpx;
    }
  }
}
.user-new-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 80rpx;
  margin-bottom: 30rpx;
  .new-title {
    margin-left: 25rpx;
    font-size: 16px;
  }
}
.collectList {
  box-sizing: border-box;
  width: 100%;
  padding: 0 10rpx;
  .item {
    width: 33%;
    height: 330rpx;
    margin-top: 10rpx;
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
    height: 80rpx;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 30rpx;
  }
}
.last {
  width: 100%;
  height: 80rpx;
  margin-top: 55rpx;
  text-align: center;
  font-size: 12px;
  color: #eee;
}
</style>
