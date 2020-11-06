/**
 * The data class who hold 3D coordinates.
 */
export class Coordinate3D {

    private _x: number;
    private _y: number;
    private _z: number;

    private _freeze: boolean;

    /**
     * The data class who hold 3D Coordinate.
     * @param {number} x the x-axis coordinate in float
     * @param {number} y the y-axis coordinate in float
     * @param {number} z the z-axis coordinate in float
     * @param {boolean} freeze whether or not to freeze the coordinates
     */
    constructor(x = 0, y = 0, z = 0, freeze = false) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._freeze = freeze;
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

    public reset(){
        this._x = 0;
        this._y = 0;
        this._z = 0;
    }

    public copy(): {x: number,y: number, z: number} {
        return  {
            x: this._x,
            y: this._y,
            z: this._z
        }
    }
    public freeze(){
        this._freeze = true;
    }

    public unfreeze(){
        this._freeze = false;
    }


}