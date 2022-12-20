export const CONTROLS = {
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

export class ControllerClass {
    pressedButtons = 0x0000;
    useGamepad = false;
    gamepadButtonsMap = new Map([
        [9, 'start'],
        [12, 'up'],
        [13, 'down'],
        [14, 'left'],
        [15, 'right'],
        [0, 'a'],
        [4, 'b'],
        [1, 'c'],
        [2, 'x'],
        [5, 'y'],
        [3, 'z'],
    ])

    keyboardButtonsMap = new Map([
        [32, 'start'],
        [87, 'up'],
        [83, 'down'],
        [65, 'left'],
        [68, 'right'],
        [75, 'a'],
        [76, 'b'],
        [186, 'c'],
        [73, 'x'],
        [79, 'y'],
        [80, 'z'],
    ])

    keyMap = {
        'start': CONTROLS.INPUT_START,
        'a': CONTROLS.INPUT_A,
        'b': CONTROLS.INPUT_B,
        'c': CONTROLS.INPUT_C,
        'x': CONTROLS.INPUT_X,
        'y': CONTROLS.INPUT_Y,
        'z': CONTROLS.INPUT_Z,
        'up': CONTROLS.INPUT_UP,
        'down': CONTROLS.INPUT_DOWN,
        'left': CONTROLS.INPUT_LEFT,
        'right': CONTROLS.INPUT_RIGHT,
    }

    constructor(useController = false) {
        this.useGamepad = useController;
    }

    get pressedButtons() {
        return this.pressedButtons;
    }

    set pressedButtons(value) {
        this.pressedButtons = value;
    }

    get controllerTypeName() {
        return this.useGamepad ? 'GAMEPAD' : 'KEYBOARD'
    }

    get controller() {
        return this.useGamepad ? this.gamepadButtonsMap : this.keyboardButtonsMap
    }

    set useGamepad(val) {
        this.useGamepad = val;
    }

    getInputCode(index){
        return this.keyMap[this.controller.get(index)]
    }

    keyboard(e) {
        const {keyCode} = e
        if (!this.useGamepad&&!this.controller.has(keyCode)) return;
        const input = this.getInputCode(keyCode);
        e.type === 'keydown' ? this.pressedButtons |= input : this.pressedButtons ^= input
    }
}