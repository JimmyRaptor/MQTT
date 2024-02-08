var timestamp = 760670471; // 这里以秒为单位的时间戳

// 创建一个新的 Date 对象，并将时间戳转换为毫秒
var date = new Date(timestamp * 1000);

// 将日期增加30年
date.setFullYear(date.getFullYear() + 30);

// 获取增加30年后的时间戳（以秒为单位）
var newTimestamp = Math.floor(date.getTime() / 1000);

console.log(date);