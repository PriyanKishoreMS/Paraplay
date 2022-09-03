const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	},
});

io.on("connection", socket => {
	console.log(`User ${socket.id} connected`);
	socket.on("disconnect", () => {
		console.log(`User ${socket.id} disconnected`);
	});

	socket.on("send-url", (id, room) => {
		io.to(room).emit("recv-url", id);
	});

	socket.on("send-data", (data, room) => {
		io.to(room).emit("recv-data", data);
	});

	socket.on("send-state", (state, room) => {
		io.to(room).emit("recv-state", state);
	});

	socket.on("send-seek", (seek, room) => {
		io.to(room).emit("recv-seek", seek);
	});

	socket.on("send-rewind", (rewind, room) => {
		io.to(room).emit("recv-rewind", rewind);
	});

	socket.on("send-forward", (forward, room) => {
		io.to(room).emit("recv-forward", forward);
	});

	socket.on("send-rate", (rate, room) => {
		io.to(room).emit("recv-rate", rate);
	});

	socket.on("join-room", room => {
		socket.join(room);
		console.log(`User ${socket.id} joined ${room}`);
	});

	socket.on("leave-room", room => {
		socket.leave(room);
		console.log(`User ${socket.id} left ${room}`);
	});
});

server.listen(process.env.PORT || 5000, () => {
	console.log("Server is running on port 5000");
});
