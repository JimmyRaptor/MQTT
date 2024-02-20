const { Client } = require("pg");

const client = new Client({
  user: "raptortech",
  host: "localhost",
  database: "mqtt",
  password: "raptortechAreCool1!",
  port: 5432,
});
function timestampToDateTimePlus30Years(timestamp) {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);
  //check if the data is less than 30 years
  if (date.getFullYear() < 2024) {
    // Add 30 years to the date
    date.setFullYear(date.getFullYear() + 30);
    console.log(date.getTime());
    console.log(date.toISOString());
  }
  // Return the new timestamp in seconds
  return date.toISOString();
}

client
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Could not connect to the database", error);
  });

// 定义插入数据函数
const insertDataRDN = async (data) => {
  try {
    const insertQuery = `
      INSERT INTO MQTTRDN (time, key,value, device_id) VALUES ($1, $2, $3,$4)
    `;
    const time = timestampToDateTimePlus30Years(data.ts * 1000);
    for (const [key, value] of Object.entries(data)) {
      await client.query(insertQuery, [time, key, value, data.id]);
    }
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Could not insert data", error);
  }
};

module.exports = insertDataRDN;
