<template>
  <div id="app">
    <canvas :width="widthScreen" :height="heightScreen" ref="canvas"/>
    <button class="connect" :disabled="connected" @click="connect">Connect</button>
    <input type="range" min="0" max="10" step="0.1" v-model="soundVolume"/>
    <div class="flex">
      <button @click="testGamepad(i)" v-for="i in 30" :key="i">{{i}}</button>
    </div>
    <div class="flex">
      <button @click="testGamepad(30+i)" v-for="i in 30" :key="-i">{{30+i}}</button>
    </div>
    <div class="flex">
      <button @click="testGamepad(i)" v-for="i in Object.values(CONTROLS)" :key="-i">{{i}}</button>
    </div>
  </div>
</template>

<script>
import {io} from 'socket.io-client';
import {ControllerClass} from "@/classes/ControllerClass";

export default {
  name: 'App',
  data() {
    return {
      widthScreen: 1280,
      heightScreen: 1024,
      socket: null,
      context: null,
      canvas: null,
      connected: false,
      soundShedTime: 0,
      audioContext: null,
      audioBuffer: null,
      soundVolume: 0,
      gamepadIndex: 1,
      CONTROLS: {
        INPUT_MODE: 0x0800,
        INPUT_X: 0x0400,
        INPUT_Y: 0x0200,
        INPUT_Z: 0x0100,
        INPUT_START: 0x0080,
        INPUT_A: 0x0040,
        INPUT_C: 0x0020,
        INPUT_B: 0x0010,
        INPUT_RIGHT: 0x0008,
        INPUT_LEFT: 0x0004,
        INPUT_DOWN: 0x0002,
        INPUT_UP: 0x0001
      }
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
    ControllerClass.init();
    document.addEventListener('keydown', (e) => {
      ControllerClass.keyboard(e, ({value, index}) => {
        this.socket.emit('button', value, index)
      })
    })

    document.addEventListener('keyup', (e) => {
      ControllerClass.keyboard(e, ({index}) => {
        this.socket.emit('button', 0, index)
      })
    })

  },
  methods: {
    drawImage(data) {
      let image = new Image();
      image.onload = () => {
        this.context.clearRect(0, 0, this.widthScreen, this.heightScreen)
        this.context.drawImage(image, 0, 0, this.widthScreen, this.heightScreen);
      };
      image.src = data;
    },

    gamepadScan() {
      let gamepads = navigator.getGamepads();
      if (gamepads.length && gamepads[this.gamepadIndex]) {
        let gamepad = gamepads[this.gamepadIndex];
        let duplicateCode = [];
        gamepad.buttons.forEach((button, index) => {
          ControllerClass.gamepad(index, button.value, (indexCode, value) => {
            if (!duplicateCode.includes(indexCode)) this.socket.emit('button', button.value * value, indexCode)
            if (button.value && value === -1) duplicateCode.push(indexCode)
          })
        });
      }
    },

    connect() {
      this.connected = true;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 44100});
      this.audioBuffer = this.audioContext.createBuffer(2, 736, 44100);

      // this.socket = io("http://51.250.77.85:3000")
      this.socket = io("ws://localhost:3000");

      this.socket.on('connect', () => {
        console.log('connected');
      });

      this.socket.on('frame', (data) => {
        this.gamepadScan()


        // if (width != lastWidth || height != lastHeight) {
          // lastWidth = width;
          // lastHeight = height;
          // SetCanvasSize(lastWidth, lastHeight);
        // }

        this.drawImage(data.image);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_l), 0);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_r), 1);
        this.sound();
      });
    },

    sound() {
      let source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.soundVolume;
      source.buffer = this.audioBuffer;
      source.connect(gainNode).connect(this.audioContext.destination);
      let currentSoundTime = this.audioContext.currentTime;
      if (currentSoundTime < this.soundShedTime) {
        source.start(this.soundShedTime);
        this.soundShedTime += this.audioBuffer.duration;
      } else {
        source.start(currentSoundTime);
        this.soundShedTime = currentSoundTime + this.audioBuffer.duration + 736 * 8 / 44100;
      }
    },

    testGamepad(index){
      this.socket.emit('button', index, index)
      setTimeout(()=>{
        this.socket.emit('button', 0, index)
      }, 200)
    }
  }
}
</script>

<style>
.flex {
  display: flex;
}

canvas {
  background: #000;
  margin: 0 auto;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  margin: auto;
  align-items: center;
}

.connect {
  width: 640px;
  height: 50px;
  background: #000;
  color: #fff;
  border: none;
}

.connect:disabled {
  background: #ccc;
  color: #000;
}

</style>
