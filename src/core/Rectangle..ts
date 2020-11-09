

export class Rectangle {

    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;

    constructor(x = 0, y = 0, width = 10, height = 10) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
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

    public get width(): number {
        return this._width;
    }

    public set width(value: number){
        this._width = value;
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number){
        this._height = value;
    }
}