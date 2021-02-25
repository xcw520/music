<template>
  <view class="search">
    <!-- 头部导航栏 -->
    <u-navbar
      back-icon-name="search"
      back-icon-color="#fff"
      back-icon-size="40"
      :background="{ background: '#2F8EC6' }"
    >
      <view class="slot-wrap">
        <u-search
          @search="getSearch"
          :show-action="false"
          color="rgba(255,255,255,.9)"
          placeholder-color="rgba(255,255,255,.5)"
          bg-color=""
          search-icon=""
          :placeholder="defaultSearch"
          v-model="search"
        ></u-search>
      </view>
    </u-navbar>

    <!-- 热搜榜 -->
    <view class="hotSearch" v-if="!search">
      <view class="hotSearch-title"> 热搜榜 </view>
      <view
        class="hotSearch-itme"
        :class="hotSearchBg === index ? 'hotSearchBg' : ''"
        v-for="(item, index) in hotSearch"
        :key="item.score"
        @click="searchClick(item.searchWord)"
        @touchstart="touchstart(index)"
        @touchend="touchend"
      >
        <view class="item-index" :class="index < 3 ? 'top-threeC' : ''">{{
          index + 1
        }}</view>
        <view class="item-info">
          <view class="item-name" :class="index < 3 ? 'top-three' : ''">
            {{ item.searchWord }}
            <image
              :src="item.iconUrl"
              v-if="item.iconUrl !== null"
              mode="widthFix"
              class="item-icon"
            ></image>
          </view>
          <view class="item-content">{{ item.content }}</view>
        </view>
        <view class="item-score">{{ item.score }}</view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="song-list" v-else>
      <view class="song-list-head">
        <u-icon
          name="play-circle"
          color="#333"
          size="36"
          style="margin-right: 15rpx"
        ></u-icon>
        播放全部
      </view>
      <view
        class="song-list-item"
        :class="hotSearchBg === index ? 'hotSearchBg' : ''"
        v-for="(item, index) in searchResult"
        :key="item.id"
        @touchstart="touchstart(index)"
        @touchend="touchend"
        @click="goPlayMusic(searchResult, index)"
      >
        <view class="song-list-info">
          <view class="songName">
            <view>
              {{ item.name }}
              <text v-if="item.alias.length !== 0" style="color: #666"
                >({{ item.alias[0] }})</text
              >
            </view>
            <view>­­­­­­­­­­{{ item.singerName + " - " + item.name }}</view>
          </view>
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
      search: "",
      defaultSearch: "输入要搜索的歌曲名称",
      realkeyword: "",
      hotSearch: [],
      // 控制背景
      hotSearchBg: "",
      // 搜索结果
      searchResult: null,
    };
  },
  onShow() {
    this.defaultSearch = "输入要搜索的歌曲名称";
    this.search = "";
  },
  onLoad() {
    this.getHotSearch();
  },
  onUnload() {
    clearInterval(this.$setTimeout);
  },
  methods: {
    ...mapMutations(["getIndex", "getPlayList", "getIsBtn"]),
    // 获取热搜排行榜
    async getHotSearch() {
      const res = await this.$http({
        url: "search/hot/detail",
      });
      res.data.data = res.data.data || [];
      res.data.data.forEach((item) => {
        if (
          item.iconUrl !=
          "https://p1.music.126.net/2zQ0d1ThZCX5Jtkvks9aOQ==/109951163968000522.png"
        ) {
          item.iconUrl = "";
        }
      });
      this.hotSearch = res.data.data;
    },
    // 搜索触发事件
    getSearch() {
      if (this.search === "") {
        this.search = this.realkeyword;
      }
      this.getSongs();
    },
    searchClick(item) {
      this.search = item;
      this.getSongs();
    },
    // 搜索歌曲
    async getSongs() {
      if (this.search) {
        const res = await this.$http({
          url: `search?keywords=${this.search}`,
        });
        res.data.result.songs = res.data.result.songs || [];
        res.data.result.songs.forEach(async (item, index) => {
          item.singerName = this.$music.isArtists(item.artists);
          item.picUrl = await this.$music.getSongInfo(item.id, this);
          item.url = await this.$music.getSongUrl(item.id, this);
          return;
        });
        this.searchResult = res.data.result.songs || [];
      }
    },
    // 去歌曲页面
    goPlayMusic(list, i) {
      // console.log(list);
      if (this.searchResult[i].url == null) {
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
      this.$setTimeout = setTimeout(function(){
        uni.navigateTo({
          url: `/pages/musicPage/musicPage`,
        });},1000);
      this.getIsBtn(true);
    },
    // 触摸事件
    touchstart(index) {
      this.hotSearchBg = index;
    },
    touchend() {
      this.hotSearchBg = "";
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

$bColor: #d83d34;
.slot-wrap {
  width: 85%;
}
.hotSearch {
  margin-top: 30rpx;
  .hotSearch-title {
    font-weight: 600;
    margin-left: 30rpx;
  }
}
.hotSearch-itme {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 120rpx;
  .item-index {
    margin: 0 30rpx;
  }
  .item-score {
    font-size: 24rpx;
    color: #666;
    margin-right: 30rpx;
  }
  .item-info {
    width: 500rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .item-name {
      display: flex;
      align-items: center;
      color: #333;
      font-size: 28rpx;
    }
    .item-icon {
      margin-left: 12rpx;
      width: 60rpx;
      height: 60rpx;
    }
    .item-content {
      font-size: 24rpx;
      color: #666;
    }
  }
}
.song-list {
  .song-list-head {
    margin: 20rpx 0 24rpx 34rpx;
    font-size: 32rpx;
    line-height: 32rpx;
  }
  .song-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 120rpx;
    .song-list-info {
      line-height: 50rpx;
      margin-left: 48rpx;
      padding-top: 8rpx;
      width: 600rpx;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      .songName view:nth-child(1) {
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
      }
    }
  }
}
.top-three {
  font-weight: 600;
}
.top-threeC {
  color: $bColor;
}
.hotSearchBg {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
