/**
 * The data class who hold 3D coordinates.
 */
export class Coordinate3D {

    private _x: number;
    private _y: number;
    private _z: number;

    /**
     * The data class who hold 3D Coordinate.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x = 0, y = 0, z = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public get x(): number {
        return  this._x;
    }

    public  set x(value) {
        this._x = value;
    }

    public get y(): number {
        return  this._y;
    }

    public set y(value){
        this._y = value;
    }

    public get z(): number {
        return  this._z;
    }

    public set z(value){
        this._z = value;
    }
}