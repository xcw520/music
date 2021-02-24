//自写组件关于x轴的滑动窗口
<template>
  <view>
    <view class="recommendsong">
      <view class="recommendheader">
        <text style="color: #eee">{{ title }}</text>
      </view>
      <scroll-view scroll-x="true" class="recommendsonglist" enable-flex="true">
        <view v-for="(item, index) in list" :key="item.id" class="listItem">
          <view v-if="typeStyle === 1" @click="tosonglist(item.id)">
            <image :src="item.picUrl" mode="aspectFit" lazy-load="true"></image>
            <text>{{ item.name }}</text>
            <text class="iconfont icon-play playCount">{{
              getCount(item.playCount)
            }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "AuiScrollView",
  props: {
    typeStyle: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "1111",
    },
    detail: {
      type: String,
      default: "",
    },
    list: {
      type: Array,
      default: [111],
    },
  },
  methods: {
    getCount(num) {
      if (num >= 100000 && num < 100000000) {
        return parseInt(num / 10000) + "万";
      } else if (num >= 100000000) {
        return parseInt(num / 10000000) / 10 + "亿";
      } else {
        return num;
      }
    },
    tosonglist(e) {
      uni.navigateTo({
        url: "../songlist/songlist?id=" + e,
      });
    },
  },
};
</script>

<style lang="scss">
.recommendsonglist {
  display: flex;
  white-space: nowrap;
  height: 288rpx;
  .listItem:first-child {
    padding-left: 10rpx;
  }

  .listItem:last-child {
    padding-right: 10rpx;
  }

  .listItem {
    display: inline-block;
    position: relative;
    margin-right: 20rpx;
    vertical-align: top;
    image {
      width: 200rpx;
      height: 200rpx;
      border-radius: 10px;
      filter: brightness(75%);
    }

    text {
      width: 200rpx;
      line-height: 35rpx;
      font-size: 30rpx;
      padding: 15rpx 0;
      white-space: normal;
      color: #ddd;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .playCount {
      position: absolute;
      top: 50%;
      text-align: right;
      color: #eee;
    }
  }
}

.recommendsong {
  margin-top: 30rpx;
  margin-bottom: 60rpx;
  .recommendheader {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100rpx;
    justify-content: space-between;

    text {
      display: block;
      white-space: nowrap;
      padding-left: 30rpx;
      font-weight: bold;
      font-size: 35rpx;
    }

    view {
      padding-right: 30rpx;
      display: inline-block;
      width: 200rpx;
    }
  }
}
</style>
