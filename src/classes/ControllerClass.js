const ButtonsMap = new Map([
    ['start', {index: 15, value: 1}],
    ['a', {index: 10, value: 1}],
    ['b', {index: 11, value: 1}],
    ['c', {index: 9, value: 1}],
    ['x', {index: 8, value: 1}],
    ['y', {index: 12, value: 1}],
    ['z', {index: 13, value: 1}],
    ['up', {index: 7, value: -1}],
    ['down', {index: 7, value: 1}],
    ['left', {index: 6, value: -1}],
    ['right', {index: 6, value: 1}],
])

const KeyboardCodeMapDefault = new Map([
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

const GamepadCodeMapDefault = new Map([
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

export class ControllerClass {
    keyMap = null;
    static useController = true

    static init() {
        //TODO Create localStorage keymap
        if (!this.keyMap) this.keyMap = new Map();
        //if local storage = empty - use default map
        (this.useController ? GamepadCodeMapDefault : KeyboardCodeMapDefault).forEach((index, code) => {
            this.keyMap.set(code, {index, state: false})
        })
    }

    static gamepad(index, state, callback) {
        if (this.keyMap.has(index)) {
            const {index: indexCode, value} = ButtonsMap.get(this.keyMap.get(index)?.index);
            callback(indexCode, value)
        }
    }

    static keyboard(e, callback) {
        const {keyCode, type} = e
        if (this.keyMap.has(keyCode)) {
            if (type === 'keydown') {
                this.keyMap.get(keyCode).state = true;
                callback(ButtonsMap.get(this.keyMap.get(keyCode).index), 'keydown')
            } else if (type === 'keyup') {
                this.keyMap.get(keyCode).state = false;
                callback(ButtonsMap.get(this.keyMap.get(keyCode).index), 'keyup')
            }
        }
    }
}