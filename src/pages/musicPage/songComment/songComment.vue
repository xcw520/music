<template>
  <view class="commentPage">
    <u-navbar
      :background="{ backgroundColor: '#2F8EC6' }"
      back-icon-color="#fff"
      back-icon-size="38"
      :back-text="isTetx"
      :back-text-style="{
        color: '#fff',
        fontSize: '34rpx',
        marginLeft: '10rpx',
      }"
    ></u-navbar>
    <!-- 歌曲信息 -->
    <view class="newSong-list" v-if="comments.length !== 0">
      <view
        class="newSong-list-item"
        @click="modifyInfo"
        @touchstart="songBg = true"
        @touchend="songBg = false"
        :style="songBg ? 'background-color:rgba(0,0,0,.1)' : ''"
      >
        <u-image
          :src="songInfo.picUrl"
          mode="widthFix"
          width="120"
          border-radius="7px"
        ></u-image>
        <view class="newSong-list-info">
          <view class="newSongName">
            <view>{{ songInfo.name }}</view>
            <view>­­­­­­­­­­{{ songInfo.singerName }}</view>
          </view>
          <u-icon name="arrow-right" color="#666" size="32"></u-icon>
        </view>
      </view>
    </view>

    <!-- 热门评论 -->
    <view class="hotComments" v-if="hotComments.length !== 0">
      <view style="font-weight: 700; font-size: 30rpx; margin-bottom: 20rpx"
        >热门评论</view
      >
      <view
        class="hotCommentsItem"
        v-for="item in hotComments"
        :key="item.commentId"
      >
        <!-- 头像 -->
        <u-image
          :src="item.user.avatarUrl"
          mode="widthFix"
          height="90rpx"
          width="90rpx"
          shape="circle"
        ></u-image>
        <!-- 评论 -->
        <view class="content">
          <view class="info">
            <view class="user">
              <view>{{ item.user.nickname }}</view>
              <view style="font-size: 24rpx; color: #777">{{
                item.time | date
              }}</view>
            </view>
            <view class="likedCount">
              {{ item.likedCount }}
              <image src="http://lcxcw.club/music/static/icon/zan.png" style="margin-left: 6rpx;width:30rpx;height:30rpx;">
            </view>
          </view>
          <view class="text">
            {{ item.content }}
            <view class="beRepliedComment" v-if="item.beReplied.length !== 0">
              <view
                style="background-color: #f1f1f4; color: #111; padding: 10rpx"
              >
                <text style="color: #333">{{
                  item.beReplied[0].user.nickname + ": "
                }}</text>
                {{ item.beReplied[0].content }}
              </view>
              <!-- 清除父盒子浮动让父盒子自适应高度 -->
              <div class="clearfloat"></div>
            </view>
          </view>
        </view>
        <div class="clearfloat"></div>
      </view>
    </view>

    <!-- 最新评论 -->
    <view class="newComments" v-if="comments.length !== 0">
      <view style="font-weight: 700; font-size: 30rpx; margin-bottom: 20rpx"
        >最新评论</view
      >
      <view
        class="hotCommentsItem"
        v-for="item in comments"
        :key="item.commentId"
      >
        <!-- 头像 -->
        <u-image
          :src="item.user.avatarUrl"
          mode="widthFix"
          height="90rpx"
          width="90rpx"
          shape="circle"
        ></u-image>
        <!-- 评论 -->
        <view class="content">
          <view class="info">
            <view class="user">
              <view>{{ item.user.nickname }}</view>
              <view style="font-size: 24rpx; color: #777">{{
                item.time | date
              }}</view>
            </view>
            <view class="likedCount">
              {{ item.likedCount }}
              <image src="http://lcxcw.club/music/static/icon/zan.png" style="margin-left: 6rpx;width:30rpx;height:30rpx;">
            </view>
          </view>
          <view class="text">
            {{ item.content }}
            <view class="beRepliedComment" v-if="item.beReplied.length !== 0">
              <view
                style="background-color: #f1f1f4; color: #111; padding: 10rpx"
              >
                <text style="color: #333">{{
                  item.beReplied[0].user.nickname + ": "
                }}</text>
                {{ item.beReplied[0].content }}
              </view>
              <!-- 清除父盒子浮动让父盒子自适应高度 -->
              <div class="clearfloat"></div>
            </view>
          </view>
        </view>
        <div class="clearfloat"></div>
      </view>
    </view>
    <view class="footer" v-if="isFooter">--------已经到底啦~--------</view>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      id: "",
      // 评论页数
      offset: 1,
      // 分页参数
      before: "",
      // 总的分页数
      total: "",
      // 热门评论
      hotComments: [],
      // 最新评论
      comments: [],
      isFooter: false,
      isLoading: true,
      // 歌曲信息
      songInfo: [],
      songBg: false,
      index: "",
    };
  },
  onLoad(option) {
    // 获取歌曲id
    this.id = option.id;
    this.index = this.subscript;
    this.songInfo = this.playList[this.subscript];
    this.getComment();
    if (this.hotComments.length !== 0) {
      this.isLoading = false;
    }
  },
  // 上拉加载更多
  onReachBottom() {
    if (this.total <= this.offset * 20) {
      return (this.isFooter = true);
    }
    this.offset++;
    this.getNewComment();
  },
  methods: {
    ...mapMutations(["getIndex", "getIsBtn"]),
    // 获取初始化评论数据
    async getComment() {
      const res = await this.$http({
        url: `comment/music?id=${this.id}&limit=20`,
      });
      this.total = res.data.total;
      this.hotComments = res.data.hotComments;
      this.comments = res.data.comments;
      this.before = res.data.comments[19].time;
    },
    async getNewComment(callBack) {
      wx.showLoading({ title: "获取更多评论中", icon: "loading", duration: 10000 });
      const res = await this.$http({
        url: `comment/music?id=${
          this.id + "&limit=20&offset=" + this.offset + "&before=" + this.before
        }`,
      });
      res.data.comments = res.data.comments || [];
      this.comments = [...this.comments, ...res.data.comments];
      if (res.data.comments.length < 20) return;
      this.before = res.data.comments[19].time;
      callBack && callBack();
      wx.hideLoading();
    },
    // 获得要播放音乐的索引
    modifyInfo() {
      this.getIndex(this.index);
      if (!this.isBtn && this.$audio.src) {
        this.$audio.play();
      }
      uni.navigateTo({
        url: `../musicPage`,
      });
      this.getIsBtn(true);
    },
  },
  computed: {
    ...mapState(["playList", "subscript", "isBtn"]),
    isTetx() {
      return `评论(${this.total})`;
    },
  },
};
</script>

<style lang="scss" scoped>
$bColor: #d83d34;
.clearfloat {
  clear: both;
  height: 0;
}
.commentPage {
  padding: 32rpx 32rpx 0 32rpx;
}
.hotCommentsItem {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}
.content {
  width: 80%;
  padding-top: 10rpx;
  border-bottom: 1px solid #eaeaea;
  .info {
    display: flex;
    justify-content: space-between;
    .likedCount {
      font-size: 24rpx;
      color: #777;
      margin-top: 10rpx;
    }
  }
  .text {
    padding: 16rpx 0 20rpx 0;
    color: #111;
  }
}
.newComments {
  margin-top: 60rpx;
}
.beRepliedComment {
  margin-top: 10rpx;
}
.footer {
  padding: 20rpx 0;
  font-size: 28rpx;
  text-align: center;
  color: #ccc;
}
.newSong-list {
  margin-bottom: 40rpx;
  border-bottom: #eaeaea solid 1px;
  .newSong-list-item {
    display: flex;
    margin-bottom: 28rpx;
    border-radius: 7px;
    height: 120rpx;
    .newSong-list-info {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: space-between;
      line-height: 50rpx;
      margin-left: 22rpx;
      padding-top: 8rpx;
      .newSongName view:nth-child(1) {
        font-size: 30rpx;
        font-weight: 600;
        width: 440rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .newSongName view:nth-child(2) {
        width: 440rpx;
        font-size: 24rpx;
        color: #777;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
