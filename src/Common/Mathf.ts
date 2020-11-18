import {Common} from ".";

/**
 * The static class for Math related function
 */
export class Mathf {

    constructor() {
        throw new Error("This is a static class!");
    }


    // -------------------------------------------------------
    /** Check if an array is empty
     *   @static
     *   @param {any[]} array The array to test
     *   @returns {boolean}
     */
    static isEmpty(array) {
        return array[0] == null;
    }

    // -------------------------------------------------------
    /** Get the cos
     *   @static
     *   @param {number} w The value
     *   @returns {number}
     */
    static cos(w) {
        return parseFloat(Math.cos(w).toFixed(10));
    }

    /** Get the sin
     *   @static
     *   @param {number} w The value
     *   @returns {number}
     */
    static sin(w) {
        return parseFloat(Math.sin(w).toFixed(10));
    }

    /** Get portion according to a position
     *   @static
     *   @param {THREE.Vector3} position The position
     *   @returns {number[]}
     */
    static getPortion(position) {
        return this.getPortionArray(this.getPosition(position));
    }

    /** Get portion according to array position
     *   @static
     *   @param {number[]} p The array position
     *   @returns {number[]}
     */
    static getPortionArray(p) {
        return [
            Math.floor(p[0] / Common.PORTION_SIZE),
            Math.floor(p[1] / Common.PORTION_SIZE),
            Math.floor(p[2] / Common.PORTION_SIZE)
        ];
    }

    /** Get an array position according to position
     *   @static
     *   @param {THREE.Vector3} position The position
     *   @returns {number[]}
     */
    static getPosition(position) {
        return [
            Math.floor(position.x / Common.SQUARE_SIZE),
            Math.floor(position.y / Common.SQUARE_SIZE),
            Math.floor(position.z / Common.SQUARE_SIZE)
        ];
    }

    /** Give a modulo without negative value
     *   @static
     *   @param {number} x
     *   @param {number} m
     *   @returns {number}
     */
    static mod(x, m) {
        let r = x % m;
        return r < 0 ? r + m : r;
    }

    /** Get the list max ID
     *   @static
     *   @param {number[]} list A list containing only IDs
     *   @returns {number}
     */
    static getMaxID(list) {
        let max = 0;
        for (let i = 0, l = list.length; i < l; i++) {
            max = Math.max(list[i], max);
        }
        return max;
    }

    /** Create a random number between min and max
     *   @static
     *   @param {number} min
     *   @param {number} max
     *   @returns {number}
     */
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Clamp a number between two values.
     * @param {number} value
     * @param {number} min
     * @param {number} max
     */
    static clamp(value: number, min: number, max: number): number {
        return value <= min ? min : value >= max ? max : value;
    }
}