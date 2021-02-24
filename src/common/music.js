const music = {
    // 获取歌曲url
    async getSongUrl(id, _this) {
        const res = await _this.$http({
            url: `song/url?id=${id}`,
        });
        return res.data.data[0].url || [];
    },
    // 获取歌曲详情
    async getSongInfo(id, _this) {
        const res = await _this.$http({
            url: `song/detail?ids=${id}`,
        });
        return res.data.songs[0].al.picUrl || [];
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
}

export default music;