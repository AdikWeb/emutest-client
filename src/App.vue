<template>
  <div id="app">
    <canvas width="640" height="480" ref="canvas"/>
    <button class="connect" :disabled="connected" @click="connect">Connect</button>
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
      canvas: null,
      connected: false,
      soundShedTime: 0,
      audioContext: null,
      audioBuffer: null
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
      this.connected = true;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 44100});
      this.audioBuffer = this.audioContext.createBuffer(2, 736, 44100);

      // this.socket = io("ws://51.250.77.85:3000")
      this.socket = io("ws://localhost:3000");
      this.socket.on('connect', ()=>{
        console.log('connected');
      });
      this.socket.on('frame', (data)=>{
        this.drawImage(data.image);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_l), 0);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_r), 1);
        this.sound();
      });
    },
    sound() {
      let source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.05;
      source.buffer = this.audioBuffer;
      source.connect(gainNode).connect(this.audioContext.destination);
      let currentSoundTime = this.audioContext.currentTime;
      if(currentSoundTime < this.soundShedTime) {
          source.start(this.soundShedTime);
          this.soundShedTime += this.audioBuffer.duration;
      } else {
          source.start(currentSoundTime);
          this.soundShedTime = currentSoundTime + this.audioBuffer.duration + 736 * 8 / 44100;
      }
    },
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
.connect:disabled {
  background: #ccc;
  color: #000;
}

</style>
