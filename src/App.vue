<template>
  <div id="app">
    <button @click="connect">Connect</button>
    <canvas width="500" height="500" ref="canvas"/>
  </div>
</template>

<script>

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
        this.context.clearRect(0,0,500,500)
        this.context.drawImage(image, 0, 0);
      };
      image.src = data;
    },

    connect(){
      // this.socket = new WebSocket('ws://51.250.77.85:3000');
      this.socket = new WebSocket('ws://localhost:3000');

      this.socket.addEventListener('open', ()=>{
        this.socket.send('Hello Server!');
      });

      this.socket.addEventListener('message', (event)=>{
        console.log(event.data)
        // this.drawImage(event.data.img)
      });
    }
  }
}
</script>

<style>
canvas{
  background: #000;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
