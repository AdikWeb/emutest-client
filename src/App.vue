<template>
  <div id="app">
    <canvas :width="widthScreen" :height="heightScreen" ref="canvas"/>
    <button v-if="nickname" class="connect" :disabled="connected" @click="connect">Connect</button>
    <input type="range" min="0" max="10" step="0.1" v-model="soundVolume"/>
    <label class="flex">
      <span>Nickname:</span>
      <input type="text" v-model="nickname">
    </label>
    <div class="flex">
      <select v-model="gamepadIndex">
        <option v-for="({id, index}, key) in getGamepadsList" :key="key" :value="index">{{ id }}</option>
      </select>
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
      widthScreen: 860,
      heightScreen: 640,
      socket: null,
      context: null,
      canvas: null,
      connected: false,
      soundShedTime: 0,
      audioContext: null,
      audioBuffer: null,
      soundVolume: 0,
      gamepads: {},
      gamepad: null,
      gamepadIndex: 2,
      nickname: Date.now(),
      pressedButtons: [],
    }
  },
  computed: {
    getGamepadsList() {
      return this.gamepads;
    }
  },
  watch: {
    gamepadIndex() {
      this.initGamepad()
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');

    document.addEventListener('keydown', (e) => {
      ControllerClass.keyboard(e, (value) => {
        this.pressedButtons.push(value);
        this.socket.emit('button', this.pressedButtons.reduce((a, b) => a + b, 0));
      })
    })

    document.addEventListener('keyup', (e) => {
      //TODO: Добавить отпускание кнопок и считывание состояний кнопок для удаления из массива.
      this.pressedButtons = [];
      ControllerClass.keyboard(e, () => {
        this.socket.emit('button', this.pressedButtons.reduce((a, b) => a + b, 0));
      })
    })

    window.addEventListener("gamepadconnected", () => {
      this.gamepads = navigator.getGamepads().filter((n) => n).map(({id, index}) => ({id, index}))
      this.initGamepad();
    });
  },
  methods: {
    initGamepad() {
      this.gamepad = navigator.getGamepads()[this.gamepadIndex]
      ControllerClass.init(true);
    },
    initKeyboard() {
      ControllerClass.init(false);
    },
    drawImage(data) {
      let image = new Image();
      image.onload = () => {
        this.context.clearRect(0, 0, this.widthScreen, this.heightScreen)
        this.context.drawImage(image, 0, 0, this.widthScreen, this.heightScreen);
      };
      image.src = data;
    },

    gamepadScan() {
      if (this.gamepad) {
        navigator.getGamepads()[this.gamepadIndex].buttons.forEach((button, index) => {
          ControllerClass.gamepad(index, button.value, (indexCode) => button.value && this.pressedButtons.push(indexCode))
        });
        this.socket.emit('button', this.pressedButtons.reduce((a, b) => a + b, 0))
      }
    },


    connect() {
      this.connected = true;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 44100});
      this.audioBuffer = this.audioContext.createBuffer(2, 736, 44100);

      // this.socket = io("http://51.250.77.85:3000")
      this.socket = io("ws://localhost:3000", {
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('connected');
      });

      this.socket.on('frame', (data) => {
        this.gamepadScan()
        this.drawImage(data.image);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_l), 0);
        this.audioBuffer.copyToChannel(new Float32Array(data.audio_r), 1);
        this.sound();
      });

      this.initKeyboard();
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
