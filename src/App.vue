<template>
  <div id="app">
    <canvas width="640" height="480" ref="canvas"/>
    <button class="connect" @click="connect">Connect</button>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'App',
  data(){
    return {
      socket: null,
      context: null,
      canvas: null
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
  },
  methods:{
    drawImage(data){
      let image = new Image();
      image.onload = ()=>{
        this.context.clearRect(0,0,640,480)
        this.context.drawImage(image, 0, 0);
      };
      image.src = data;
    },

    connect(){

      this.socket = io("ws://localhost:3000");
      this.socket.on('connect', ()=>{
        console.log('connected');
      });
      this.socket.on('image', (data)=>{
        this.drawImage(data);
      });
    }
  }
}
</script>

<style>
canvas{
  background: #000;
  margin: 0 auto;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  margin: auto;
}
.connect {
  width: 640px;
  height: 50px;
  background: #000;
  color: #fff;
  border: none;
  margin: 0 auto;
}

</style>
