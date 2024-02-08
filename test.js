const mqtt = require("mqtt");
const cbor = require("cbor");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const split = require("split2");
const { type } = require("os");

// MQTT服务器URL和连接选项
const mqttUrl = "mqtt:35.247.9.156";
const options = {
  username: "test",
  password: "test",
};
const client = mqtt.connect(mqttUrl, options);

const messagesFilePath = path.join(__dirname, "received_messages.txt");

client.on("connect", () => {
  console.log("Connected to MQTT Broker");
  client.subscribe("/pk/telemetry/#", (err) => {
    if (err) {
      console.error("Subscription error:", err);
    } else {
      console.log("Successfully subscribed to topic");
    }
  });
});

client.on("message", (topic, message) => {
  console.log(topic.split("/")[3] );
  console.log(`Received message from topic: ${topic}`);
  const readableStream = Readable.from([message]);

  // 尝试使用CBOR解析
  const cborParser = new cbor.Decoder();
  let isCborParsedSuccessfully = false; // 标记是否成功使用CBOR解析且解析出的对象是Map实例

  cborParser.on("data", (data) => {
    if (data instanceof Map) {
      console.log(data);
      isCborParsedSuccessfully = true; // 成功解析CBOR且对象是Map实例
    } 
  });

  cborParser.on("error", (err) => {
    console.log("CBOR parsing error, trying UTF-8:", err.message);
  });

  readableStream.on("data", (chunk) => {
    cborParser.write(chunk);
  });

  // 在流结束时检查是否成功解析，如果没有或解析出的不是Map实例，则尝试UTF-8
  readableStream.on("end", () => {
    if (!isCborParsedSuccessfully) {
      const text = message.toString("utf-8");
      console.log(
        "Parsed data with UTF-8 (end) or data is not a Map instance:",
        text
      );
    }
  });
});
