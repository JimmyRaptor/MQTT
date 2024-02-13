const mqtt = require("mqtt");
const cbor = require("cbor");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const csv = require("csv-parser");

// MQTT服务器URL和连接选项
const mqttUrl = "mqtt:35.247.9.156";
const options = {
  username: "test",
  password: "test",
};
const client = mqtt.connect(mqttUrl, options);

const messagesFilePath = path.join(__dirname, "received_messages.json");

const idDescriptionMap = new Map();

async function processData() {
  const idDescriptionMap = new Map();

  const stream = fs
    .createReadStream("RDN_Master_0.3.csv", { encoding: "utf8" })
    .pipe(csv({ headers: false }));

  for await (const row of stream) {
    const id = parseInt(row[0]);
    const description = row[1];
    if (!isNaN(id) && description) {
      idDescriptionMap.set(id, description);
    }
  }

  console.log(idDescriptionMap);
  console.log(idDescriptionMap.get(6));
}

processData()
  .then(() => {
    console.log("Processing complete.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

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
  console.log(topic.split("/")[3]);
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
});
