<template>
  <div id="app">
    <canvas tabindex="1" :width="widthScreen" :height="heightScreen" ref="canvas"/>
    <button v-if="nickname" class="connect" :disabled="connected" @click="connect">Connect</button>
    <input type="range" min="0" max="10" step="0.1" v-model="soundVolume" :defaultValue="soundVolume"/>
    <label class="flex">
      <span>Nickname:</span>
      <input type="text" v-model="nickname">
    </label>
    <label class="flex">
      <span>useGamepad:</span>
      <input type="checkbox" v-model="useGamepad">
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
      soundVolume: 0.1,
      gamepads: {},
      gamepad: null,
      gamepadIndex: 2,
      nickname: Date.now(),
      pressedButtons: [],
      useGamepad: false,
      playerController: new ControllerClass(),
      // testAudio: [],
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
    },
    useGamepad(val) {
      this.playerController.useGamepad = val
      val && this.initGamepad();
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.canvas.addEventListener('keydown', (e) => {
      e.preventDefault()
      this.playerController.keyboard(e)
    })

    this.canvas.addEventListener('keyup', (e) => {
      e.preventDefault()
      this.playerController.keyboard(e)
    })

    window.addEventListener("gamepadconnected", () => {
      this.gamepads = navigator.getGamepads().filter((n) => n).map(({id, index}) => ({id, index}))
      this.initGamepad();
    });

  },
  methods: {
    initGamepad() {
      this.gamepad = navigator.getGamepads()[this.gamepadIndex]
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
      if (this.useGamepad&&this.gamepad)
        this.playerController.pressedButtons = navigator.getGamepads()[this.gamepadIndex].buttons
            .reduce((acc, {value}, index) => (acc |= this.playerController.getInputCode(index) * value, acc), 0x0000)
    },

    connect() {
      this.connected = true;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({numberOfChannels: 2, sampleRate: 48000});
      this.audioBuffer = this.audioContext.createBuffer(2, 736, 48000);

      // this.socket = io("http://51.250.77.85:3000", {
      //   withCredentials: true
      // });
      this.socket = io("ws://localhost:3000", {
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('connected');
      });

      this.socket.on('frame', (data) => {
        this.gamepadScan()
        this.socket.emit('button', this.playerController.pressedButtons)
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
      source.start()
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
