const mqtt = require("mqtt");
const cbor = require("cbor");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const insertData = require("./pg_insert");
const insertDataRDN = require("./pg_insert_rdn");

const mqttUrl = "mqtt:35.247.9.156";
const options = {
  username: "test",
  password: "test",
};

async function connectAndSubscribeToMQTT() {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(mqttUrl, options);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      client.subscribe("/pk/telemetry/#", (err) => {
        if (err) {
          console.error("Subscription error:", err);
          reject(err);
        } else {
          console.log("Successfully subscribed to topic");
          resolve();
        }
      });
    });

    client.on("message", (topic, message) => {
      handleMessage_encode(topic, message);
      //handleMessage(topic, message, idDescriptionMap);
    });
  });
}

async function handleMessage_encode(topic, message) {
  const logFilePath = "received_messages_encode.json";

  //console.log(`Received message from topic: ${topic}`);

  const readableStream = Readable.from([message]);

  // 尝试使用CBOR解析
  const cborParser = new cbor.Decoder();
  let isCborParsedSuccessfully = false; // 标记是否成功使用CBOR解析且解析出的对象是Map实例

  cborParser.on("data", async (data) => {
    if (data instanceof Map) {
      //console.log("New data:", data); // Log the new data
      const newData = Object.fromEntries(data)
      //console.log(newData)
      newData.id = topic.split("/")[3];
      await insertData(newData);
      await insertDataRDN(newData);
      //const jsonData = JSON.stringify(newData);
      // 将解析后的数据转换为 JSON 字符串
      //const jsonData = JSON.stringify(Object.fromEntries(data));

      // 将 JSON 数据追加到日志文件中
      // fs.appendFile(logFilePath, jsonData + "\n", (err) => {
      //   if (err) {
      //     console.error("Error writing to log file:", err);
      //   } else {
      //     console.log("Data written to log file successfully.");
      //   }
      // });

      isCborParsedSuccessfully = true; // 成功解析CBOR且对象是Map实例
    }
  });

  cborParser.on("error", (err) => {
    console.log("CBOR parsing error:", err.message);
  });

  readableStream.on("data", (chunk) => {
    cborParser.write(chunk);
  });
}

async function processData() {
  await connectAndSubscribeToMQTT();
}

processData();
