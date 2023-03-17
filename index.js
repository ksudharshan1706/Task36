import express from "express";
import { MongoClient } from "mongodb"; //npm i mongodb
import dotenv from "dotenv"; //to connect .env contents over here //npm i dotenv
//const express = require("express"); type in package.json should be commonjs // importing 3rd party package
const app = express(); // has all the rest api methods => GET,POST,PUT,DELETE
dotenv.config();
const PORT = process.env.PORT;
//const MONGO_URL = "mongodb://127.0.0.1"; // this url is responsible for connecting the DB.
const MONGO_URL = process.env.MONGO_URL;
console.log(PORT, MONGO_URL);
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is Connected");
  return client;
}

const client = await createConnection();

app.use(express.json());

app.get("/", async function (req, resp) {
  const result = await client.db("b39we").collection("Room").find({}).toArray();

  result ? resp.send(result) : resp.status(404).send("Empty Room not Found");
});

app.post("/CreateRoom", async function (req, resp) {
  const data = req.body;
  console.log(data);
  const result = await client.db("b39we").collection("Room").insertMany(data);
  resp.send(result);
});

app.get("/AvailableRoom", async function (req, resp) {
  const result = await client
    .db("b39we")
    .collection("Room")
    .find({ Booked: "False" })
    .toArray();

  result ? resp.send(result) : resp.status(404).send("Empty Room not Found");
});

app.post("/BookRoom", async function (req, resp) {
  const Data = req.body;
  const date = new Date().toString();
  const bookStatus = { Booked: "True" };

  var AvailableRoom = await client
    .db("b39we")
    .collection("Room")
    .findOne({ Booked: "False" });

  if (AvailableRoom === null) {
    resp.send({ Message: "No Rooms Available!! create a room!!" });
  }
  const updateData = { RoomId: AvailableRoom.id, date: date };
  var result = await client
    .db("b39we")
    .collection("BookedRoom")
    .insertOne(Data);

  result = await client
    .db("b39we")
    .collection("BookedRoom")
    .updateOne({ RoomId: "" }, { $set: updateData });

  AvailableRoom = await client
    .db("b39we")
    .collection("Room")
    .updateOne({ id: AvailableRoom.id }, { $set: bookStatus });

  resp.send(result);
});

app.put("/VacateRoom/:id", async function (req, resp) {
  const { id } = req.params;
  const bookStatus = { Booked: "False" };

  const result = await client
    .db("b39we")
    .collection("BookedRoom")
    .deleteOne({ RoomId: parseInt(id) });
  if (result.deletedCount > 0) {
    await client
      .db("b39we")
      .collection("Room")
      .updateOne({ id: parseInt(id) }, { $set: bookStatus });
  }
  result.deletedCount > 0
    ? resp.send(result)
    : resp.status(404).send("Room already empty");
});

app.get("/BookedRooms", async function (req, resp) {
  const result = await client
    .db("b39we")
    .collection("BookedRoom")
    .find({})
    .toArray();

  result ? resp.send(result) : resp.status(404).send("No rooms are booked!!");
});

app.get("/BookedRooms/:id", async function (req, resp) {
  const { id } = req.params;
  const result = await client
    .db("b39we")
    .collection("BookedRoom")
    .find({ customerName: id })
    .toArray();

  result ? resp.send(result) : resp.status(404).send("No rooms are booked!!");
});

app.put("/UpdateAmenities/:id", async function (req, resp) {
  const { id } = req.params;
  const amenities = req.body;
  console.log(id, amenities);
  const result = await client
    .db("b39we")
    .collection("Room")
    .updateOne({ id: parseInt(id) }, { $set: amenities });

  resp.send(result);
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
