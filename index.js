import express from "express";
import { MongoClient } from "mongodb";
//const express = require("express"); type in package.json should be commonjs // importing 3rd party package
const app = express(); // has all the rest api methods => GET,POST,PUT,DELETE

const PORT = 6000;
//const MONGO_URL = "mongodb://127.0.0.1"; // this url is responsible for connecting the DB.
const MONGO_URL =
  "mongodb+srv://sudharshan:sudharshan@cluster0.vrgbtiq.mongodb.net";
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(express.json());

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
    .collection("Room")
    .find({ Booked: "True" })
    .toArray();

  result ? resp.send(result) : resp.status(404).send("No rooms are booked!!");
});
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
