const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const superheroes = require("superheroes");

const io = new Server(server, {
	cors: {
		origin: "https://localhost:3000",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	},
});

io.on("connection", socket => {
	const username = superheroes.random();
	const users = {};
	users[socket.id] = username;
	console.log(`User ${users[socket.id]} connected`);

	socket.on("disconnect", () => {
		console.log(`User ${users[socket.id]} disconnected`);
	});

	socket.on("send-url", (id, room) => {
		io.to(room).emit("recv-url", id);
	});

	socket.on("send-data", (data, room) => {
		// const clients = io.sockets.adapter.rooms.get(room);
		// const first = [...clients][0];
		// console.log(first);
		// if (first === socket.id)
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
		console.log(`User ${users[socket.id]} joined ${room}`);
		const clients = io.sockets.adapter.rooms.get(room);
		if (clients.size > 1) {
			console.log(`Users in ${room}: ${clients.size}`);
			console.log(clients);
			console.log("\n");
		}
	});

	socket.on("leave-room", room => {
		socket.leave(room);
		console.log(`User ${users[socket.id]} left ${room}`);
	});
});

server.listen(process.env.PORT || 5000, () => {
	console.log("Server is running on port 5000");
});
