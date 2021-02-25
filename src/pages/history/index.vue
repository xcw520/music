<template>
  <view class="song-list">
    <view class="song-list-head">
      <u-icon
        name="play-circle"
        color="#333"
        size="36"
        style="margin-right: 15rpx"
      ></u-icon>
      歌曲列表
      <text class="del" @click="clear">清空记录</text>
    </view>
    <view
      class="song-list-item"
      :class="Bg === index ? 'Bg' : ''"
      v-for="(item, index) in list"
      :key="item.musicid"
      @touchstart="touchstart(index)"
      @touchend="touchend"
      @click="goPlayMusic(list, index)"
    >
      <view class="song-list-info">
        <view class="songName">
          <view>
            {{ index + 1 + ". " }}
            {{ item.name }}
          </view>
          <view>­­­­­­­­­­{{ item.singerName }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  data() {
    return {
      Bg: "",
      list: null,
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    ...mapMutations(["getIndex", "getPlayList", "getIsBtn"]),
    async getList() {
      this.$ajax("http://php.lcxcw.club/index/history/getlist").then((res) => {
        res.data.forEach(async (item, index) => {
          item.singerName = item.artists;
          item.picUrl = await this.$music.getSongInfo(item.musicid, this);
          item.url = await this.$music.getSongUrl(item.musicid, this);
          item.id = item.musicid;
          return;
        });
        this.list = res.data;
      });
    },

    // 去歌曲页面
    goPlayMusic(list, i) {
      if (this.list[i].url == null) {
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
    clear() {
      let _this = this;
      uni.showModal({
        content: "确认要清空历史歌单吗？",
        success: function (res) {
          if (res.confirm) {
            _this
              .$ajax("http://php.lcxcw.club/index/history/clearlist")
              .then((res) => {
                if (res.data) {
                  uni.navigateTo({
                    url: `/pages/user/index`,
                  });
                  uni.showToast({
                    icon: "none",
                    title: "删除成功",
                    duration: 1000,
                  });
                  console.log(222);
                  uni.navigateBack();
                }
              });
          }
        },
      });
    },
    // 触摸事件
    touchstart(index) {
      this.Bg = index;
    },
    touchend() {
      this.Bg = "";
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

<style lang="scss" scoped>

.song-list {
  .song-list-head {
    margin: 20rpx 0 24rpx 34rpx;
    font-size: 32rpx;
    line-height: 32rpx;
    .del {
      float: right;
      margin-right: 20rpx;
      text-align: center;
      color: #777;
    }
  }
  .song-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 120rpx;
    .song-list-info {
      line-height: 50rpx;
      margin-left: 48rpx;
      padding-top: 10rpx;
      width: 90%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      .songName view:nth-child(1) {
        margin-top: 5rpx;
        font-size: 28rpx;
        font-weight: 600;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .songName view:nth-child(2) {
        font-size: 24rpx;
        color: #777;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-bottom: 10rpx;
      }
    }
  }
}
.Bg {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
