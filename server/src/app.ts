import Koa from 'koa';
import http from 'http';
import { Rooms } from './constants/interfaces';

const koa = new Koa();
const app = http.createServer(koa.callback());

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: app });

const rooms:Rooms = {};

wss.on('connection', function(ws:any, request:any) {

  const id:string = request.url;

  if (!rooms[id]) {
    rooms[id] = {connections:[], drawData:[]};
  } else {
    rooms[id].drawData.forEach((element:string) => ws.send(element));
  }
  rooms[id].connections.push(ws);
  
  ws.on('message', function(message:string) {
    rooms[id].drawData.push(message);
    rooms[id].connections.forEach(function each(connection:any) {
      if (connection !== ws && connection.readyState === WebSocket.OPEN) {
        connection.send(message);
      }
    });
  });

  ws.on('close', () => {
    let index = rooms[id].connections.indexOf(ws);
    rooms[id].connections.splice(index, 1);
    if (rooms[id].connections.length < 1) {
      delete rooms[id];
    }
  });
});

export {app}