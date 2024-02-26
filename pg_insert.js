const { Client } = require("pg");

const client = new Client({
  user: "raptortech",
  host: "localhost",
  database: "mqtt",
  password: "raptortechAreCool1!",
  port: 5432,
});
function timestampToDateTimePlus30YearsInSeconds(timestamp) {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);
  if (date.getFullYear() < 2024) {
    // Add 30 years to the date
    date.setFullYear(date.getFullYear() + 30);
  }
  console.log(date.getTime());
  console.log(date.toISOString());
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

const insertData = async (data) => {
  try {
    const insertQuery = `
      INSERT INTO MQTTJSON (time, data, device_id) VALUES ($1, $2, $3)
    `;
    const time = timestampToDateTimePlus30YearsInSeconds(data.ts * 1000);
     await client.query(insertQuery, [time, data, data.id]);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Could not insert data", error);
  }
};

module.exports = insertData;
