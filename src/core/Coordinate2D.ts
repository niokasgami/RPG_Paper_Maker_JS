
/**
 * The data class who hold 2D coordinates.
 * @author Nio Kasgami
 */
export class Coordinate2D {

    private _x: number;
    private _y: number;
    private _freeze: boolean;

    /**
     * The data class who hold 2D coordinates.
     * @param x the x axis
     * @param y the y axis
     * @param freeze wether or not if the coordinates or frozens.
     */
    constructor(x = 0, y = 0, freeze = false){
        this._x = x;
        this._y = y;
        this._freeze = freeze;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number){
        if(!this._freeze){
            this._x = value;
        } else {
            throw new Error("Impossible to transform the coordinate while being frozen.");
        }
    }

    public get y(): number  {
        return this._y;
    }

    public set y(value: number){
        if(!this._freeze){
            this._x = value;
        } else {
            throw new Error("Impossible to transform the coordinate while being frozen.");
        }
    }

    public get freeze(): boolean {
        return this._freeze;
    }

    public set freeze(value: boolean) {
        this._freeze = value;
    }

    public isCoordinatesFrozen(): boolean {
        return this._freeze;
    }
}
